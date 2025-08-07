import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { FrameProcessor } from '../services/FrameProcessor';
import { VIDEO_CONFIG } from "../constants/videoConfig";
import { useSignLanguageAPI } from "./useSignLanguageAPI";
import { performanceLogger, FPSCalculator } from "../utils/performanceUtils";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "../Context/authContext";

// 프레임 추출 로직 -> useSignLanguageAPI hook 활용

export const useFrameExtraction = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // UUID는 고유 ID, 중복될 확률 거의 없음
    // Universally Unique Identifier
    // 분산 환경을 지원 및 보안 강화
    // UUID 한 번만 생성하고 유지
    const sessionId = useMemo(() => uuidv4(), []);

    const frameProcessor = useRef(new FrameProcessor());
    const intervalRef = useRef(null);
    const lastSubmissionTime = useRef(0);

    // 성능 측정용
    const fpsCalculator = useRef(new FPSCalculator());
    const sessionStartTime = useRef(null);

    // API 통신 훅 사용
    const {
        submitFrame,
        error: apiError,
        clearError
    } = useSignLanguageAPI();

    // frame extraction starts
    const startFrameExtraction = useCallback((videoElement) => {
        console.log("=== startFrameExtraction 호출됨 ===");
        console.log("videoElement:", videoElement);
        console.log("videoElement.videoWidth:", videoElement?.videoWidth);
        console.log("isProcessing:", isProcessing);

        if (!videoElement || isProcessing) {
            console.log("=== 조건 불만족으로 리턴 ===");
            return;
        }

        // user 인증 확인 추가
        if (!user?.id) {
            setError('사용자 인증이 필요합니다.');
            return;
        }

        setIsProcessing(true);
        setError(null);
        clearError();
        frameProcessor.current.resetFrameIndex();
        sessionStartTime.current = Date.now();

        const cycleStartTime = Date.now();

        console.log('🚀 === 프레임 추출 세션 시작 ===');
        console.log(`📊 세션 ID: ${sessionId}`);
        // console.log(`👤 사용자 ID: ${user.id}`);
        console.log(`⚙️  설정: ${VIDEO_CONFIG.CANVAS_WIDTH}x${VIDEO_CONFIG.CANVAS_HEIGHT}, ${VIDEO_CONFIG.FRAME_INTERVAL}ms 간격`);
        console.log('================================\n');

        // 성능 메트릭 초기화
        performanceLogger.clearMetrics();

        intervalRef.current = setInterval(async () => {
            console.log("=== Interval 실행됨 ==="); // 이 로그가 나오는지 확인

            try {
                const now = Date.now();

                // frame rate 제어 -> 설정 상수에 맞게 유지
                if (now - lastSubmissionTime.current < VIDEO_CONFIG.FRAME_INTERVAL) {
                    return;
                }

                lastSubmissionTime.current = now;

                // 전체 처리 시간 측정 시작
                performanceLogger.startTimer('total_processing');

                // frame extraction -> 백엔드 FrameRequest 구조에 맞춤
                const frameRequest = frameProcessor.current.extractFrame(
                    videoElement,
                    sessionId // 생성된 sessionId 사용
                );

                // 백엔드(API)로 비동기 전송
                const extractResult = await submitFrame(frameRequest);

                // 전체 처리 시간 계산
                const totalProcessingTime = performanceLogger.endTimer('total_processing');

                // FPS 계산
                fpsCalculator.current.tick();

                if (extractResult?.success) {
                    // frame 추출 후 전송 성공 응답 처리
                    setResult(extractResult.data);


                    // 총 처리 시간 로그
                    performanceLogger.logPerformance(
                        '🎯 전체 처리',
                        totalProcessingTime,
                        { frameIndex: frameRequest.frameIndex }
                    );

                    performanceLogger.addMetric('totalProcessing', totalProcessingTime, {
                        frameIndex: frameRequest.frameIndex
                    });

                    // 주기적인 성능 리포트 (20프레임마다)
                    if (frameRequest.frameIndex > 0 && frameRequest.frameIndex % 20 === 0) {
                        performanceLogger.printReport();
                    }
                }

            } catch (err) {
                console.error('Frame processing error:', err);
                setError(err.message);

                // 사이클 시간 계산 수정
                const cycleEndTime = Date.now();
                console.log(`Cycle time: ${cycleEndTime - cycleStartTime}ms`);

                // 인증 오류 시 처리 중단
                if (err.message.includes('인증')) {
                    stopFrameExtraction();
                }
            }

            // 사이클 시간 체크 (디버깅용)
            const cycleTime = performance.now() - cycleStartTime;
            if (cycleTime > VIDEO_CONFIG.FRAME_INTERVAL * 1.5) {
                console.warn(`⚠️  처리 시간 초과: ${Math.round(cycleTime)}ms (목표: ${VIDEO_CONFIG.FRAME_INTERVAL}ms)`);
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

        // 세션 종료 로그
        if (sessionStartTime.current) {
            const sessionDuration = Date.now() - sessionStartTime.current;
            console.log('\n🏁 === 프레임 추출 세션 종료 ===');
            console.log(`⏱️  총 세션 시간: ${Math.round(sessionDuration)}ms`);

            // 최종 성능 리포트
            performanceLogger.printReport();
            console.log('===============================\n');
        }
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
        sessionId, // 디버깅용으로 노출 -> 운영시 제거
        startFrameExtraction,
        stopFrameExtraction,
        cleanup
    };
};