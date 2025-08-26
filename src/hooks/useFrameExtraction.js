import { useCallback, useRef, useState, useEffect } from 'react';
import { useAuth } from '../Context/authContext';
import { getSignLanguageSystem, resetSignLanguageSystem } from '../services/SignLanguageSystem';

export const useFrameExtraction = () => {
  const { user } = useAuth();
  const systemRef = useRef(cull);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, initializing, processing, error
  const [isConnected, setIsConnected] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    frameCount: 0,
    startTime: null,
    lastResultTime: null
  });

  // system initialize (실제 사용자 정보 전달)
  const initialize = useCallback(async () => {
    try {
      setStatus('initializing');
      setError(null);

      if (!user?.id) {
        throw new Error('사용자 인증이 필요합니다');
      }

      // 기존 시스템 정리
      if (systemRef.current) {
        await systemRef.current.cleanup();
        systemRef.current = null;
      }

      // 새 시스템 인스턴스 생성
      systemRef.current = getSignLanguageSystem();

      // system initialize with real user info
      const { stream, isReady } = await systemRef.current.initialize(user);

      if (!isReady) {
        throw new Error('시스템 초기화에 실패했습니다');
      }

      // WebSocket 메시지 핸들러 설정
      systemRef.current.onMessage((message) => {
        handleWebSocketMessage(message);
      });

      setIsConnected(true);
      setStatus('idle');
      console.log(`✅ 사용자 ${user.name || user.id} 시스템 초기화 완료`);

      return stream;

    } catch (err) {
      console.error('❌ 시스템 초기화 실패:', err);
      setError(err.message);
      setStatus('error');
      setIsConnected(false);
      throw err;
    }
  }, [user]); // user 의존성 추가

  // Websocket message handler
  const handleWebSocketMessage = useCallback((message) => {
    try {
      switch (message.type) {
        case 'PREDICTION_RESULT':
          setResult({
            translatedText: message.label,
            confidence: message.confidence,
            timestamp: message.timestamp
          });
          setSessionStats(prev => ({
            ...prev,
            lastResultTime: Date.now()
          }));
          break;

        case 'TRANSLATION_RESULT':
          setResult({
            translatedText: message.text,
            confidence: message.confidence,
            timestamp: message.timestamp
          });
          break;

        case 'ERROR':
          console.error('서버 오류:', message.error);
          setError(message.error);
          break;

        default:
          console.log('알 수 없는 메시지 타입:', message.type);
      }
    } catch (err) {
      console.error('메시지 처리 오류:', err);
    }
  }, []);

  // frame extraction starts
  const startFrameExtraction = useCallback(async (videoElement) => {
    try {
      if (isProcessing) {
        console.warn('이미 처리 중입니다');
        return;
      }

      if (!videoElement || videoElement.videoWidth === 0) {
        throw new Error('비디오 요소가 준비되지 않았습니다');
      }

      // 시스템이 준비되지 않았으면 초기화
      if (!systemRef.current || !systemRef.current.isReady()) {
        await initialize();
      }

      // 비디오 요소 설정
      systemRef.current.setupVideo(videoElement);

      // 프레임 처리 시작
      await systemRef.current.startProcessing(videoElement);

      setIsProcessing(true);
      setStatus('processing');
      setSessionStats({
        frameCount: 0,
        startTime: Date.now(),
        lastResultTime: null
      });

      console.log('🚀 프레임 추출 시작');

    } catch (err) {
      console.error('❌ 프레임 추출 시작 실패:', err);
      setError(err.message);
      setStatus('error');
      setIsProcessing(false);
    }
  }, [isProcessing, initialize]);

  // 프레임 추출 중지
  const stopFrameExtraction = useCallback(() => {
    try {
      if (systemRef.current && systemRef.current.isProcessing()) {
        systemRef.current.stopProcessing();
      }

      setIsProcessing(false);
      setStatus('idle');
      console.log('⏹️ 프레임 추출 중지');

    } catch (err) {
      console.error('❌ 프레임 추출 중지 오류:', err);
      setError(err.message);
    }
  }, []);

  // 리소스 정리
  const cleanup = useCallback(async () => {
    try {
      if (systemRef.current) {
        await systemRef.current.cleanup();
        systemRef.current = null;
      }

      resetSignLanguageSystem();

      setIsProcessing(false);
      setIsConnected(false);
      setStatus('idle');
      setResult(null);
      setError(null);

      console.log('🧹 리소스 정리 완료');

    } catch (err) {
      console.error('❌ 리소스 정리 오류:', err);
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isProcessing,
    result,
    error,
    status,
    isConnected,
    sessionStats,
    startFrameExtraction,
    stopFrameExtraction,
    cleanup,
    initialize
  };
};