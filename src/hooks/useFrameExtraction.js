import { useCallback, useRef, useState, useEffect } from 'react';
import { useAuth } from '../Context/authContext';
import { getSignLanguageSystem, resetSignLanguageSystem } from '../services/SignLanguageSystem';

export const useFrameExtraction = () => {
  const { user } = useAuth();
  const systemRef = useRef(null);
  const isInitializedRef = useRef(false);
  const initializingRef = useRef(false);
  const userIdRef = useRef(null); // 사용자 ID 추적

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [connectionState, setConnectionState] = useState('CLOSED');
  const [sessionStats, setSessionStats] = useState({
    frameCount: 0,
    startTime: null,
    lastResultTime: null,
    fps: 0
  });

  const handleWebSocketMessage = useCallback((message) => {
    try {
      switch (message.type) {
        case 'PREDICTION_RESULT':
        case 'TRANSLATION_RESULT':
          setResult({
            translatedText: message.label || message.text,
            confidence: message.confidence || 0,
            timestamp: message.timestamp || Date.now()
          });
          setSessionStats(prev => ({
            ...prev,
            lastResultTime: Date.now(),
            fps: prev.startTime ? Math.round(prev.frameCount / ((Date.now() - prev.startTime) / 1000)) : 0
          }));
          break;
        case 'ERROR':
          console.error('서버 오류:', message.error);
          setError(message.error);
          break;
        case 'CONNECTION_STATE':
          setConnectionState(message.state);
          break;
      }
    } catch (err) {
      console.error('메시지 처리 오류:', err);
    }
  }, []);

  const initializeSystem = useCallback(async () => {
    if (initializingRef.current) {
      console.log('초기화 진행 중 - 대기');
      return;
    }

    const currentUserId = user?.id;
    if (!currentUserId) {
      throw new Error('사용자 인증이 필요합니다');
    }

    // 같은 사용자면 이미 초기화된 시스템 재사용
    if (isInitializedRef.current &&
      systemRef.current?.isReady() &&
      userIdRef.current === currentUserId) {
      console.log('이미 초기화됨 - 스킵');
      return;
    }

    initializingRef.current = true;

    try {
      setError(null);
      setConnectionState('CONNECTING');

      console.log('시스템 초기화 시작:', currentUserId);

      // 사용자가 변경된 경우에만 기존 시스템 정리
      if (userIdRef.current !== currentUserId && systemRef.current) {
        await systemRef.current.cleanup();
        systemRef.current = null;
        resetSignLanguageSystem();
      }

      // 새 시스템 생성 및 초기화
      systemRef.current = getSignLanguageSystem();
      systemRef.current.setUser(user);

      const { stream: newStream, isReady } = await systemRef.current.initialize();

      if (!isReady) {
        throw new Error('시스템 초기화에 실패했습니다');
      }

      systemRef.current.onMessage(handleWebSocketMessage);

      setStream(newStream);
      setConnectionState('OPEN');
      isInitializedRef.current = true;
      userIdRef.current = currentUserId;

      console.log('시스템 초기화 완료');

    } catch (err) {
      console.error('시스템 초기화 실패:', err);
      setError(err.message);
      setConnectionState('ERROR');
      isInitializedRef.current = false;
      userIdRef.current = null;
      throw err;
    } finally {
      initializingRef.current = false;
    }
  }, []); // 의존성 완전 제거

  // 사용자 변경 감지 및 자동 초기화
  useEffect(() => {
    if (user?.id && userIdRef.current !== user.id) {
      initializeSystem().catch(err => {
        console.error('자동 초기화 실패:', err);
      });
    }
  }, [user?.id]); // initializeSystem 의존성 제거

  // 나머지 함수들은 동일...
  const startFrameExtraction = useCallback(async (videoElement) => {
    try {
      if (isProcessing) {
        console.warn('이미 처리 중입니다');
        return;
      }

      if (!videoElement || videoElement.videoWidth === 0) {
        throw new Error('비디오 요소가 준비되지 않았습니다');
      }

      if (!isInitializedRef.current || !systemRef.current?.isReady()) {
        throw new Error('시스템이 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.');
      }

      systemRef.current.setupVideo(videoElement);
      await systemRef.current.startProcessing(videoElement);

      setIsProcessing(true);
      setSessionStats({
        frameCount: 0,
        startTime: Date.now(),
        lastResultTime: null,
        fps: 0
      });

      console.log('프레임 추출 시작');

    } catch (err) {
      console.error('프레임 추출 시작 실패:', err);
      setError(err.message);
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const stopFrameExtraction = useCallback(() => {
    try {
      if (systemRef.current?.isProcessing()) {
        systemRef.current.stopProcessing();
      }
      setIsProcessing(false);
      console.log('프레임 추출 중지');
    } catch (err) {
      console.error('프레임 추출 중지 오류:', err);
      setError(err.message);
    }
  }, []);

  const cleanup = useCallback(async () => {
    try {
      initializingRef.current = false;

      if (systemRef.current) {
        await systemRef.current.cleanup();
        systemRef.current = null;
      }

      resetSignLanguageSystem();

      setIsProcessing(false);
      setConnectionState('CLOSED');
      setResult(null);
      setError(null);
      setStream(null);
      isInitializedRef.current = false;
      userIdRef.current = null;

      console.log('리소스 정리 완료');

    } catch (err) {
      console.error('리소스 정리 오류:', err);
    }
  }, []);

  return {
    isProcessing,
    result,
    error,
    stream,
    connectionState,
    sessionStats,
    startFrameExtraction,
    stopFrameExtraction,
    cleanup,
    initializeSystem
  };
};