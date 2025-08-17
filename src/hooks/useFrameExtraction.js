import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { FrameProcessor } from '../services/FrameProcessor';
import { VIDEO_CONFIG } from "../constants/videoConfig";
import { useWebSocket } from "./useWebSocket";
import { performanceLogger, FPSCalculator } from "../utils/performanceUtils";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "../Context/authContext";

export const useFrameExtraction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, initializing, processing, error

  const { user } = useAuth();
  const sessionId = useMemo(() => uuidv4(), []);

  const frameProcessor = useRef(new FrameProcessor());
  const intervalRef = useRef(null);
  const fpsCalculator = useRef(new FPSCalculator());
  const sessionStartTime = useRef(null);
  const frameCount = useRef(0);

  const {
    isConnected,
    connectionState,
    error: wsError,
    lastResult,
    sessionStats,
    connect,
    sendFrame,
    disconnect,
    clearError: clearWsError
  } = useWebSocket();

  // WebSocket 결과 업데이트
  useEffect(() => {
    if (lastResult?.prediction) {
      setResult(lastResult.prediction);
      setStatus('processing');

      console.log(`🎯 Prediction received: ${lastResult.prediction.label} (${(lastResult.prediction.confidence * 100).toFixed(1)}%)`);
    }
  }, [lastResult]);

  // 에러 처리
  useEffect(() => {
    if (wsError) {
      setError(wsError);
      setStatus('error');
    }
  }, [wsError]);

  // 사용자 인증 확인
  const validateUser = useCallback(() => {
    if (!user?.id) {
      throw new Error('사용자 인증이 필요합니다.');
    }
    return true;
  }, [user?.id]);

  // 초기화
  const initialize = useCallback(async () => {
    setStatus('initializing');
    setError(null);
    clearWsError();

    try {
      validateUser();

      // FrameProcessor 초기화
      if (!frameProcessor.current.isReady()) {
        await frameProcessor.current.initialize();
      }

      // WebSocket 연결
      if (!isConnected) {
        await connect();
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
    console.log(`📊 세션 ID: ${sessionId}`);
    console.log(`👤 사용자 ID: ${user?.id}`);
    console.log(`⚙️ 설정: MediaPipe + WebSocket, 10프레임 배치`);

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

          // FPS 계산
          fpsCalculator.current.tick();

          // 키포인트 추출 및 배치 처리
          const batchData = await frameProcessor.current.extractKeypoints(
            videoElement,
            sessionId
          );

          // 10프레임 배치 완료시 WebSocket 전송
          if (batchData && isConnected) {
            console.log(`📡 Sending batch: ${batchData.batchSize} frames`);

            await sendFrame(batchData.keypoints, batchData.frameIndex);

            // 성능 로깅
            performanceLogger.logPerformance(
              '📦 Batch sent',
              0, // 전송 시간은 WebSocketService에서 측정
              {
                frameIndex: batchData.frameIndex,
                batchSize: batchData.batchSize
              }
            );

            // 주기적 성능 리포트 (매 5번째 배치마다)
            if (batchData.frameIndex % 50 === 0) {
              performanceLogger.printReport();
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

      console.log('================================\n');

    } catch (err) {
      console.error('Frame extraction start failed:', err);
      setError(err.message);
      setIsProcessing(false);
      setStatus('error');
    }
  }, [isProcessing, sessionId, user?.id, initialize, isConnected, sendFrame]);

  // 프레임 추출 중단
  const stopFrameExtraction = useCallback(() => {
    console.log('\n🏁 === 프레임 추출 세션 종료 ===');

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsProcessing(false);
    setStatus('idle');

    // 세션 통계 로그
    if (sessionStartTime.current) {
      const sessionDuration = Date.now() - sessionStartTime.current;
      console.log(`⏱️ 총 세션 시간: ${Math.round(sessionDuration)}ms`);
      console.log(`📊 총 처리 프레임: ${frameCount.current}개`);

      if (sessionStats) {
        console.log(`🎯 예측 횟수: ${sessionStats.prediction_count}회`);
        console.log(`📈 배치 전송: ${Math.floor(sessionStats.frame_count / 10)}회`);
      }
    }

    // 최종 성능 리포트
    performanceLogger.printReport();
    console.log('===============================\n');

    // WebSocket 연결 종료
    disconnect();
  }, [disconnect, sessionStats]);

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

  // 연결 상태 디버깅
  useEffect(() => {
    console.log(`🔌 WebSocket State: ${connectionState}, Connected: ${isConnected}`);
  }, [connectionState, isConnected]);

  return {
    // 상태
    isProcessing,
    result,
    error,
    status,
    sessionStats,

    // WebSocket 상태
    isConnected,
    connectionState,

    // 세션 정보 (디버깅용)
    sessionId,
    frameCount: frameCount.current,
    bufferSize: frameProcessor.current?.getCurrentBufferSize?.() || 0,

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