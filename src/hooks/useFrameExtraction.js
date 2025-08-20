import { useCallback, useRef, useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '../Context/authContext';
import { VIDEO_CONFIG } from '../constants/videoConfig';
import { v4 as uuidv4 } from 'uuid';

// FrameProcessor 클래스를 파일 내부에 직접 정의
class FrameProcessor {
  constructor() {
    this.ready = false;
    this.frameIndex = 0;
    this.frameBuffer = [];
    this.hands = null;
    this.isProcessing = false;
  }

  async initialize() {
    try {
      // MediaPipe 확인
      if (typeof window !== 'undefined' && window.Hands) {
        this.hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5
        });

        this.ready = true;
        return true;
      } else {
        console.warn('MediaPipe 없음, 테스트 모드로 동작');
        this.ready = true; // 테스트용
        return true;
      }
    } catch (error) {
      console.error('FrameProcessor 초기화 실패:', error);
      this.ready = false;
      throw error;
    }
  }

  isReady() {
    return this.ready;
  }

  async extractKeypoints(videoElement, sessionId) {
    if (!this.ready) {
      throw new Error('FrameProcessor가 초기화되지 않았습니다');
    }

    try {
      // 테스트용 가짜 키포인트 데이터 생성
      const fakeKeypoints = new Array(194).fill(0.0);

      // 일부 값을 랜덤하게 설정 (손이 감지된 것처럼)
      for (let i = 0; i < 63; i += 3) {
        fakeKeypoints[i] = Math.random() * 0.5 + 0.25; // x
        fakeKeypoints[i + 1] = Math.random() * 0.5 + 0.25; // y
        fakeKeypoints[i + 2] = Math.random() * 0.1; // z
      }

      this.frameBuffer.push(fakeKeypoints);
      this.frameIndex++;

      if (this.frameBuffer.length >= 10) {
        const batchData = {
          keypoints: [...this.frameBuffer],
          frameIndex: this.frameIndex,
          batchSize: this.frameBuffer.length,
          sessionId
        };

        this.frameBuffer = [];
        return batchData;
      }

      return null;
    } catch (error) {
      console.error('키포인트 추출 실패:', error);
      throw error;
    }
  }

  resetFrameIndex() {
    this.frameIndex = 0;
    this.frameBuffer = [];
  }

  getCurrentBufferSize() {
    return this.frameBuffer.length;
  }

  cleanup() {
    try {
      if (this.hands) {
        this.hands.close();
        this.hands = null;
      }

      this.ready = false;
      this.frameBuffer = [];
      this.frameIndex = 0;
    } catch (error) {
      console.error('FrameProcessor 정리 오류:', error);
    }
  }
}

// 간단한 performanceLogger
const performanceLogger = {
  metrics: new Map(),
  timers: new Map(),

  startTimer(name) {
    this.timers.set(name, performance.now());
  },

  endTimer(name) {
    const startTime = this.timers.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.timers.delete(name);
      return duration;
    }
    return 0;
  },

  clearMetrics() {
    this.metrics.clear();
    this.timers.clear();
  },

  logPerformance(message, duration, extra = {}) {
    console.log(`🔧 ${message}`, { duration, ...extra });
  }
};

