import { useState, useRef, useCallback } from "react";
import { NetworkService } from "../services/NetworkService";
import { useAuth } from "../Context/authContext";
// API 통신 관리
// 네트워크 통신 및 상태 관리

export const useSignLanguageAPI = () => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [error, setError] = useState(null);

    const networkService = useRef(new NetworkService());

    // frame 제출
    const submitFrame = useCallback(async (frameRequest) => {
        if (!user?.id) {
            throw new Error('사용자 인증이 필요합니다.');
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const requestWithUserId = {
                ...frameRequest,
                userId: user.id
            };

            const result = await networkService.current.sendFrame(requestWithUserId);
            setLastResult(result);
            return result;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    }, [user?.id]);

    // error clear
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // 요청 취소
    const abortRequests = useCallback(() => {
        networkService.current.abort();
        setIsSubmitting(false);
    }, []);

    return {
        // 상태
        isSubmitting,
        lastResult,
        error,

        // 메서드
        submitFrame,
        clearError,
        abortRequests
    };
};
