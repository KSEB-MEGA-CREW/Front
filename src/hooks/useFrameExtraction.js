// 프레임 배치 추출 훅 - 10개 단위 배치 전송
import { useCallback, useRef, useState, useEffect } from "react";
import { useWebSocketContext } from "../Context/WebSocketContext";
import { VIDEO_CONFIG, ERROR_CODES } from "../constants/videoConfig";
import { FrameProcessor } from "../services/FrameProcessor";
import { performanceLogger } from "../utils/performanceUtils";

export const useFrameExtraction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // WebSocket Context에서 새로운 배치 전송 함수 사용
  const { sendFrameBatch, isTranslationActive } = useWebSocketContext();
  
  // 최신 상태를 추적하기 위한 ref
  const isTranslationActiveRef = useRef(isTranslationActive);

  const frameProcessor = useRef(new FrameProcessor());
  const intervalRef = useRef(null);
  const frameCount = useRef(0);
  const currentSessionId = useRef(null);
  const isInitializedRef = useRef(false);

  // FrameProcessor 초기화 (MediaPipe 제거)
  const initializeFrameProcessor = useCallback(async () => {
    try {
      if (!frameProcessor.current) {
        frameProcessor.current = new FrameProcessor();
      }

      if (!frameProcessor.current.isReady()) {
        console.log("📦 [useFrameExtraction] FrameProcessor 초기화 중 (프레임 모드)...");
        await frameProcessor.current.initialize();
        console.log("✅ [useFrameExtraction] FrameProcessor 초기화 완료");
      }

      return true;
    } catch (error) {
      console.error("🚨 [useFrameExtraction] FrameProcessor 초기화 실패:", error);
      setError("프레임 추출 초기화에 실패했습니다: " + error.message);
      throw error;
    }
  }, []);

  // 프레임 추출 시작 (기존 키포인트 로직 대체)
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

    // 비디오 요소 상세 검증
    if (videoElement.readyState < 2) {
      const errorMsg = `비디오가 준비되지 않았습니다. readyState: ${videoElement.readyState}`;
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!videoElement.videoWidth || !videoElement.videoHeight) {
      const errorMsg = `비디오 크기가 유효하지 않습니다: ${videoElement.videoWidth}x${videoElement.videoHeight}`;
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (isProcessing) {
      console.warn("⚠️ [useFrameExtraction] 이미 처리 중입니다");
      return;
    }

    try {
      console.log("🎬 [useFrameExtraction] 프레임 배치 추출 시작:", sessionId);
      
      await initializeFrameProcessor();

      setIsProcessing(true);
      setError(null);
      currentSessionId.current = sessionId;
      frameCount.current = 0;
      
      frameProcessor.current.resetFrameIndex();
      performanceLogger.clearMetrics();

      // 번역 활성화 대기 (기존과 동일)
      let waitCount = 0;
      const maxWait = 15;
      
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
          const currentTranslationActive = isTranslationActiveRef.current;
          
          if (!currentTranslationActive) {
            console.log("⏸️ [useFrameExtraction] 번역 비활성 - 프레임 건너뛰기");
            return;
          }

          // 비디오 요소 상태 재검증 (런타임 중에도)
          if (!videoElement || videoElement.readyState < 2 || 
              videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
            console.warn("⚠️ [useFrameExtraction] 비디오 상태가 유효하지 않음, 건너뛰기", {
              readyState: videoElement?.readyState,
              width: videoElement?.videoWidth,
              height: videoElement?.videoHeight
            });
            return;
          }
          
          console.log("🎬 [useFrameExtraction] 프레임 처리 중...", { 
            frameCount: frameCount.current,
            bufferSize: frameProcessor.current.getCurrentBufferSize(),
            sessionId: currentSessionId.current,
            videoState: {
              readyState: videoElement.readyState,
              width: videoElement.videoWidth,
              height: videoElement.videoHeight
            }
          });

          frameCount.current++;

          // 프레임 추출 (키포인트 대신) - try-catch로 개별 오류 처리
          let batchData = null;
          try {
            batchData = await frameProcessor.current.extractFrame(
              videoElement,
              currentSessionId.current
            );
          } catch (frameExtractionError) {
            console.error("🚨 [useFrameExtraction] 개별 프레임 추출 실패:", frameExtractionError);
            // 개별 프레임 실패는 전체 프로세스 중단하지 않음
            return;
          }

          // 10개 배치가 완성된 경우에만 전송
          if (batchData) {
            console.log('📤 [useFrameExtraction] 10개 프레임 배치 전송:', {
              batchIndex: batchData.batchIndex,
              frameCount: batchData.frameCount,
              type: batchData.type
            });

            // WebSocket을 통한 배치 전송
            const sent = sendFrameBatch(batchData);
            
            if (sent) {
              performanceLogger.logPerformance(
                "Frame batch sent successfully",
                0,
                {
                  batchIndex: batchData.batchIndex,
                  frameCount: batchData.frameCount,
                  sessionId: currentSessionId.current
                }
              );
            } else {
              console.warn("⚠️ [useFrameExtraction] 프레임 배치 전송 실패");
            }
          } else {
            console.log(`📦 [useFrameExtraction] 버퍼링 중: ${frameProcessor.current.getCurrentBufferSize()}/10`);
          }

        } catch (frameError) {
          console.error("🚨 [useFrameExtraction] 프레임 처리 오류:", frameError);
          setError(`프레임 처리 오류: ${frameError.message}`);
          stopFrameExtraction();
        }
      }, VIDEO_CONFIG.FRAME_INTERVAL);

      console.log("✅ [useFrameExtraction] 프레임 배치 추출 시작 완료");

    } catch (error) {
      console.error("🚨 [useFrameExtraction] 프레임 추출 시작 실패:", error);
      setIsProcessing(false);
      setError(`프레임 추출 시작 실패: ${error.message}`);
      throw error;
    }
  }, [isProcessing, initializeFrameProcessor, isTranslationActive, sendFrameBatch]);

  // 프레임 추출 중지 (세션 종료 시 남은 프레임 전송)
  const stopFrameExtraction = useCallback(() => {
    console.log("🛑 [useFrameExtraction] 프레임 추출 중지");

    // 버퍼에 남은 프레임이 있으면 최종 전송
    if (frameProcessor.current && currentSessionId.current) {
      const finalBatch = frameProcessor.current.flushBuffer(currentSessionId.current);
      if (finalBatch) {
        console.log("📤 [useFrameExtraction] 최종 프레임 배치 전송:", finalBatch.frameCount);
        sendFrameBatch(finalBatch);
      }
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsProcessing(false);
    currentSessionId.current = null;
    frameCount.current = 0;
    
    console.log("✅ [useFrameExtraction] 프레임 추출 중지 완료");
  }, [sendFrameBatch]);

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