export const useFrameExtraction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');

  const { user } = useAuth();

  // ✅ WebSocket 훅 사용
  const {
    isConnected,
    connectionState,
    error: wsError,
    lastResult,
    sessionStats,
    translationState,
    connect,
    disconnect,
    startTranslation,
    stopTranslation,
    sendFrame,
    clearError: clearWsError,
    getConnectionState
  } = useWebSocket();

  const frameProcessor = useRef(new FrameProcessor());
  const intervalRef = useRef(null);
  const sessionId = useRef(uuidv4());
  const frameCount = useRef(0);
  const sessionStartTime = useRef(null);

  // WebSocket 결과를 result로 설정
  useEffect(() => {
    if (lastResult) {
      setResult(lastResult);
    }
  }, [lastResult]);

  // JWT 토큰 가져오기 및 검증
  const getValidToken = useCallback(async () => {
    const token = localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('authToken');

    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    // 간단한 토큰 검증 (실제로는 서버 검증 필요)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        throw new Error('토큰이 만료되었습니다.');
      }

      return token;
    } catch (decodeError) {
      throw new Error('토큰이 유효하지 않습니다.');
    }
  }, []);

  // 사용자 검증
  const validateUser = useCallback(async () => {
    console.log("🔐 validateUser() 시작");
    try {
      if (!user?.id) {
        throw new Error('사용자 정보가 없습니다.');
      }

      const token = await getValidToken();
      return { token, user };
    } catch (error) {
      console.error("validateUser 실패:", error);
      throw new Error(`인증 오류: ${error.message}`);
    }
  }, [user?.id, getValidToken]);

  // FrameProcessor 초기화 함수
  const initializeFrameProcessor = useCallback(() => {
    if (!frameProcessor.current) {
      try {
        frameProcessor.current = new FrameProcessor();
        return true;
      } catch (error) {
        console.error("FrameProcessor 생성 실패:", error);
        frameProcessor.current = null;
        throw error;
      }
    } else {
      return true;
    }
  }, []);

  // 초기화
  const initialize = useCallback(async () => {
    setStatus('initializing');
    setError(null);
    clearWsError();

    try {
      const { token, user } = await validateUser();

      console.log("2️⃣ FrameProcessor 초기화 중...");
      initializeFrameProcessor();

      if (!frameProcessor.current) {
        throw new Error('FrameProcessor 생성에 실패했습니다');
      }

      if (typeof frameProcessor.current.isReady !== 'function') {
        console.error("isReady 메서드가 함수가 아님:", typeof frameProcessor.current.isReady);
        throw new Error('FrameProcessor의 isReady 메서드가 함수가 아닙니다');
      }

      if (!frameProcessor.current.isReady()) {
        await frameProcessor.current.initialize();
      }

      console.log("3️⃣ WebSocket 연결 시도 중...");
      try {
        if (!isConnected) {
          await connect(token, user.id);
        }
      } catch (wsError) {
        console.warn("WebSocket 연결 실패 (계속 진행):", wsError.message);
      }

      return true;
    } catch (err) {
      console.error("초기화 실패:", err);
      const errorMsg = err.message || 'Initialization failed';
      setError(errorMsg);
      setStatus('error');
      throw new Error(errorMsg);
    }
  }, [validateUser, isConnected, connect, clearWsError, initializeFrameProcessor]);

  // ✅ 수정: 프레임 추출 시작
  const startFrameExtraction = useCallback(async (videoElement) => {
    if (!videoElement || isProcessing) {
      return;
    }

    try {
      // 초기화
      await initialize();

      if (!frameProcessor.current || !frameProcessor.current.isReady()) {
        throw new Error('FrameProcessor가 초기화되지 않았거나 준비되지 않았습니다');
      }

      setIsProcessing(true);
      setStatus('processing');
      frameProcessor.current.resetFrameIndex();
      sessionStartTime.current = Date.now();
      frameCount.current = 0;

      // ✅ 번역 시작 메시지 전송
      console.log("🚀 번역 세션 시작 신호 전송...");
      try {
        await startTranslation(sessionId.current);
        console.log("✅ 번역 세션 시작 완료");
      } catch (translationError) {
        console.warn("⚠️ 번역 시작 신호 전송 실패:", translationError.message);
      }

      performanceLogger.clearMetrics();

      // 프레임 처리 인터벌 시작
      intervalRef.current = setInterval(async () => {
        try {
          frameCount.current++;

          if (!frameProcessor.current) {
            console.error('frameProcessor가 null이 되었습니다');
            stopFrameExtraction();
            return;
          }

          // 키포인트 추출 및 배치 처리
          const batchData = await frameProcessor.current.extractKeypoints(
            videoElement,
            sessionId.current
          );

          // ✅ 배치 완성 시에만 처리
          if (batchData) {
            const realTimeState = getConnectionState ? getConnectionState() : connectionState;
            const realTimeConnected = realTimeState === 'OPEN';

            console.log('🎯 배치 완성!', {
              batchSize: batchData.batchSize,
              frameIndex: batchData.frameIndex,
              isConnected,
              realTimeConnected,
              realTimeState,
              sessionId: sessionId.current
            });

            // ✅ WebSocket 전송 (중복 제거)
            if (realTimeConnected || isConnected) {
              console.log('📤 WebSocket 전송 시작');
              try {
                await sendFrame(batchData.keypoints, batchData.frameIndex, sessionId.current);
                console.log('✅ WebSocket 전송 성공');

                performanceLogger.logPerformance(
                  '📦 Batch sent successfully',
                  0,
                  {
                    frameIndex: batchData.frameIndex,
                    batchSize: batchData.batchSize,
                    sessionId: sessionId.current
                  }
                );
              } catch (sendError) {
                console.error('❌ WebSocket 전송 실패:', sendError);

                // 재연결 시도
                console.log('🔄 WebSocket 재연결 시도...');
                try {
                  const { token, user } = await validateUser();
                  await connect(token, user.id);

                  // 재연결 성공 시 다시 전송 시도
                  console.log('🔄 재연결 성공, 다시 전송 시도');
                  await sendFrame(batchData.keypoints, batchData.frameIndex, sessionId.current);
                  console.log('✅ 재연결 후 전송 성공');
                } catch (reconnectError) {
                  console.error('❌ 재연결 실패:', reconnectError);
                }
              }
            } else {
              console.warn('⚠️ WebSocket 연결 없음 - 배치 전송 불가');
            }
          }
        } catch (err) {
          console.error('Frame processing cycle error:', err);
          setError(err.message);

          // 치명적 에러인 경우 처리 중단
          if (err.message.includes('인증') || err.message.includes('WebSocket')) {
            stopFrameExtraction();
          }
        }
      }, VIDEO_CONFIG.FRAME_INTERVAL);

    } catch (err) {
      console.error('Frame extraction start failed:', err);
      setError(err.message);
      setIsProcessing(false);
      setStatus('error');
    }
  }, [
    isProcessing,
    initialize,
    isConnected,
    connectionState,
    startTranslation,
    sendFrame,
    getConnectionState,
    validateUser,
    connect
  ]);

  // ✅ 수정: 프레임 추출 중단
  const stopFrameExtraction = useCallback(() => {
    console.log('\n🛑 === 프레임 추출 세션 종료 ===');

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsProcessing(false);
    setStatus('idle');

    // ✅ 번역 종료 메시지 전송
    console.log("🛑 번역 세션 종료 신호 전송...");
    try {
      stopTranslation(sessionId.current);
      console.log("✅ 번역 세션 종료 완료");
    } catch (translationError) {
      console.warn("⚠️ 번역 종료 신호 전송 실패:", translationError.message);
    }

    // ✅ 주의: 즉시 연결 종료하지 않음 (마지막 문장 대기)
    console.log("🕐 마지막 문장 처리 대기 중...");
  }, [stopTranslation]);

  // ✅ 완전한 정리 함수 (연결 종료 포함)
  const cleanup = useCallback(() => {
    console.log("🧹 완전한 정리 시작...");

    // 프레임 처리 중단
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsProcessing(false);
    setStatus('idle');

    // FrameProcessor 정리
    if (frameProcessor.current) {
      frameProcessor.current.cleanup();
    }

    // WebSocket 연결 종료
    disconnect();

    performanceLogger.clearMetrics();
    console.log("✅ 완전한 정리 완료");
  }, [disconnect]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // 상태
    isProcessing,
    result,
    error: error || wsError,
    status,
    sessionStats,

    // WebSocket 상태
    isConnected,
    connectionState,
    translationState,

    // 세션 정보
    sessionId: sessionId.current,
    frameCount: frameCount.current,

    // 메서드
    startFrameExtraction,
    stopFrameExtraction,
    cleanup,

    // 유틸리티
    clearError: useCallback(() => {
      setError(null);
      clearWsError();
    }, [clearWsError])
  };
};