import { useState, useRef, useCallback, useEffect } from "react";
import { FrameProcessor } from '../services/FrameProcessor';
import { VIDEO_CONFIG, SESSION_CONFIG } from "../constants/videoConfig";
import { useSignLanguageAPI } from "./useSignLanguageAPI";

// 프레임 추출 로직 -> useSignLanguageAPI hook 활용

export const useFrameExtraction = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [sessionId] = useState(SESSION_CONFIG.GENERATE_UUID());
    // UUID는 고유 ID, 중복될 확률 거의 없음
    const frameProcessor = useRef(new FrameProcessor());
    const intervalRef = useRef(null);
    const lastSubmissionTime = useRef(0);

    // API 통신 훅 사용
    const {
        submitFrame,
        error: apiError,
        clearError
    } = useSignLanguageAPI();

    // frame extraction starts
    const startFrameExtraction = useCallback((videoElement) => {
        if (!videoElement || isProcessing) {
            // console.warn("video Element Error")
            return;
        }

        setIsProcessing(true);
        setError(null);
        clearError();
        frameProcessor.current.resetFrameIndex();

        console.log(`Starting frame extraction - SessionID: ${sessionId}, UserID: ${user.id}`);

        intervalRef.current = setInterval(async () => {
            try {
                const now = Date.now();

                // frame rate 제어 -> 설정 상수에 맞게 유지
                if (now - lastSubmissionTime.current < VIDEO_CONFIG.FRAME_INTERVAL) {
                    return;
                }

                lastSubmissionTime.current = now;

                // frame extraction -> 백엔드 FrameRequest 구조에 맞춤
                const frameRequest = frameProcessor.current.extractFrame(
                    videoElement,
                    sessionId
                );

                // 백엔드(API)로 비동기 전송
                const extractResult = await submitFrame(frameRequest);

                if (extractResult?.success) {
                    // frame 추출 후 전송 성공 응답 처리
                    setResult(extractResult.data);
                    console.log('Frame submitted successfully:', extractResult.data);
                }
            } catch (err) {
                console.error('Frame processing error:', err);
                setError(err.message);

                // 인증 오류 시 처리 중단
                if (err.message.includes('인증')) {
                    stopFrameExtraction();
                }
            }
        }, VIDEO_CONFIG.FRAME_INTERVAL);
    }, [isProcessing, sessionId, submitFrame, clearError]);

    // 프레임 추출 중단
    const stopFrameExtraction = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsProcessing(false);
        lastSubmissionTime.current = 0;
        console.log('Frame extraction stopped');
    }, []);

    // 정리 cleanup
    const cleanup = useCallback(() => {
        stopFrameExtraction();
        frameProcessor.current.cleanup();
    }, [stopFrameExtraction]);

    // API 에러를 메인 에러로 전파
    useEffect(() => {
        if (apiError) {
            setError(apiError);
        }
    }, [apiError]);

    // component 언마운트 시 정리
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {
        isProcessing,
        result,
        error,
        sessionId,
        startFrameExtraction,
        stopFrameExtraction,
        cleanup
    };
};