import { useState, useRef, useCallback } from "react";
import { NetworkService } from "../services/NetworkService";
import { useAuth } from "../Context/authContext";
import { v4 as uuidv4 } from 'uuid';

// 텍스트-수어 변환 API 훅
export const useTextToSignAPI = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const networkService = useRef(new NetworkService());
  const sessionId = useRef(uuidv4());

  const convertTextToSignLanguage = useCallback(async (text) => {
    if (!user?.id) {
      throw new Error('사용자 인증이 필요합니다.');
    }

    if (!text || !text.trim()) {
      throw new Error('변환할 텍스트를 입력해주세요.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const translationRequest = {
        text: text.trim(),
        userId: user.id,
        sessionId: sessionId.current,
        timestamp: Date.now(),
        language: 'ko'
      };

      console.log('텍스트-수어 변환 요청:', translationRequest);

      const result = await networkService.current.convertTextToSign(translationRequest);

      if (result && result.success) {
        setLastResult(result.data);
        console.log('번역 요청 전송 완료:', result.data);

        return {
          success: true,
          data: {
            status: result.data.status,
            requestId: result.data.requestId,
            submissionTime: result.data.submissionTime
          }
        };
      } else {
        throw new Error(result?.message || '텍스트 변환에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err.message || '텍스트 변환 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('텍스트-수어 변환 오류:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const abortRequests = useCallback(() => {
    sessionId.current = uuidv4();
    setError(null);
    setLastResult(null);
    console.log('새 번역 세션 시작:', sessionId.current);
  }, []);

  return {
    isLoading,
    error,
    lastResult,
    sessionId: sessionId.current,
    convertTextToSignLanguage,
    clearError,
    abortRequests,
  };
};
