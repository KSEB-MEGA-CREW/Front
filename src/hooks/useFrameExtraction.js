// useFrameExtraction.js
import { useCallback, useRef, useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '../Context/authContext';
import { FrameProcessor } from '../services/FrameProcessor';
import { NetworkService } from '../services/NetworkService';
import { VIDEO_CONFIG } from '../constants/videoConfig';
import { v4 as uuidv4 } from 'uuid';

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

  // 🔄 수정: 번역 상태 및 새로운 함수들 추가
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
    console.log("🔐 validateUser() 시작");
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

      console.log("2️⃣ FrameProcessor 초기화 중...");
      if (!frameProcessor.current.isReady()) {
        console.log("FrameProcessor 초기화 실행 중...");
        await frameProcessor.current.initialize();
        console.log("✅ FrameProcessor 초기화 완료");
      } else {
        console.log("✅ FrameProcessor 이미 준비됨");
      }

      console.log("3️⃣ WebSocket 연결 시도 중...");
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
  }, [validateUser, isConnected, connect, clearWsError]);

  // 🔄 수정: 프레임 추출 시작 (번역 시작 메시지 추가)
  const startFrameExtraction = useCallback(async (videoElement) => {
    console.log("🚀 === 프레임 추출 시작 ===");

    if (!videoElement || isProcessing) {
      console.log("=== 조건 불만족으로 리턴 ===");
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

      // 🔄 추가: 번역 시작 메시지 전송
      console.log("🚀 번역 세션 시작 신호 전송...");
      try {
        await startTranslation(sessionId.current);
        console.log("✅ 번역 세션 시작 완료");
      } catch (translationError) {
        console.warn("⚠️ 번역 시작 신호 전송 실패:", translationError.message);
        // 번역 시작 실패해도 프레임 처리는 계속 진행
      }

      performanceLogger.clearMetrics();

      // 프레임 처리 인터벌 시작
      intervalRef.current = setInterval(async () => {
        try {
          frameCount.current++;

          const batchData = await frameProcessor.current.extractKeypoints(
            videoElement,
            sessionId.current
          );

          // 배치 완성 시에만 처리
          if (batchData) {
            const realTimeState = getConnectionState ? getConnectionState() : 'UNKNOWN';
            const realTimeConnected = realTimeState === 'OPEN';

            console.log('🎯 배치 완성! 상태 확인:', {
              batchSize: batchData.batchSize,
              frameIndex: batchData.frameIndex,
              storedIsConnected: isConnected,
              realTimeConnected,
              realTimeState,
              connectionState,
              sessionId: sessionId.current
            });

            // 키포인트 데이터 검증
            console.log('🔤 키포인트 데이터 검증:', {
              firstFrameFirstValues: batchData.keypoints[0]?.slice(0, 10),
              isAllZero: batchData.keypoints[0]?.every(val => val === 0.0),
              totalFrames: batchData.keypoints.length,
              keypointsPerFrame: batchData.keypoints[0]?.length,
              hasNonZeroValues: batchData.keypoints.some(frame =>
                frame.some(val => val !== 0.0)
              )
            });

            // 🔄 수정: WebSocket 전송에 세션 ID 추가
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
              console.warn('⚠️ WebSocket 연결 없음 - 배치 전송 불가', {
                storedIsConnected: isConnected,
                realTimeConnected,
                realTimeState,
                connectionState,
                batchSize: batchData.batchSize
              });
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

      console.log("🎬 프레임 처리 루프 시작됨");

    } catch (err) {
      console.error('❌ Frame extraction start failed:', err);
      setError(err.message);
      setIsProcessing(false);
      setStatus('error');
    }
  }, [isProcessing, initialize, isConnected, startTranslation, sendFrame, getConnectionState, validateUser, connect]);

  // 🔄 수정: 프레임 추출 중단 (번역 종료 메시지 추가)
  const stopFrameExtraction = useCallback(() => {
    console.log('\n🛑 === 프레임 추출 세션 종료 ===');

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsProcessing(false);
    setStatus('idle');

    // 🔄 추가: 번역 종료 메시지 전송
    console.log("🛑 번역 세션 종료 신호 전송...");
    try {
      stopTranslation(sessionId.current);
      console.log("✅ 번역 세션 종료 완료");
    } catch (translationError) {
      console.warn("⚠️ 번역 종료 신호 전송 실패:", translationError.message);
    }

    // WebSocket 연결 종료
    disconnect();
  }, [stopTranslation, disconnect]);

  // 정리 함수
  const cleanup = useCallback(() => {
    stopFrameExtraction();
    if (frameProcessor.current) {
      frameProcessor.current.cleanup();
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
    translationState, // 🔄 추가: 번역 상태
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