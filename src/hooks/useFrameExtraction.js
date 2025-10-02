// 단순화된 프레임 추출 훅
import { useCallback, useRef, useState, useEffect } from "react";
import { useWebSocketContext } from "../Context/WebSocketContext";
import { VIDEO_CONFIG } from "../constants/videoConfig";
import { FrameProcessor } from "../services/FrameProcessor";

export const useFrameExtraction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const { sendFrameBatch, isTranslationActive } = useWebSocketContext();
  
  const frameProcessor = useRef(new FrameProcessor());
  const intervalRef = useRef(null);
  const currentSessionId = useRef(null);

  // 단순화된 초기화
  const initializeFrameProcessor = useCallback(async () => {
    try {
      if (!frameProcessor.current.isReady()) {
        console.log("📦 FrameProcessor 초기화 중...");
        await frameProcessor.current.initialize();
        console.log("✅ FrameProcessor 초기화 완료");
      }
      return true;
    } catch (error) {
      console.error("🚨 FrameProcessor 초기화 실패:", error);
      setError("프레임 추출 초기화 실패: " + error.message);
      throw error;
    }
  }, []);

  // 프레임 추출 시작
  const startFrameExtraction = useCallback(async (videoElement, sessionId) => {
    if (!videoElement) {
      const errorMsg = "비디오 요소가 없습니다";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!sessionId) {
      const errorMsg = "세션 ID가 없습니다";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (isProcessing) {
      console.warn("⚠️ 이미 처리 중입니다");
      return;
    }

    try {
      console.log("🎬 프레임 추출 시작:", sessionId);
      
      await initializeFrameProcessor();
      setIsProcessing(true);
      setError(null);
      currentSessionId.current = sessionId;
      frameProcessor.current.resetFrameIndex();

      // 번역 활성화 대기 (단순화)
      let waitCount = 0;
      while (!isTranslationActive && waitCount < 10) {
        console.log(`⏳ 번역 활성화 대기 중... (${waitCount + 1}/10)`);
        await new Promise(resolve => setTimeout(resolve, 200));
        waitCount++;
      }

      // 프레임 처리 인터벌 시작
      intervalRef.current = setInterval(async () => {
        if (!isTranslationActive) {
          return; // 조용히 건너뛰기
        }

        try {
          const batchData = await frameProcessor.current.extractFrame(
            videoElement,
            currentSessionId.current
          );

          if (batchData) {
            console.log('📤 프레임 배치 전송:', batchData.frameCount);
            const sent = sendFrameBatch(batchData);
            if (!sent) {
              console.warn("⚠️ 배치 전송 실패");
            }
          }

        } catch (frameError) {
          console.warn("⚠️ 프레임 처리 오류, 건너뛰기:", frameError.message);
          // 개별 프레임 오류는 전체 프로세스를 중단하지 않음
        }
      }, VIDEO_CONFIG.FRAME_INTERVAL);

      console.log("✅ 프레임 추출 시작 완료");

    } catch (error) {
      console.error("🚨 프레임 추출 시작 실패:", error);
      setIsProcessing(false);
      setError("프레임 추출 시작 실패: " + error.message);
      throw error;
    }
  }, [isProcessing, initializeFrameProcessor, isTranslationActive, sendFrameBatch]);

  // 프레임 추출 중지
  const stopFrameExtraction = useCallback(() => {
    console.log("🛑 프레임 추출 중지");

    // 남은 프레임 전송
    if (frameProcessor.current && currentSessionId.current) {
      const finalBatch = frameProcessor.current.flushBuffer(currentSessionId.current);
      if (finalBatch) {
        console.log("📤 최종 배치 전송:", finalBatch.frameCount);
        sendFrameBatch(finalBatch);
      }
    }

    // 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsProcessing(false);
    currentSessionId.current = null;
    
    console.log("✅ 프레임 추출 중지 완료");
  }, [sendFrameBatch]);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 통합된 정리 함수
  const cleanup = useCallback(() => {
    console.log("🧹 useFrameExtraction 정리");
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (frameProcessor.current) {
      frameProcessor.current.cleanup();
    }

    setIsProcessing(false);
    currentSessionId.current = null;
    setError(null);
    
    console.log("✅ useFrameExtraction 정리 완료");
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // 초기화 (한번만)
  useEffect(() => {
    initializeFrameProcessor().catch(error => {
      console.error("🚨 초기화 오류:", error);
    });
  }, [initializeFrameProcessor]);

  return {
    // 상태
    isProcessing,
    error,
    
    // 세션 정보
    currentSessionId: currentSessionId.current,
    
    // 메서드
    startFrameExtraction,
    stopFrameExtraction,
    clearError,
    cleanup
  };
};