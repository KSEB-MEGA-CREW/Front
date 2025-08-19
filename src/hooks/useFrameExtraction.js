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
      console.error('❌ 키포인트 추출 실패:', error);
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
    try {

      if (!user?.id) {
        throw new Error('사용자 정보가 없습니다.');
      }

      const token = await getValidToken();

      return { token, user };
    } catch (error) {
      console.error("❌ validateUser 실패:", error);
      throw new Error(`인증 오류: ${error.message}`);
    }
  }, [user?.id, getValidToken]);

  // FrameProcessor 초기화 함수
  const initializeFrameProcessor = useCallback(() => {

    if (!frameProcessor.current) {
      try {
        frameProcessor.current = new FrameProcessor();

        // 메서드 확인

        return true;
      } catch (error) {
        console.error("❌ FrameProcessor 생성 실패:", error);
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

      initializeFrameProcessor();

      if (!frameProcessor.current) {
        throw new Error('FrameProcessor 생성에 실패했습니다');
      }

      if (typeof frameProcessor.current.isReady !== 'function') {
        console.error("❌ isReady 메서드가 함수가 아님:", typeof frameProcessor.current.isReady);
        console.error("FrameProcessor 인스턴스:", frameProcessor.current);
        throw new Error('FrameProcessor의 isReady 메서드가 함수가 아닙니다');
      }

      if (!frameProcessor.current.isReady()) {
        await frameProcessor.current.initialize();
      } else {
      }

      try {
        if (!isConnected) {
          await connect(token, user.id);
        } else {
        }
      } catch (wsError) {
        console.warn("⚠️ WebSocket 연결 실패 (계속 진행):", wsError.message);
      }

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

    if (!videoElement || isProcessing) {
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
            await sendFrame(batchData.keypoints, batchData.frameIndex);
          } else if (batchData) {
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
      console.error('❌ Frame extraction start failed:', err);
      setError(err.message);
      setIsProcessing(false);
      setStatus('error');
    }
  }, [isProcessing, initialize, isConnected, sendFrame]);

  // 프레임 추출 중단
  const stopFrameExtraction = useCallback(() => {

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