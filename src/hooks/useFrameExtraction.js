import { useCallback, useRef, useState, useEffect } from "react";
import { useWebSocket } from "./useWebSocket";
import { useAuth } from "../Context/authContext";
import { VIDEO_CONFIG, ERROR_CODES, MESSAGE_TYPES } from "../constants/videoConfig";
import { FrameProcessor } from "../services/FrameProcessor";
import { performanceLogger } from "../utils/performanceUtils";
import { v4 as uuidv4 } from "uuid";

// FrameProcessor는 이제 독립 서비스 파일에서 import

export const useFrameExtraction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");

  const { user } = useAuth();


  // WebSocket 훅 사용
  const {
    isConnected,
    connectionState,
    error: wsError,
    lastResult,
    sessionStats,
    translationState,
    connect,
    disconnect,
    startTranslation,
    stopTranslation,
    sendFrame,
    clearError: clearWsError,
    getConnectionState,
  } = useWebSocket();

  const frameProcessor = useRef(new FrameProcessor());
  const intervalRef = useRef(null);
  const sessionId = useRef(uuidv4());
  const frameCount = useRef(0);
  const sessionStartTime = useRef(null);

  // WebSocket 결과를 result로 설정
  useEffect(() => {
    if (lastResult) {
      setResult(lastResult);
    }
  }, [lastResult]);

  // JWT 토큰 가져오기 및 검증
  const getValidToken = useCallback(async () => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (!token) {
      throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
    }

    // 간단한 토큰 검증 (실제로는 서버 검증 필요)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        throw new Error("토큰이 만료되었습니다.");
      }

      return token;
    } catch (decodeError) {
      throw new Error("토큰이 유효하지 않습니다.");
    }
  }, []);

  // 사용자 검증
  const validateUser = useCallback(async () => {
    console.log("validateUser() 시작");
    try {
      if (!user?.id) {
        throw new Error("사용자 정보가 없습니다.");
      }

      const token = await getValidToken();
      return { token, user };
    } catch (error) {
      console.error("validateUser 실패:", error);
      throw new Error(`인증 오류: ${error.message}`);
    }
  }, [user?.id, getValidToken]);

  // FrameProcessor 초기화 함수
  const initializeFrameProcessor = useCallback(() => {
    if (!frameProcessor.current) {
      try {
        frameProcessor.current = new FrameProcessor();
        return true;
      } catch (error) {
        console.error("FrameProcessor 생성 실패:", error);
        frameProcessor.current = null;
        throw error;
      }
    } else {
      return true;
    }
  }, []);

  // 초기화
  const initialize = useCallback(async () => {
    setStatus("initializing");
    setError(null);
    clearWsError();

    try {
      const { token, user } = await validateUser();

      console.log("FrameProcessor 초기화 중...");
      initializeFrameProcessor();

      if (!frameProcessor.current) {
        throw new Error("FrameProcessor 생성에 실패했습니다");
      }

      if (typeof frameProcessor.current.isReady !== "function") {
        console.error(
          "isReady 메서드가 함수가 아님:",
          typeof frameProcessor.current.isReady
        );
        throw new Error("FrameProcessor의 isReady 메서드가 함수가 아닙니다");
      }

      if (!frameProcessor.current.isReady()) {
        await frameProcessor.current.initialize();
      }

      console.log("WebSocket 연결 시도 중...");
      try {
        if (!isConnected) {
          await connect(token, user.id);

          // 연결 성공 확인 (최대 5초 대기)
          let retryCount = 0;
          const maxRetries = 10;

          while (!isConnected && retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
            retryCount++;
          }

          if (!isConnected) {
            throw new Error("WebSocket 연결이 설정되지 않았습니다");
          }

          console.log("WebSocket 연결 성공 확인됨");
        }
      } catch (wsError) {
        console.error("WebSocket 연결 실패:", wsError.message);
        throw new Error(`WebSocket 연결 실패: ${wsError.message}`);
      }

      return true;
    } catch (err) {
      console.error("초기화 실패:", err);
      const errorMsg = err.message || "Initialization failed";
      setError(errorMsg);
      setStatus("error");
      throw new Error(errorMsg);
    }
  }, [
    validateUser,
    isConnected,
    connect,
    clearWsError,
    initializeFrameProcessor,
  ]);

  // 수정: 프레임 추출 시작
  const startFrameExtraction = useCallback(
    async (videoElement) => {
      if (!videoElement || isProcessing) {
        return;
      }

      try {
        // 초기화
        await initialize();

        if (!frameProcessor.current || !frameProcessor.current.isReady()) {
          throw new Error(
            "FrameProcessor가 초기화되지 않았거나 준비되지 않았습니다"
          );
        }

        setIsProcessing(true);
        setStatus("processing");
        frameProcessor.current.resetFrameIndex();
        sessionStartTime.current = Date.now();
        frameCount.current = 0;

        const userId = user?.id || user?.userId; // user에서 userId 추출 (id 또는 userId)

        console.log("🔍 사용자 정보 확인:", { user, userId, userKeys: user ? Object.keys(user) : null });

        if (!userId) {
          setError("userId Error - 사용자 ID를 찾을 수 없습니다");
          return;
        }

        // 번역 시작 메시지 전송
        console.log("번역 세션 시작 신호 전송...");
        try {
          startTranslation(sessionId.current, userId);
          console.log("번역 세션 시작 완료");
        } catch (translationError) {
          console.warn("번역 시작 신호 전송 실패:", translationError.message);
        }

        performanceLogger.clearMetrics();

        // 번역 시작 메시지가 서버에 먼저 도달하도록 짧은 지연 후 프레임 처리 시작
        console.log("⏳ 번역 시작 메시지 처리 대기 중...");
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 번역 상태가 활성화될 때까지 최대 2초 대기
        let translationReadyRetries = 0;
        const maxTranslationRetries = 10;
        
        while (translationState !== "active" && translationReadyRetries < maxTranslationRetries) {
          console.log(`📡 번역 상태 확인 중... (${translationReadyRetries + 1}/${maxTranslationRetries}): ${translationState}`);
          await new Promise(resolve => setTimeout(resolve, 200));
          translationReadyRetries++;
        }
        
        if (translationState === "active") {
          console.log("✅ 번역 세션 활성화 확인됨");
        } else {
          console.warn("⚠️ 번역 세션 활성화 확인 시간 초과, 프레임 처리 계속 진행");
        }
        
        console.log("🎬 프레임 처리 인터벌 시작");
        // 프레임 처리 인터벌 시작
        intervalRef.current = setInterval(async () => {
          try {
            frameCount.current++;

            if (!frameProcessor.current) {
              console.error("frameProcessor가 null이 되었습니다");
              stopFrameExtraction();
              return;
            }

            // 단일 프레임 키포인트 추출
            const frameData = await frameProcessor.current.extractKeypoints(
              videoElement,
              sessionId.current
            );

            // 모든 프레임을 즉시 전송
            if (frameData) {
              const realTimeState = getConnectionState
                ? getConnectionState()
                : connectionState;
              const realTimeConnected = realTimeState === "OPEN";

              console.log("프레임 전송 준비!", {
                frameIndex: frameData.frameIndex,
                isConnected,
                realTimeConnected,
                realTimeState,
                sessionId: sessionId.current,
                userId: user?.id || user?.userId
              });

              // WebSocket 전송
              if (realTimeConnected || isConnected) {
                console.log("WebSocket 단일 프레임 전송 시작");
                try {
                  await sendFrame(
                    frameData.keypoints, // 단일 프레임 194개 값
                    frameData.frameIndex,
                    sessionId.current,
                    user?.id || user?.userId // userId 추가
                  );
                  console.log("WebSocket 단일 프레임 전송 성공");

                  performanceLogger.logPerformance(
                    "Frame sent successfully",
                    0,
                    {
                      frameIndex: frameData.frameIndex,
                      sessionId: sessionId.current,
                      userId: user?.id || user?.userId
                    }
                  );
                } catch (sendError) {
                  console.error("WebSocket 전송 실패:", sendError);

                  // 재연결 시도
                  console.log("WebSocket 재연결 시도...");
                  try {
                    const { token, user: reconnectUser } = await validateUser();
                    await connect(token, reconnectUser.id);

                    // 재연결 성공 시 다시 전송 시도
                    console.log("재연결 성공, 다시 전송 시도");
                    await sendFrame(
                      frameData.keypoints,
                      frameData.frameIndex,
                      sessionId.current,
                      reconnectUser?.id || reconnectUser?.userId
                    );
                    console.log("재연결 후 전송 성공");
                  } catch (reconnectError) {
                    console.error("재연겸 실패:", reconnectError);
                  }
                }
              } else {
                console.warn("⚠️ WebSocket 연결 없음 - 프레임 전송 불가");
              }
            }
          } catch (err) {
            console.error("Frame processing cycle error:", err);

            // 에러 코드 기반 처리
            const errorCode = err.code || ERROR_CODES.UNKNOWN_ERROR;

            switch (errorCode) {
              case ERROR_CODES.KEYPOINT_EXTRACTION_FAILED:
              case ERROR_CODES.MEDIAPIPE_PROCESSING_TIMEOUT:
                console.warn("키포인트 추출 에러 - 프레임 건너뛰기", err.code);
                // 키포인트 에러는 한 프레임만 건너뛰고 계속 진행
                break;

              case ERROR_CODES.AUTH_TOKEN_EXPIRED:
              case ERROR_CODES.AUTH_TOKEN_INVALID:
              case ERROR_CODES.AUTH_TOKEN_MISSING:
                console.error("인증 에러 - 처리 중단", err.code);
                setError("인증이 만료되었습니다. 다시 로그인하세요.");
                stopFrameExtraction();
                break;

              case ERROR_CODES.WEBSOCKET_CONNECTION_FAILED:
              case ERROR_CODES.WEBSOCKET_SEND_FAILED:
                console.error("WebSocket 에러 - 재연결 시도", err.code);
                setError("서버 연결이 불안정합니다.");
                break;

              default:
                console.error("알 수 없는 에러:", err.code || 'NO_CODE', err.message);
                setError(err.message);
                break;
            }
          }
        }, VIDEO_CONFIG.FRAME_INTERVAL);
      } catch (err) {
        console.error("Frame extraction start failed:", err);

        // 에러 메시지 사용자 친화적으로 변환
        let userMessage = err.message;
        if (err.message.includes("MediaPipe")) {
          userMessage = "카메라 초기화에 실패했습니다. 페이지를 새로고침하세요.";
        } else if (err.message.includes("WebSocket")) {
          userMessage = "서버 연결에 실패했습니다. 네트워크를 확인하세요.";
        } else if (err.message.includes("인증")) {
          userMessage = "인증에 실패했습니다. 다시 로그인하세요.";
        }

        setError(userMessage);
        setIsProcessing(false);
        setStatus("error");
      }
    },
    [
      isProcessing,
      initialize,
      isConnected,
      connectionState,
      translationState,
      startTranslation,
      sendFrame,
      getConnectionState,
      validateUser,
      connect,
    ]
  );

  // 수정: 프레임 추출 중단
  const stopFrameExtraction = useCallback(() => {
    console.log("\n === 프레임 추출 세션 종료 ===");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsProcessing(false);
    setStatus("idle");

    // 번역 종료 메시지 전송
    console.log("🛑 번역 세션 종료 신호 전송...");
    try {
      const userId = user?.id || user?.userId;
      console.log("🔍 종료 시 사용자 정보 확인:", { user, userId, userKeys: user ? Object.keys(user) : null });
      
      if (userId) {
        stopTranslation(sessionId.current, userId);
        console.log("✅ 번역 세션 종료 완료");
      } else {
        console.warn("⚠️ userId가 없어 번역 종료 신호 전송을 건너뜁니다.", { user });
      }
    } catch (translationError) {
      console.warn("⚠️ 번역 종료 신호 전송 실패:", translationError.message);
    }

    // 주의: 즉시 연결 종료하지 않음 (마지막 문장 대기)
    console.log("🕐 마지막 문장 처리 대기 중...");
  }, [stopTranslation, user?.id, user?.userId]);

  // 완전한 정리 함수 (연결 종료 포함)
  const cleanup = useCallback(() => {
    console.log("🧹 완전한 정리 시작...");

    // 프레임 처리 중단
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsProcessing(false);
    setStatus("idle");

    // FrameProcessor 정리
    if (frameProcessor.current) {
      frameProcessor.current.cleanup();
    }

    // WebSocket 연결 종료
    disconnect();

    performanceLogger.clearMetrics();
    console.log("✅ 완전한 정리 완료");
  }, [disconnect]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // 상태
    isProcessing,
    result,
    error: error || wsError,
    status,
    sessionStats,

    // WebSocket 상태
    isConnected,
    connectionState,
    translationState,

    // 세션 정보
    sessionId: sessionId.current,
    frameCount: frameCount.current,

    // 메서드
    startFrameExtraction,
    stopFrameExtraction,
    cleanup,

    // 유틸리티
    clearError: useCallback(() => {
      setError(null);
      clearWsError();
    }, [clearWsError]),
  };
};