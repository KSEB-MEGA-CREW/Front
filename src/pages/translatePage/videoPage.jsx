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
} from "lucide-react";

const VideoPage = () => {
  const videoRef = useRef(null);
  const [translationText, setTranslationText] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [stream, setStream] = useState(null);
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [cameraInfo, setCameraInfo] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [translationHistory, setTranslationHistory] = useState([]);

  // 웹소켓 아키텍처 기반 프레임 추출 훅 사용
  const {
    isProcessing,
    result,
    error: frameError,
    status,
    isConnected,
    connectionState,
    sessionStats,
    startFrameExtraction,
    stopFrameExtraction,
    cleanup,
  } = useFrameExtraction();

  // 디버깅: 훅에서 가져온 함수들 확인
  useEffect(() => {
    console.log("🔧 useFrameExtraction 훅 함수들:", {
      startFrameExtraction: typeof startFrameExtraction,
      stopFrameExtraction: typeof stopFrameExtraction,
      isProcessing,
      isConnected,
      connectionState,
    });
  }, [
    startFrameExtraction,
    stopFrameExtraction,
    isProcessing,
    isConnected,
    connectionState,
  ]);

  // 카메라 스트림 설정
  const getCamera = useCallback(async () => {
    console.log("📷 카메라 초기화 시작...");
    console.log("현재 스트림 상태:", !!stream);
    console.log("선택된 장치 ID:", selectedDeviceId);

    try {
      if (stream) {
        console.log("기존 스트림 정리 중...");
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          facingMode: selectedDeviceId ? undefined : "user",
        },
        audio: false,
      };

      console.log("📷 getUserMedia 호출 중...", constraints);
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("✅ 스트림 획득 성공:", newStream);

      setStream(newStream);

      if (videoRef.current) {
        console.log("📺 비디오 요소에 스트림 연결 중...");
        videoRef.current.srcObject = newStream;

        videoRef.current.onloadedmetadata = () => {
          console.log("📺 비디오 메타데이터 로드 완료");
          console.log("비디오 크기:", {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          });

          videoRef.current
            .play()
            .then(() => {
              console.log("✅ 비디오 재생 시작!");
              setIsCameraReady(true);
              setCameraError("");

              // 카메라 정보 설정
              const videoTrack = newStream.getVideoTracks()[0];
              const settings = videoTrack.getSettings();
              setCameraInfo({
                width: settings.width,
                height: settings.height,
                deviceLabel: videoTrack.label,
              });

              console.log("📊 카메라 설정 완료:", settings);
            })
            .catch((playErr) => {
              console.error("❌ 비디오 재생 실패:", playErr);
              setCameraError("비디오 재생에 실패했습니다.");
            });
        };

        videoRef.current.onerror = (err) => {
          console.error("❌ 비디오 요소 오류:", err);
        };
      } else {
        console.error("❌ videoRef.current가 null입니다");
      }
    } catch (err) {
      console.error("❌ 카메라 접근 실패:", err);
      console.error("에러 타입:", err.name);
      console.error("에러 메시지:", err.message);

      setCameraError(
        "카메라 접근에 실패했습니다. 카메라 권한을 확인해 주세요."
      );
      setIsCameraReady(false);
    }
  }, [stream, selectedDeviceId]);

  // 카메라 초기화 useEffect 수정
  useEffect(() => {
    const initializeCamera = async () => {
      console.log("🚀 카메라 초기화 프로세스 시작");
      try {
        // 브라우저 권한 상태 확인
        try {
          const permission = await navigator.permissions.query({
            name: "camera",
          });
          console.log("📷 카메라 권한 상태:", permission.state);
        } catch (permErr) {
          console.log(
            "권한 확인 불가 (일부 브라우저에서 정상):",
            permErr.message
          );
        }

        // 사용 가능한 비디오 디바이스 목록 가져오기
        console.log("📋 비디오 디바이스 목록 조회 중...");
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        console.log("📋 발견된 비디오 디바이스:", videoDevices);

        setAvailableDevices(videoDevices);

        if (videoDevices.length > 0 && !selectedDeviceId) {
          console.log("📷 기본 디바이스 선택:", videoDevices[0].deviceId);
          setSelectedDeviceId(videoDevices[0].deviceId);
        } else if (selectedDeviceId) {
          // selectedDeviceId가 있을 때만 카메라 초기화
          await getCamera();
        }
      } catch (err) {
        console.error("❌ 카메라 초기화 실패:", err);
        setCameraError("카메라 초기화에 실패했습니다.");
      }
    };

    initializeCamera();

    // cleanup은 컴포넌트 언마운트 시에만 실행
    return () => {
      console.log("🧹 VideoPage unmount cleanup");
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      // cleanup(); // 이 줄 제거 - 무한 루프 원인
    };
  }, [selectedDeviceId]); // 의존성 배열 최소화

  // getCamera 호출을 위한 별도 useEffect
  useEffect(() => {
    if (selectedDeviceId) {
      console.log("📷 선택된 디바이스로 카메라 재시작:", selectedDeviceId);
      getCamera();
    }
  }, [selectedDeviceId]);

  // 웹소켓 결과 업데이트
  useEffect(() => {
    if (result?.label) {
      console.log("📝 번역 결과 수신:", result);
      const newTranslation = result.label;
      setTranslationText(newTranslation);

      // 번역 히스토리 업데이트
      setTranslationHistory((prev) => [
        {
          text: newTranslation,
          confidence: result.confidence || 0,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9), // 최근 10개만 유지
      ]);

      // TTS 음성 출력
      if (isSpeechEnabled && newTranslation) {
        speakText(newTranslation);
      }
    }
  }, [result, isSpeechEnabled]);

  // TTS 음성 출력
  const speakText = useCallback((text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // 이전 음성 중단
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // 웹소켓 연결 상태에 따른 아이콘 및 텍스트
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

  // 녹화/분석 토글 - 디버깅 로그 추가 및 카메라 체크 완화
  const toggleRecording = useCallback(async () => {
    console.log("🔴 toggleRecording 호출됨");
    console.log("카메라 상태:", {
      isCameraReady,
      videoRef: !!videoRef.current,
    });
    console.log("비디오 스트림 상태:", {
      srcObject: !!videoRef.current?.srcObject,
      videoWidth: videoRef.current?.videoWidth,
      videoHeight: videoRef.current?.videoHeight,
      readyState: videoRef.current?.readyState,
    });
    console.log("처리 상태:", { isProcessing, isConnected, connectionState });

    // 카메라 체크 완화 - 경고만 표시하고 계속 진행
    if (!isCameraReady) {
      console.warn("⚠️ 카메라가 완전히 준비되지 않았지만 계속 진행");
      if (!videoRef.current) {
        console.error("❌ 비디오 요소가 없어서 중단");
        return;
      }
    }

    try {
      if (!isProcessing) {
        console.log("📞 startFrameExtraction 호출 시도");
        console.log("전달할 비디오 요소:", videoRef.current);
        await startFrameExtraction(videoRef.current);
        console.log("✅ startFrameExtraction 호출 완료");
      } else {
        console.log("📞 stopFrameExtraction 호출 시도");
        stopFrameExtraction();
        console.log("✅ stopFrameExtraction 호출 완료");
      }
    } catch (error) {
      console.error("❌ Recording toggle error:", error);
      console.error("Error stack:", error.stack);
    }
  }, [
    isProcessing,
    isCameraReady,
    startFrameExtraction,
    stopFrameExtraction,
    isConnected,
    connectionState,
  ]);

  // 카메라 재시작
  const restartCamera = useCallback(async () => {
    console.log("🔄 카메라 재시작 시도");
    setCameraError("");
    await getCamera();
  }, [getCamera]);

  // 디바이스 변경
  const switchDevice = useCallback((deviceId) => {
    console.log("📷 디바이스 변경:", deviceId);
    setSelectedDeviceId(deviceId);
  }, []);

  // 전체화면 토글
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

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
      {/* 메인 컨테이너 */}
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
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} className="text-white" />
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
                    className={`mb-6 ${
                      theme === "high-contrast"
                        ? "text-yellow-400"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-600"
                    }`}
                  >
                    {cameraError}
                  </p>
                  <button
                    onClick={restartCamera}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <RotateCcw size={18} />
                    카메라 재시작
                  </button>
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

            {/* 프레임 에러 표시 */}
            {frameError && (
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
                  {frameError}
                </div>
              </div>
            )}

            {/* 설정 패널 */}
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
          {/* 현재 번역 결과 */}
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
                   ? ""
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

          {/* 번역 히스토리 */}

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

          {/* 컨트롤 버튼들 - WebSocket 연결 조건 제거 */}
          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={toggleRecording}
              disabled={!videoRef.current} // isCameraReady 조건 완화, 비디오 요소만 확인
              className={`
                 flex-1 flex items-center justify-center gap-2 lg:gap-3 py-3 lg:py-4 px-4 lg:px-6 
                 rounded-xl lg:rounded-2xl font-semibold text-base lg:text-lg 
                 transition-all duration-300 transform hover:scale-[1.02] shadow-lg 
                 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed
               ${
                 isProcessing
                   ? "bg-red-500 hover:bg-red-600 text-white" // '중단' 상태: 모든 테마에서 빨간색 유지
                   : theme === "high-contrast" // '시작' 상태: 테마별 스타일 적용
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
                  ? theme === "high-contrast" // ✨ 수정된 부분
                    ? "border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    : "border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
                  : theme === "high-contrast" // ✨ 수정된 부분
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
