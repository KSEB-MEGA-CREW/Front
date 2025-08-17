import { useCallback, useRef, useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '../Context/authContext';
import { FrameProcessor } from '../services/FrameProcessor';
import { NetworkService } from '../services/NetworkService';
import { performanceLogger } from '../utils/performanceUtils';
import { VIDEO_CONFIG } from '../constants/videoConfig';
import { v4 as uuidv4 } from 'uuid';

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

    // 토큰 유효성 검증
    const isValid = await networkService.current.verifyToken(token);
    if (!isValid) {
      // 토큰이 무효하면 제거
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      throw new Error('토큰이 유효하지 않습니다. 다시 로그인해주세요.');
    }

    return token;
  }, []);

  // 사용자 검증
  const validateUser = useCallback(async () => {
    try {
      if (!user?.id) {
        throw new Error('사용자 정보가 없습니다.');
      }

      const token = await getValidToken();

      return { token, user };
    } catch (error) {
      throw new Error(`인증 오류: ${error.message}`);
    }
  }, [user?.id, getValidToken]);

  

  // 초기화
  const initialize = useCallback(async () => {
    setStatus('initializing');
    setError(null);
    clearWsError();

    try {
      const { token, user } = await validateUser();

      // FrameProcessor 초기화
      if (!frameProcessor.current.isReady()) {
        await frameProcessor.current.initialize();
      }

      // WebSocket 연결 (토큰과 userId 전달)
      if (!isConnected) {
        await connect(token, user.id);
      }

      console.log('✅ Frame extraction system initialized');
      return true;

    } catch (err) {
      const errorMsg = err.message || 'Initialization failed';
      setError(errorMsg);
      setStatus('error');
      throw new Error(errorMsg);
    }
  }, [validateUser, isConnected, connect, clearWsError]);

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

      setIsProcessing(true);
      setStatus('processing');
      frameProcessor.current.resetFrameIndex();
      sessionStartTime.current = Date.now();
      frameCount.current = 0;

      // 성능 메트릭 초기화
      performanceLogger.clearMetrics();

      // 프레임 처리 인터벌 시작
      intervalRef.current = setInterval(async () => {
        try {
          frameCount.current++;

          // 키포인트 추출 및 배치 처리
          const batchData = await frameProcessor.current.extractKeypoints(
            videoElement,
            sessionId.current
          );

          // 10프레임 배치 완료시 WebSocket 전송
          if (batchData && isConnected) {
            console.log(`📡 Sending batch: ${batchData.batchSize} frames`);

            await sendFrame(batchData.keypoints, batchData.frameIndex);

            // 성능 로깅
            performanceLogger.logPerformance(
              '📦 Batch sent',
              0,
              {
                frameIndex: batchData.frameIndex,
                batchSize: batchData.batchSize
              }
            );
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
    frameProcessor.current.cleanup();
    performanceLogger.clearMetrics();
  }, [stopFrameExtraction]);

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