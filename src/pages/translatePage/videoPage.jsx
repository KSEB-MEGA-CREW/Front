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
  const { isDarkMode } = useTheme();
  const videoRef = useRef(null);

  const streamRef = useRef(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [cameraInfo, setCameraInfo] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const [translationText, setTranslationText] = useState("");
  const [translationHistory, setTranslationHistory] = useState([]);

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

  const getCamera = useCallback(async (deviceId) => {

    if (!videoRef.current) {
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          facingMode: deviceId ? undefined : "user",
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = newStream;
      videoRef.current.srcObject = newStream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current
          .play()
          .then(() => {
            setIsCameraReady(true);
            setCameraError("");

            const videoTrack = newStream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            setCameraInfo({
              width: settings.width,
              height: settings.height,
              deviceLabel: videoTrack.label,
            });
          })
          .catch((playErr) => {
            setCameraError("비디오 재생에 실패했습니다.");
          });
      };
    } catch (err) {
      setCameraError("카메라 접근에 실패했습니다. 권한을 확인해 주세요.");
      setIsCameraReady(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeCameraAndDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!isMounted) return;

        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setAvailableDevices(videoDevices);

        const currentDeviceExists = videoDevices.some(
          (d) => d.deviceId === selectedDeviceId
        );
        if (videoDevices.length > 0 && !currentDeviceExists) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        } else if (currentDeviceExists) {
          await getCamera(selectedDeviceId);
        }
      } catch (err) {
        if (isMounted) {
          setCameraError("카메라 초기화에 실패했습니다.");
        }
      }
    };

    if (selectedDeviceId) {
      getCamera(selectedDeviceId);
    } else {
      initializeCameraAndDevices();
    }

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [selectedDeviceId, getCamera, cleanup]);

  useEffect(() => {
    if (result?.label) {
      const newTranslation = result.label;
      setTranslationText(newTranslation);
      setTranslationHistory((prev) => [
        {
          text: newTranslation,
          confidence: result.confidence || 0,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9),
      ]);
      if (isSpeechEnabled && newTranslation) {
        speakText(newTranslation);
      }
    }
  }, [result, isSpeechEnabled]);

  const speakText = useCallback((text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

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
        return "border-1 border-green-400";
      case "CONNECTING":
        return "border-1 border-blue-400";
      default:
        return "border-1 border-red-400";
    }
  };

  const toggleRecording = useCallback(async () => {
    if (!videoRef.current) {
      return;
    }
    try {
      if (!isProcessing) {
        await startFrameExtraction(videoRef.current);
      } else {
        stopFrameExtraction();
      }
    } catch (error) {
    }
  }, [isProcessing, startFrameExtraction, stopFrameExtraction]);

  const restartCamera = useCallback(async () => {
    setCameraError("");
    await getCamera(selectedDeviceId);
  }, [getCamera, selectedDeviceId]);

  const switchDevice = useCallback((deviceId) => {
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

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="relative w-full h-screen flex flex-col lg:flex-row">
        <div className="flex-1 relative p-4">
          <div
            className={`
              w-full h-full rounded-3xl overflow-hidden relative border
              ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }
            `}
          >
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border
                    ${
                      isDarkMode ? "text-gray-200" : " text-gray-700"
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
                        isDarkMode
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
                        isDarkMode
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
                        isDarkMode
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
                      isDarkMode
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
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-gray-100"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                    }
                  `}
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>
            {cameraError ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} className="text-white" />
                  </div>
                  <h3
                    className={`text-xl font-bold mb-3 ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    카메라 오류
                  </h3>
                  <p
                    className={`mb-6 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {cameraError}
                  </p>
                  <button
                    onClick={restartCamera}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
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
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }
                `}
              >
                <h4
                  className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  카메라 설정
                </h4>
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
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
                          isDarkMode
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
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="lg:w-96 p-4 flex flex-col gap-4">
          <div
            className={`
              rounded-2xl p-6 shadow-xl border
              ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }
            `}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              번역 결과
            </h3>
            <div
              className={`
                min-h-[120px] rounded-xl p-4 border
                ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                }
              `}
            >
              {translationText ? (
                <p
                  className={`text-lg font-medium ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {translationText}
                </p>
              ) : (
                <p
                  className={`text-gray-400 italic ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
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
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }
            `}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              번역 히스토리
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {translationHistory.length === 0 ? (
                <p
                  className={`text-sm italic ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
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
                        isDarkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                      }
                    `}
                  >
                    <p
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {item.text}
                    </p>
                    <div
                      className={`flex justify-between items-center mt-1 text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
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
              disabled={!isCameraReady}
              className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 py-3 lg:py-4 px-4 lg:px-6 rounded-xl lg:rounded-2xl font-semibold text-base lg:text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
                isProcessing
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:transform-none"
              }`}
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
                  ? isDarkMode
                    ? " border-1 border-gray-400 text-gray-300 hover:bg-gray-500"
                    : " border-1 border-gray-400 text-gray-600 hover:bg-gray-400"
                  : isDarkMode
                  ? " border-1 border-gray-400 text-gray-300 hover:bg-gray-500"
                  : " border-1 border-gray-400 text-gray-600 hover:bg-gray-400"
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
