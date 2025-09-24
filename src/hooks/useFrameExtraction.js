// 단순화된 키포인트 추출 훅 - 오직 추출과 전송만 담당
import { useCallback, useRef, useState, useEffect } from "react";
import { useWebSocketContext } from "../Context/WebSocketContext";
import { VIDEO_CONFIG, ERROR_CODES } from "../constants/videoConfig";
import { FrameProcessor } from "../services/FrameProcessor";
import { performanceLogger } from "../utils/performanceUtils";

export const useFrameExtraction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // WebSocket Context 사용
  const { sendKeypoints, isTranslationActive } = useWebSocketContext();
  
  // 최신 상태를 추적하기 위한 ref
  const isTranslationActiveRef = useRef(isTranslationActive);

  const frameProcessor = useRef(new FrameProcessor());
  const intervalRef = useRef(null);
  const frameCount = useRef(0);
  const currentSessionId = useRef(null);
  const isInitializedRef = useRef(false);

  // FrameProcessor 초기화
  const initializeFrameProcessor = useCallback(async () => {
    try {
      if (!frameProcessor.current) {
        frameProcessor.current = new FrameProcessor();
      }

      if (!frameProcessor.current.isReady()) {
        console.log("📦 [useFrameExtraction] FrameProcessor 초기화 중...");
        await frameProcessor.current.initialize();
        console.log("✅ [useFrameExtraction] FrameProcessor 초기화 완료");
      }

      return true;
    } catch (error) {
      console.error("🚨 [useFrameExtraction] FrameProcessor 초기화 실패:", error);
      setError("키포인트 추출 초기화에 실패했습니다: " + error.message);
      throw error;
    }
  }, []);

  // 키포인트 추출 시작
  const startFrameExtraction = useCallback(async (videoElement, sessionId) => {
    if (!videoElement) {
      const errorMsg = "비디오 요소가 제공되지 않았습니다";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!sessionId) {
      const errorMsg = "세션 ID가 제공되지 않았습니다";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (isProcessing) {
      console.warn("⚠️ [useFrameExtraction] 이미 처리 중입니다");
      return;
    }

    try {
      console.log("🎬 [useFrameExtraction] 키포인트 추출 시작:", sessionId);
      
      // FrameProcessor 초기화
      await initializeFrameProcessor();

      setIsProcessing(true);
      setError(null);
      currentSessionId.current = sessionId;
      frameCount.current = 0;
      
      // 프레임 처리 리셋
      frameProcessor.current.resetFrameIndex();
      performanceLogger.clearMetrics();

      // 번역이 활성화될 때까지 대기 (최대 3초)
      let waitCount = 0;
      const maxWait = 15; // 3초 (200ms * 15)
      
      while (!isTranslationActive && waitCount < maxWait) {
        console.log(`⏳ [useFrameExtraction] 번역 활성화 대기 중... (${waitCount + 1}/${maxWait})`);
        await new Promise(resolve => setTimeout(resolve, 200));
        waitCount++;
      }

      if (!isTranslationActive && waitCount >= maxWait) {
        console.warn("⚠️ [useFrameExtraction] 번역 활성화 대기 시간 초과, 계속 진행");
      } else {
        console.log("✅ [useFrameExtraction] 번역 활성화 확인");
      }

      // 프레임 처리 인터벌 시작
      intervalRef.current = setInterval(async () => {
        try {
          // 최신 번역 상태 확인
          const currentTranslationActive = isTranslationActiveRef.current;
          
          // 번역이 비활성 상태면 프레임 처리 건너뛰기
          if (!currentTranslationActive) {
            console.log("⏸️ [useFrameExtraction] 번역 비활성 - 프레임 건너뛰기", { 
              currentTranslationActive,
              originalIsTranslationActive: isTranslationActive 
            });
            return;
          }
          
          console.log("🎬 [useFrameExtraction] 프레임 처리 중...", { 
            frameCount: frameCount.current, 
            currentTranslationActive,
            originalIsTranslationActive: isTranslationActive,
            sessionId: currentSessionId.current 
          });

          frameCount.current++;

          // 키포인트 추출
          const frameData = await frameProcessor.current.extractKeypoints(
            videoElement,
            currentSessionId.current
          );

          if (frameData && frameData.keypoints) {
            // 손이 감지되었는지 확인 (키포인트가 모두 0이 아닌지 체크)
            const hasValidKeypoints = Array.isArray(frameData.keypoints) && 
              frameData.keypoints.some(point => point !== 0);
            
            console.log('🤲 [useFrameExtraction] 키포인트 유효성 체크:', {
              hasKeypoints: !!frameData.keypoints,
              keypointsLength: frameData.keypoints?.length,
              hasValidKeypoints,
              handsDetected: frameData.handsDetected || 'unknown'
            });
            
            if (!hasValidKeypoints) {
              console.log('⚠️ [useFrameExtraction] 손이 감지되지 않음 - 키포인트 전송 건너뛰기');
              return;
            }

            // WebSocket을 통한 키포인트 전송
            const sent = sendKeypoints(frameData.keypoints, frameData.frameIndex);
            
            if (sent) {
              performanceLogger.logPerformance(
                "Frame sent successfully",
                0,
                {
                  frameIndex: frameData.frameIndex,
                  sessionId: currentSessionId.current,
                  keypointsCount: frameData.keypoints.length
                }
              );
            } else {
              console.warn("⚠️ [useFrameExtraction] 키포인트 전송 실패");
            }
          } else {
            console.warn("⚠️ [useFrameExtraction] 유효하지 않은 프레임 데이터");
          }

        } catch (frameError) {
          console.error("🚨 [useFrameExtraction] 프레임 처리 오류:", frameError);

          // 에러 타입에 따른 처리
          if (frameError.code === ERROR_CODES.KEYPOINT_EXTRACTION_FAILED ||
              frameError.code === ERROR_CODES.MEDIAPIPE_PROCESSING_TIMEOUT) {
            // 키포인트 추출 오류는 한 프레임만 건너뛰고 계속
            console.warn("⏭️ [useFrameExtraction] 프레임 건너뛰기");
          } else {
            // 심각한 오류는 처리 중단
            setError(`프레임 처리 오류: ${frameError.message}`);
            stopFrameExtraction();
          }
        }
      }, VIDEO_CONFIG.FRAME_INTERVAL);

      console.log("✅ [useFrameExtraction] 키포인트 추출 시작 완료");

    } catch (error) {
      console.error("🚨 [useFrameExtraction] 키포인트 추출 시작 실패:", error);
      setIsProcessing(false);
      setError(`키포인트 추출 시작 실패: ${error.message}`);
      throw error;
    }
  }, [isProcessing, initializeFrameProcessor, isTranslationActive, sendKeypoints]);

  // 키포인트 추출 중지
  const stopFrameExtraction = useCallback(() => {
    console.log("🛑 [useFrameExtraction] 키포인트 추출 중지");

    // 인터벌 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsProcessing(false);
    currentSessionId.current = null;
    frameCount.current = 0;
    
    console.log("✅ [useFrameExtraction] 키포인트 추출 중지 완료");
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      console.log("🧹 [useFrameExtraction] 훅 정리");
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (frameProcessor.current) {
        try {
          frameProcessor.current.cleanup();
        } catch (error) {
          console.error("🚨 [useFrameExtraction] FrameProcessor 정리 오류:", error);
        }
      }
      
      performanceLogger.clearMetrics();
    };
  }, []);

  // 번역 상태 ref 업데이트
  useEffect(() => {
    isTranslationActiveRef.current = isTranslationActive;
    console.log('🔄 [useFrameExtraction] 번역 상태 ref 업데이트:', isTranslationActive);
  }, [isTranslationActive]);

  // 초기화 (한번만 실행)
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log("🚀 [useFrameExtraction] 훅 초기화");
      initializeFrameProcessor().catch(error => {
        console.error("🚨 [useFrameExtraction] 초기화 오류:", error);
      });
      isInitializedRef.current = true;
    }
  }, [initializeFrameProcessor]);

  return {
    // 상태
    isProcessing,
    error,
    
    // 세션 정보
    currentSessionId: currentSessionId.current,
    frameCount: frameCount.current,
    
    // 메서드
    startFrameExtraction,
    stopFrameExtraction,
    clearError,
  };
};