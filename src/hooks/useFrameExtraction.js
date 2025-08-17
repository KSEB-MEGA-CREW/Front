// useFrameExtraction.js
import { useCallback, useRef, useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '../Context/authContext';
import { NetworkService } from '../services/NetworkService';
import { VIDEO_CONFIG } from '../constants/videoConfig';
import { v4 as uuidv4 } from 'uuid';

// FrameProcessor 클래스를 파일 내부에 직접 정의
class FrameProcessor {
  constructor() {
    console.log('🔧 FrameProcessor constructor 호출됨');
    this.ready = false;
    this.frameIndex = 0;
    this.frameBuffer = [];
    this.hands = null;
    this.isProcessing = false;

    console.log('✅ FrameProcessor 생성 완료');
  }

  async initialize() {
    console.log('🔄 FrameProcessor 초기화 시작...');

    try {
      // MediaPipe 확인
      if (typeof window !== 'undefined' && window.Hands) {
        console.log('✅ MediaPipe Hands 발견');

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
        console.log('✅ MediaPipe 초기화 완료');
        return true;
      } else {
        console.warn('⚠️ MediaPipe 없음, 테스트 모드로 동작');
        this.ready = true; // 테스트용
        return true;
      }
    } catch (error) {
      console.error('❌ FrameProcessor 초기화 실패:', error);
      this.ready = false;
      throw error;
    }
  }

  isReady() {
    console.log('🔍 isReady 호출됨, 상태:', this.ready);
    return this.ready;
  }

  async extractKeypoints(videoElement, sessionId) {
    console.log('📊 키포인트 추출 시작');

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

      console.log(`📊 버퍼 상태: ${this.frameBuffer.length}/10 프레임`);

      if (this.frameBuffer.length >= 10) {
        const batchData = {
          keypoints: [...this.frameBuffer],
          frameIndex: this.frameIndex,
          batchSize: this.frameBuffer.length,
          sessionId
        };

        this.frameBuffer = [];
        console.log(`📦 배치 완성: ${batchData.batchSize}프레임`);
        return batchData;
      }

      return null;

    } catch (error) {
      console.error('❌ 키포인트 추출 실패:', error);
      throw error;
    }
  }

  resetFrameIndex() {
    console.log('🔄 프레임 인덱스 리셋');
    this.frameIndex = 0;
    this.frameBuffer = [];
  }

  getCurrentBufferSize() {
    return this.frameBuffer.length;
  }

  cleanup() {
    console.log('🧹 FrameProcessor 정리 시작...');

    try {
      if (this.hands) {
        this.hands.close();
        this.hands = null;
      }

      this.ready = false;
      this.frameBuffer = [];
      this.frameIndex = 0;

      console.log('✅ FrameProcessor 정리 완료');
    } catch (error) {
      console.error('❌ FrameProcessor 정리 오류:', error);
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
    console.log(`⚡ ${message}`, { duration, ...extra });
  }
};

export const useFrameExtraction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');

  const { user } = useAuth();
  const networkService = useRef(new NetworkService());

  // WebSocket 훅 사용
  const {
    isConnected,
    connectionState,
    error: wsError,
    lastResult,
    sessionStats,
    connect,
    disconnect,
    sendFrame,
    clearError: clearWsError
  } = useWebSocket();

  // FrameProcessor를 null로 초기화
  const frameProcessor = useRef(null);
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

    const isValid = await networkService.current.verifyToken(token);
    if (!isValid) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      throw new Error('토큰이 유효하지 않습니다. 다시 로그인해주세요.');
    }

    return token;
  }, []);

  // 사용자 검증
  const validateUser = useCallback(async () => {
    console.log("🔍 validateUser() 시작");
    try {
      console.log("사용자 정보 확인:", { hasUser: !!user, userId: user?.id });

      if (!user?.id) {
        throw new Error('사용자 정보가 없습니다.');
      }

      console.log("토큰 검증 중...");
      const token = await getValidToken();
      console.log("✅ 토큰 검증 완료");

      return { token, user };
    } catch (error) {
      console.error("❌ validateUser 실패:", error);
      throw new Error(`인증 오류: ${error.message}`);
    }
  }, [user?.id, getValidToken]);

  // FrameProcessor 초기화 함수
  const initializeFrameProcessor = useCallback(() => {
    console.log("🔧 FrameProcessor 초기화 시도");

    if (!frameProcessor.current) {
      try {
        console.log("📦 FrameProcessor 인스턴스 생성 중...");
        frameProcessor.current = new FrameProcessor();
        console.log("✅ FrameProcessor 인스턴스 생성 완료");

        // 메서드 확인
        console.log("🔍 메서드 확인:", {
          isReady: typeof frameProcessor.current.isReady,
          initialize: typeof frameProcessor.current.initialize,
          extractKeypoints: typeof frameProcessor.current.extractKeypoints,
          instance: frameProcessor.current
        });

        return true;
      } catch (error) {
        console.error("❌ FrameProcessor 생성 실패:", error);
        frameProcessor.current = null;
        throw error;
      }
    } else {
      console.log("✅ FrameProcessor 이미 존재함");
      return true;
    }
  }, []);

  // 초기화
  const initialize = useCallback(async () => {
    console.log("🔧 initialize() 시작");
    setStatus('initializing');
    setError(null);
    clearWsError();

    try {
      console.log("1️⃣ 사용자 검증 중...");
      const { token, user } = await validateUser();
      console.log("✅ 사용자 검증 완료:", { userId: user.id, hasToken: !!token });

      console.log("2️⃣ FrameProcessor 생성 중...");
      initializeFrameProcessor();

      console.log("3️⃣ FrameProcessor 상태 확인...");
      if (!frameProcessor.current) {
        throw new Error('FrameProcessor 생성에 실패했습니다');
      }

      console.log("4️⃣ FrameProcessor 메서드 존재 확인...");
      if (typeof frameProcessor.current.isReady !== 'function') {
        console.error("❌ isReady 메서드가 함수가 아님:", typeof frameProcessor.current.isReady);
        console.error("FrameProcessor 인스턴스:", frameProcessor.current);
        throw new Error('FrameProcessor의 isReady 메서드가 함수가 아닙니다');
      }

      console.log("5️⃣ FrameProcessor 초기화 중...");
      if (!frameProcessor.current.isReady()) {
        console.log("FrameProcessor 초기화 실행 중...");
        await frameProcessor.current.initialize();
        console.log("✅ FrameProcessor 초기화 완료");
      } else {
        console.log("✅ FrameProcessor 이미 준비됨");
      }

      console.log("6️⃣ WebSocket 연결 시도 중...");
      try {
        if (!isConnected) {
          await connect(token, user.id);
          console.log("✅ WebSocket 연결 완료");
        } else {
          console.log("✅ WebSocket 이미 연결됨");
        }
      } catch (wsError) {
        console.warn("⚠️ WebSocket 연결 실패 (계속 진행):", wsError.message);
      }

      console.log("🎉 전체 초기화 완료");
      return true;

    } catch (err) {
      console.error("❌ 초기화 실패:", err);
      console.error("Error stack:", err.stack);

      const errorMsg = err.message || 'Initialization failed';
      setError(errorMsg);
      setStatus('error');
      throw new Error(errorMsg);
    }
  }, [validateUser, isConnected, connect, clearWsError, initializeFrameProcessor]);

  // 프레임 추출 시작
  const startFrameExtraction = useCallback(async (videoElement) => {
    console.log("🚀 === 프레임 추출 시작 ===");

    if (!videoElement || isProcessing) {
      console.log("=== 조건 불만족으로 리턴 ===");
      return;
    }

    try {
      // 초기화
      await initialize();

      // 초기화 후 다시 한 번 확인
      if (!frameProcessor.current) {
        throw new Error('초기화 후에도 FrameProcessor가 null입니다');
      }

      setIsProcessing(true);
      setStatus('processing');
      frameProcessor.current.resetFrameIndex();
      sessionStartTime.current = Date.now();
      frameCount.current = 0;

      performanceLogger.clearMetrics();

      // 프레임 처리 인터벌 시작
      intervalRef.current = setInterval(async () => {
        try {
          frameCount.current++;

          if (!frameProcessor.current) {
            console.error('❌ frameProcessor가 null이 되었습니다');
            stopFrameExtraction();
            return;
          }

          // 키포인트 추출 및 배치 처리
          const batchData = await frameProcessor.current.extractKeypoints(
            videoElement,
            sessionId.current
          );

          // 10프레임 배치 완료시 WebSocket 전송
          if (batchData && isConnected) {
            console.log(`📡 Sending batch: ${batchData.batchSize} frames`);
            await sendFrame(batchData.keypoints, batchData.frameIndex);
          } else if (batchData) {
            console.log(`📦 로컬 배치: ${batchData.batchSize}프레임 (WebSocket 없음)`);
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

      console.log("🎬 프레임 처리 루프 시작됨");

    } catch (err) {
      console.error('❌ Frame extraction start failed:', err);
      setError(err.message);
      setIsProcessing(false);
      setStatus('error');
    }
  }, [isProcessing, initialize, isConnected, sendFrame]);

  // 프레임 추출 중단
  const stopFrameExtraction = useCallback(() => {
    console.log('\n🏁 === 프레임 추출 세션 종료 ===');

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsProcessing(false);
    setStatus('idle');

    // WebSocket 연결 종료
    disconnect();
  }, [disconnect]);

  // 정리 함수
  const cleanup = useCallback(() => {
    stopFrameExtraction();
    if (frameProcessor.current) {
      frameProcessor.current.cleanup();
      frameProcessor.current = null;
    }
    performanceLogger.clearMetrics();
  }, [stopFrameExtraction]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isProcessing,
    result,
    error: error || wsError,
    status,
    sessionStats,
    isConnected,
    connectionState,
    sessionId: sessionId.current,
    frameCount: frameCount.current,
    startFrameExtraction,
    stopFrameExtraction,
    cleanup,
    clearError: useCallback(() => {
      setError(null);
      clearWsError();
    }, [clearWsError])
  };
};