import { useState, useRef, useCallback } from "react";
import { NetworkService } from "../services/NetworkService";
import { useAuth } from "../Context/authContext";

/**
 * 수화 번역 API 통신 및 관련 상태를 관리하는 훅
 */
export const useSignLanguageAPI = () => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [lastResult, setLastResult] = useState(null);

    const networkService = useRef(new NetworkService());

    // frame 전송
    const submitFrame = useCallback(async (frameRequest) => {
        // 사용자 인증 검증 처리 추가
        if (!user?.id) {
            throw new Error('사용자 인증이 필요합니다.');
        }

        // 현재 NetworkService의 sendFrame(frameRequest, token) <- 토큰이 별도 파라미터로 필요
        // 이를 위해 토큰 가져오기
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('인증 토큰이 없습니다.');
        }

        setIsSubmitting(true);
        setError(null);

        try {

            const requestWithUserId = {
                ...frameRequest,
                userId: user.id
            };

            const result = await networkService.current.sendFrame(requestWithUserId, token);
            setLastResult(result);
            return result;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    }, [user?.id]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const abortRequests = useCallback(() => {
        networkService.current.abort();
        setIsSubmitting(false);
    }, []);

    return {
        isSubmitting,
        lastResult,
        error,
        submitFrame, // 다른 훅에서 사용할 수 있도록 export
        clearError,
        abortRequests,
    };
};