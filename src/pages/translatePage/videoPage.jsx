import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFrameExtraction } from "../../hooks/useFrameExtraction";
import { useTheme } from "../../Context/themeContext";
import {
  AlertCircle,
  Settings,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Play,
  Square,
  RotateCcw,
  Wifi,
  WifiOff,
  Camera,
  Shield,
} from "lucide-react";

const VideoPage = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const isInitializingRef = useRef(false);
  const isMountedRef = useRef(true);
  const cleanupExecutedRef = useRef(false);
  const initTimeoutRef = useRef(null);

  const [translationText, setTranslationText] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [permissionState, setPermissionState] = useState("prompt"); // 새로운 상태 추가
  const [showPermissionDialog, setShowPermissionDialog] = useState(false); // 커스텀 다이얼로그
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [cameraInfo, setCameraInfo] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [translationHistory, setTranslationHistory] = useState([]);

  const {
    isProcessing,
    result,
    error: frameError,
    connectionState,
    sessionStats,
    startFrameExtraction,
    stopFrameExtraction,
    cleanup,
  } = useFrameExtraction();

  // 권한 상태 확인 함수
  const checkCameraPermission = useCallback(async () => {
    try {
      const permission = await navigator.permissions.query({ name: "camera" });
      setPermissionState(permission.state);

      // 권한 상태 변경 리스너 추가
      permission.addEventListener("change", () => {
        setPermissionState(permission.state);
        console.log(" 카메라 권한 상태 변경:", permission.state);
      });

      return permission.state;
    } catch (error) {
      console.log("권한 API를 사용할 수 없습니다:", error);
      return "unknown";
    }
  }, []);

  // 권한 요청 함수
  const requestCameraPermission = useCallback(async () => {
    console.log(" 카메라 권한 요청 시작");

    try {
      // 먼저 현재 권한 상태를 다시 확인
      const currentPermission = await checkCameraPermission();
      console.log("현재 권한 상태:", currentPermission);

      if (currentPermission === "denied") {
        // 권한이 영구적으로 거부된 경우 사용자 안내
        setCameraError(`
          카메라 접근이 차단되었습니다. 
          
          권한을 허용하려면:
          1. 주소창 왼쪽의 ℹ️ 또는 🔒 클릭하세요
          2. 카메라를 '허용'으로 변경하세요
          3. 페이지를 새로고침하세요
          
          또는 브라우저 설정에서 이 사이트의 카메라 권한을 허용해 주세요.
        `);
        return false;
      }

      setShowPermissionDialog(true);

      // 임시 스트림을 통해 권한 요청
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      // 임시 스트림 즉시 정리
      tempStream.getTracks().forEach((track) => track.stop());

      setShowPermissionDialog(false);
      setPermissionState("granted");
      setCameraError(""); // 에러 메시지 초기화
      console.log(" 카메라 권한 승인됨");
      return true;
    } catch (error) {
      setShowPermissionDialog(false);
      console.error(" 카메라 권한 거부됨:", error);

      if (error.name === "NotAllowedError") {
        setPermissionState("denied");
        setCameraError(`
          카메라 접근 권한이 거부되었습니다.
          
          권한을 허용하려면:
          • 주소창 왼쪽의 자물쇠/카메라 아이콘을 클릭
          • 카메라를 '허용'으로 변경 후 새로고침
          • 또는 브라우저 설정에서 카메라 권한 허용
        `);
      } else if (error.name === "NotFoundError") {
        setCameraError(
          "카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해 주세요."
        );
      } else if (error.name === "NotReadableError") {
        setCameraError(
          "카메라가 다른 응용 프로그램에서 사용 중입니다. 다른 앱을 종료한 후 다시 시도해 주세요."
        );
      } else {
        setCameraError("카메라 접근 중 오류가 발생했습니다: " + error.message);
      }

      return false;
    }
  }, [checkCameraPermission]);

  // 강제 즉시 정리 함수
  const forceCleanup = useCallback(() => {
    console.log(" 강제 즉시 정리 시작");

    // 모든 타이머 정리
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }

    // 초기화 상태 리셋
    isInitializingRef.current = false;
    isMountedRef.current = false;
    cleanupExecutedRef.current = true;

    // 스트림 즉시 정리
    if (streamRef.current) {
      console.log(" streamRef 강제 정리");
      try {
        streamRef.current.getTracks().forEach((track) => {
          if (track.readyState !== "ended") {
            track.stop();
            console.log(` Track force stopped: ${track.kind}`);
          }
        });
      } catch (error) {
        console.error("Track 정리 오류:", error);
      }
      streamRef.current = null;
    }

    // video element 강제 정리
    if (videoRef.current) {
      console.log(" video element 강제 정리");
      try {
        videoRef.current.srcObject = null;
        videoRef.current.load();
        videoRef.current.pause();
        // video element의 모든 이벤트 리스너 제거
        videoRef.current.onloadedmetadata = null;
        videoRef.current.onerror = null;
        videoRef.current.oncanplay = null;
      } catch (error) {
        console.error("Video element 정리 오류:", error);
      }
    }

    // useFrameExtraction cleanup
    if (typeof cleanup === "function") {
      console.log("🔌 useFrameExtraction 강제 cleanup");
      try {
        cleanup();
      } catch (error) {
        console.error("useFrameExtraction cleanup 오류:", error);
      }
    }

    // 상태 초기화
    setIsCameraReady(false);
    setCameraError("");
    setCameraInfo(null);
    setShowPermissionDialog(false);

    console.log(" 강제 정리 완료");
  }, [cleanup]);

  // 카메라 초기화 함수 (권한 체크 포함)
  const initializeCamera = useCallback(
    async (deviceId) => {
      // 이미 정리된 상태거나 초기화 중이면 건너뛰기
      if (
        cleanupExecutedRef.current ||
        isInitializingRef.current ||
        !isMountedRef.current
      ) {
        console.log(" 초기화 건너뛰기:", {
          cleanupExecuted: cleanupExecutedRef.current,
          isInitializing: isInitializingRef.current,
          isMounted: isMountedRef.current,
        });
        return;
      }

      isInitializingRef.current = true;
      console.log(" 카메라 초기화 시작:", deviceId);

      try {
        // 권한 상태 확인
        const permissionStatus = await checkCameraPermission();

        if (permissionStatus === "denied") {
          setCameraError(
            "카메라 접근이 차단되었습니다. 브라우저 설정에서 권한을 허용해 주세요."
          );
          return;
        }

        // 기존 스트림 정리
        if (streamRef.current) {
          console.log(" 기존 스트림 정리");
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // 컴포넌트가 언마운트되었는지 다시 체크
        if (!isMountedRef.current || cleanupExecutedRef.current) {
          console.log(" 초기화 중 언마운트 감지");
          return;
        }

        const constraints = {
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: deviceId ? undefined : "user",
          },
          audio: false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );

        // 스트림 획득 후 다시 마운트 상태 확인
        if (!isMountedRef.current || cleanupExecutedRef.current) {
          console.log(" 스트림 획득 후 언마운트 감지, 스트림 정리");
          newStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = newStream;

        if (videoRef.current && isMountedRef.current) {
          videoRef.current.srcObject = newStream;

          // 메타데이터 로드 핸들러
          const handleLoadedMetadata = () => {
            if (!isMountedRef.current || cleanupExecutedRef.current) return;

            videoRef.current
              ?.play()
              .then(() => {
                if (!isMountedRef.current || cleanupExecutedRef.current) return;

                console.log(" 비디오 재생 시작!");
                setIsCameraReady(true);
                setCameraError("");

                const videoTrack = newStream.getVideoTracks()[0];
                if (videoTrack) {
                  const settings = videoTrack.getSettings();
                  setCameraInfo({
                    width: settings.width,
                    height: settings.height,
                    deviceLabel: videoTrack.label,
                  });
                }
              })
              .catch((playErr) => {
                console.error(" 비디오 재생 실패:", playErr);
                if (isMountedRef.current && !cleanupExecutedRef.current) {
                  setCameraError("비디오 재생에 실패했습니다.");
                }
              });
          };

          videoRef.current.onloadedmetadata = handleLoadedMetadata;
        }
      } catch (err) {
        console.error(" 카메라 접근 실패:", err);
        if (isMountedRef.current && !cleanupExecutedRef.current) {
          if (err.name === "NotAllowedError") {
            setCameraError(
              "카메라 접근 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해 주세요."
            );
          } else if (err.name === "NotFoundError") {
            setCameraError(
              "카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해 주세요."
            );
          } else {
            setCameraError("카메라 접근에 실패했습니다: " + err.message);
          }
          setIsCameraReady(false);
        }
      } finally {
        isInitializingRef.current = false;
      }
    },
    [checkCameraPermission]
  );

  // 디바이스 목록 가져오기
  const getDevices = useCallback(async () => {
    if (!isMountedRef.current || cleanupExecutedRef.current) return;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");

      if (isMountedRef.current && !cleanupExecutedRef.current) {
        setAvailableDevices(videoDevices);

        if (videoDevices.length > 0 && !selectedDeviceId) {
          const firstDevice = videoDevices[0].deviceId;
          setSelectedDeviceId(firstDevice);
          return firstDevice;
        }
      }
    } catch (error) {
      console.error("디바이스 조회 실패:", error);
      if (isMountedRef.current && !cleanupExecutedRef.current) {
        setCameraError("카메라 장치를 조회하는 데 실패했습니다.");
      }
    }

    return selectedDeviceId;
  }, [selectedDeviceId]);

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    console.log(" VideoPage 마운트");
    isMountedRef.current = true;
    cleanupExecutedRef.current = false;

    // 권한 상태 확인 및 초기화
    const initialize = async () => {
      if (!isMountedRef.current || cleanupExecutedRef.current) return;

      const permissionStatus = await checkCameraPermission();
      console.log(" 초기 권한 상태:", permissionStatus);

      // 권한이 명시적으로 거부된 경우가 아니라면 디바이스 조회 시도
      if (permissionStatus !== "denied") {
        const deviceId = await getDevices();
        if (deviceId && isMountedRef.current && !cleanupExecutedRef.current) {
          // React StrictMode를 고려하여 약간의 지연 후 초기화
          initTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && !cleanupExecutedRef.current) {
              initializeCamera(deviceId);
            }
          }, 100);
        }
      } else {
        setCameraError(
          "카메라 접근이 차단되었습니다. 브라우저 설정에서 권한을 허용하거나 아래 버튼을 클릭해 주세요."
        );
      }
    };

    initialize();

    // cleanup 함수 - 컴포넌트 언마운트 시에만 실행
    return () => {
      console.log(" VideoPage 언마운트");
      forceCleanup();
    };
  }, []); // 빈 의존성 배열

  // selectedDeviceId 변경 시에만 카메라 재초기화
  useEffect(() => {
    if (
      !selectedDeviceId ||
      !isMountedRef.current ||
      cleanupExecutedRef.current
    )
      return;

    console.log(" 카메라 디바이스 변경:", selectedDeviceId);

    // 기존 스트림 정리 후 새 디바이스로 초기화
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // 약간의 지연 후 새 디바이스로 초기화
    initTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && !cleanupExecutedRef.current) {
        initializeCamera(selectedDeviceId);
      }
    }, 200);

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [selectedDeviceId, initializeCamera]);

  // 페이지 이탈 감지 - 최우선 정리
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      console.log(" beforeunload 감지");
      forceCleanup();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log(" 페이지 숨김 감지");
        forceCleanup();
      }
    };

    const handlePageHide = () => {
      console.log(" pagehide 감지");
      forceCleanup();
    };

    const handleFocus = () => {
      if (document.hidden) {
        console.log(" 포커스 이동 감지");
        forceCleanup();
      }
    };

    // 여러 이벤트로 확실한 정리 보장
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("blur", handleFocus);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("blur", handleFocus);
    };
  }, [forceCleanup]);

  const speakText = useCallback((text) => {
    if ("speechSynthesis" in window && isMountedRef.current) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    if (result?.label && isMountedRef.current) {
      const newTranslation = result.label;
      setTranslationText(newTranslation);
      setTranslationHistory((prev) => [
        {
          id: Date.now(),
          text: newTranslation,
          confidence: result.confidence || 0,
          timestamp: new Date(),
          status: false, // 평가되지 않은 상태
        },
        ...prev.slice(0, 9),
      ]);
      if (isSpeechEnabled && newTranslation) {
        speakText(newTranslation);
      }
    }
  }, [result, isSpeechEnabled, speakText]);

  const getConnectionStatusIcon = () => {
    switch (connectionState) {
      case "OPEN":
        return <Wifi size={16} className="text-green-500" />;
      case "CONNECTING":
        return (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <WifiOff size={16} className="text-red-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case "OPEN":
        return "WebSocket 연결됨";
      case "CONNECTING":
        return "연결 중...";
      case "CLOSING":
        return "연결 종료 중...";
      default:
        return "WebSocket 연결 안됨";
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case "OPEN":
        return "border-green-500/30 bg-green-500/10";
      case "CONNECTING":
        return "border-blue-500/30 bg-blue-500/10";
      default:
        return "border-red-500/30 bg-red-500/10";
    }
  };

  const toggleRecording = useCallback(async () => {
    if (!videoRef.current || !isCameraReady || !isMountedRef.current) {
      console.error("카메라가 준비되지 않아 녹화를 시작/중단할 수 없습니다.");
      return;
    }
    try {
      if (!isProcessing) {
        await startFrameExtraction(videoRef.current);
      } else {
        stopFrameExtraction();
      }
    } catch (error) {
      console.error("Recording toggle error:", error);
    }
  }, [isProcessing, isCameraReady, startFrameExtraction, stopFrameExtraction]);

  const restartCamera = useCallback(async () => {
    if (!isMountedRef.current) return;

    console.log(" 페이지 새로고침");

    // 페이지 새로고침
    window.location.reload();
  }, []);

  const switchDevice = useCallback((deviceId) => {
    if (!isMountedRef.current || cleanupExecutedRef.current) return;
    console.log(" 디바이스 변경:", deviceId);
    setSelectedDeviceId(deviceId);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 권한 요청 핸들러
  const handleRequestPermission = useCallback(async () => {
    const granted = await requestCameraPermission();
    if (granted && selectedDeviceId) {
      setTimeout(() => {
        if (isMountedRef.current && !cleanupExecutedRef.current) {
          initializeCamera(selectedDeviceId);
        }
      }, 200);
    }
  }, [requestCameraPermission, selectedDeviceId, initializeCamera]);

  // 컴포넌트가 정리된 상태면 렌더링하지 않음
  if (cleanupExecutedRef.current) {
    return null;
  }

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        theme === "high-contrast"
          ? "bg-black text-yellow-400"
          : isDarkMode
          ? "bg-gray-900"
          : "bg-gray-50"
      }`}
    >
      {/* 권한 요청 다이얼로그 */}
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className={`
              rounded-2xl p-8 max-w-md mx-4 border shadow-2xl
              ${
                theme === "high-contrast"
                  ? "bg-black border-yellow-400 border-4"
                  : isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }
            `}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera size={28} className="text-white" />
              </div>
              <h3
                className={`text-xl font-bold mb-3 ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-white"
                    : "text-gray-800"
                }`}
              >
                카메라 권한 요청
              </h3>
              <p
                className={`mb-6 ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-gray-300"
                    : "text-gray-600"
                }`}
              >
                수어 번역 서비스를 이용하기 위해 카메라 접근 권한이 필요합니다.
                브라우저에서 권한 요청이 나타나면 '허용'을 클릭해 주세요.
              </p>
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full h-screen flex flex-col lg:flex-row">
        {/* 비디오 영역 */}
        <div className="flex-1 relative p-4">
          <div
            className={`
              w-full h-full rounded-3xl shadow-2xl overflow-hidden relative border
              ${
                theme === "high-contrast"
                  ? "bg-black border-yellow-400 border-4"
                  : isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }
            `}
          >
            {/* 상단 상태 바 */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {/* 권한 상태 표시
                <div
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border
                    ${
                      permissionState === 'granted'
                        ? theme === "high-contrast"
                          ? "bg-black text-yellow-400 border-2 border-yellow-400"
                          : "border-green-500/30 bg-green-500/10 text-green-500"
                        : permissionState === 'denied'
                        ? theme === "high-contrast"
                          ? "bg-black text-yellow-400 border-2 border-yellow-400"
                          : "border-red-500/30 bg-red-500/10 text-red-500"
                        : theme === "high-contrast"
                          ? "bg-black text-yellow-400 border-2 border-yellow-400"
                          : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                    }
                  `}
                >
                  <Shield size={16} />
                  <span>
                    {permissionState === 'granted' 
                      ? '카메라 허용됨' 
                      : permissionState === 'denied'
                      ? '카메라 차단됨'
                      : '권한 확인 중'}
                  </span>
                </div> */}
                <div
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border
                    ${
                      theme === "high-contrast"
                        ? "bg-black text-yellow-400 border-2 border-yellow-400"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-200"
                        : "bg-gray-100 text-gray-700"
                    } ${getConnectionStatusColor()}
                  `}
                >
                  {getConnectionStatusIcon()}
                  <span>{getConnectionStatusText()}</span>
                </div>
                {isProcessing && (
                  <div
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold
                      ${
                        theme === "high-contrast"
                          ? "bg-black text-yellow-400 border-2 border-yellow-400"
                          : isDarkMode
                          ? "bg-red-500/20 text-red-300"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    수어 분석 중
                  </div>
                )}
                {sessionStats && (
                  <div
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-semibold
                      ${
                        theme === "high-contrast"
                          ? "bg-black text-yellow-400 border-2 border-yellow-400"
                          : isDarkMode
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-blue-100 text-blue-700"
                      }
                    `}
                  >
                    FPS: {sessionStats.fps || 0}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isCameraReady && cameraInfo && (
                  <div
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-semibold
                      ${
                        theme === "high-contrast"
                          ? "bg-black text-yellow-400 border-2 border-yellow-400"
                          : isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }
                    `}
                  >
                    {cameraInfo.width}×{cameraInfo.height}
                  </div>
                )}
                <button
                  onClick={toggleFullscreen}
                  className={`
                    p-2 rounded-xl transition-all duration-200
                    ${
                      theme === "high-contrast"
                        ? "bg-black text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                        : isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-gray-100"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                    }
                  `}
                >
                  {isFullscreen ? (
                    <Minimize size={18} />
                  ) : (
                    <Maximize size={18} />
                  )}
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`
                    p-2 rounded-xl transition-all duration-200
                    ${
                      theme === "high-contrast"
                        ? "bg-black text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                        : isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-gray-100"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                    }
                  `}
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>

            {/* 비디오 또는 에러 표시 */}
            {cameraError ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div
                    className={`w-20 h-20 border-2 rounded-full flex items-center justify-center mx-auto mb-6 ${
                      theme === "high-contrast"
                        ? "border-yellow-400 text-yellow-400"
                        : isDarkMode
                        ? "border-gray-200 text-gray-200"
                        : "border-gray-800 text-gray-800"
                    }`}
                  >
                    <AlertCircle size={32} />
                  </div>
                  <h3
                    className={`text-xl font-bold mb-3 ${
                      theme === "high-contrast"
                        ? "text-yellow-400"
                        : isDarkMode
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    카메라 오류
                  </h3>
                  <p
                    className={`mb-6 whitespace-pre-line text-sm leading-relaxed ${
                      theme === "high-contrast"
                        ? "text-yellow-400"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-600"
                    }`}
                  >
                    {cameraError}
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={restartCamera}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <RotateCcw size={18} />
                      새로 고침
                    </button>
                    {permissionState === "denied" && (
                      <>
                        <button
                          onClick={handleRequestPermission}
                          className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg mb-3 ${
                            theme === "high-contrast"
                              ? "border-1 border-yellow-400 text-yellow-400"
                              : isDarkMode
                              ? "border-1 border-gray-200 text-gray-200"
                              : "border-1 border-gray-800 text-gray-800"
                          }`}
                        >
                          <Shield size={18} />
                          권한 다시 요청
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {frameError && (
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
                  {frameError}
                </div>
              </div>
            )}

            {showSettings && (
              <div
                className={`
                  absolute top-16 right-4 rounded-2xl p-6 shadow-2xl z-20 min-w-[280px] border
                  ${
                    theme === "high-contrast"
                      ? "bg-black border-yellow-400 border-4"
                      : isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }
                `}
              >
                <h4
                  className={`text-lg font-semibold mb-4 ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                >
                  카메라 설정
                </h4>
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        theme === "high-contrast"
                          ? "text-yellow-400"
                          : isDarkMode
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      카메라 선택
                    </label>
                    <select
                      value={selectedDeviceId || ""}
                      onChange={(e) => switchDevice(e.target.value)}
                      className={`
                        w-full rounded-lg px-3 py-2 text-sm border
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50
                        ${
                          theme === "high-contrast"
                            ? "bg-black border-yellow-400 border-2 text-yellow-400 focus:ring-yellow-400/50"
                            : isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }
                      `}
                    >
                      {availableDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label ||
                            `카메라 ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        theme === "high-contrast"
                          ? "text-yellow-400"
                          : isDarkMode
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      다크 모드
                    </label>
                    <button
                      onClick={toggleTheme}
                      className={`
                        w-full rounded-lg px-3 py-2 text-sm border transition-colors
                        ${
                          theme === "high-contrast"
                            ? "bg-black border-yellow-400 border-2 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                            : isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                            : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                        }
                      `}
                    >
                      {isDarkMode ? "라이트 모드로 변경" : "다크 모드로 변경"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 번역 결과 및 히스토리 패널 */}
        <div className="lg:w-96 p-4 flex flex-col gap-4">
          <div
            className={`
              rounded-2xl p-6 shadow-xl border
              ${
                theme === "high-contrast"
                  ? "bg-black border-yellow-400 border-4"
                  : isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }
            `}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-800"
              }`}
            >
              번역 결과
            </h3>
            <div
              className={`
                min-h-[120px] rounded-xl p-4 border
                ${
                  theme === "high-contrast"
                    ? "bg-black border-yellow-400 border-2"
                    : isDarkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                }
              `}
            >
              {translationText ? (
                <p
                  className={`text-lg font-medium ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                >
                  {translationText}
                </p>
              ) : (
                <p
                  className={`text-gray-400 italic ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  수어를 인식하면 여기에 번역 결과가 표시됩니다.
                </p>
              )}
            </div>
          </div>

          <div
            className={`
              flex-1 rounded-2xl p-6 shadow-xl border
              ${
                theme === "high-contrast"
                  ? "bg-black border-yellow-400 border-4"
                  : isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }
            `}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-800"
              }`}
            >
              번역 히스토리
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {translationHistory.length === 0 ? (
                <p
                  className={`text-sm italic ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  아직 번역 기록이 없습니다.
                </p>
              ) : (
                translationHistory.map((item, index) => (
                  <div
                    key={index}
                    className={`
                      p-3 rounded-lg border
                      ${
                        theme === "high-contrast"
                          ? "bg-black border-yellow-400"
                          : isDarkMode
                          ? "bg-gray-700/50 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                      }
                    `}
                  >
                    <p
                      className={`font-medium ${
                        theme === "high-contrast"
                          ? "text-yellow-400"
                          : isDarkMode
                          ? "text-white"
                          : "text-gray-800"
                      }`}
                    >
                      {item.text}
                    </p>
                    <div
                      className={`flex justify-between items-center mt-1 text-xs ${
                        theme === "high-contrast"
                          ? "text-yellow-400"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      <span>{item.timestamp.toLocaleTimeString()}</span>
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.confidence > 0.8
                              ? "bg-green-500"
                              : item.confidence > 0.6
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        />
                        {Math.round(item.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={toggleRecording}
              disabled={!videoRef.current || !isCameraReady}
              className={`
                flex-1 flex items-center justify-center gap-2 lg:gap-3 py-3 lg:py-4 px-4 lg:px-6 
                rounded-xl lg:rounded-2xl font-semibold text-base lg:text-lg 
                transition-all duration-300 transform hover:scale-[1.02] shadow-lg 
                disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed
                ${
                  isProcessing
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : theme === "high-contrast"
                    ? "bg-black text-yellow-400 border-4 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                    : isDarkMode
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }
              `}
            >
              {isProcessing ? (
                <>
                  <Square size={18} className="lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">번역 중단</span>
                  <span className="sm:hidden">중단</span>
                </>
              ) : (
                <>
                  <Play size={18} className="lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">번역 시작</span>
                  <span className="sm:hidden">시작</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all duration-200 ${
                isSpeechEnabled
                  ? theme === "high-contrast"
                    ? "border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    : "border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
                  : theme === "high-contrast"
                  ? "bg-black text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="음성 출력 토글"
            >
              {isSpeechEnabled ? (
                <Volume2 size={18} className="lg:w-5 lg:h-5" />
              ) : (
                <VolumeX size={18} className="lg:w-5 lg:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
