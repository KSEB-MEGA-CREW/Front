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
  Shield,
} from "lucide-react";

const VideoPage = () => {
  const videoRef = useRef(null);
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const [translationText, setTranslationText] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [translationHistory, setTranslationHistory] = useState([]);

  // useFrameExtraction 훅에서 필요한 상태와 함수를 가져옴
  const {
    isProcessing,
    result,
    error: frameError,
    connectionState,
    sessionStats,
    stream, // 훅에서 관리되는 스트림 상태
    startFrameExtraction,
    stopFrameExtraction,
    cleanup,
  } = useFrameExtraction();

  // 수동 초기화 제거

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      console.log("VideoPage 언마운트: 시스템 정리");
      cleanup();
    };
  }, [cleanup]);

  // stream 상태가 변경될 때마다 비디오 요소에 연결
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log("스트림 연결");
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play()
          .then(() => setIsCameraReady(true))
          .catch(err => console.error("비디오 재생 실패:", err));
      };
    }
  }, [stream]);

  const speakText = useCallback((text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // 번역 결과 업데이트 및 음성 출력
  useEffect(() => {
    if (result?.translatedText) {
      const newTranslation = result.translatedText;
      setTranslationText(newTranslation);
      setTranslationHistory((prev) => [
        {
          id: Date.now(),
          text: newTranslation,
          confidence: result.confidence || 0,
          timestamp: new Date(),
          status: false,
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
    if (!videoRef.current || !isCameraReady) {
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

  const restartCamera = useCallback(() => {
    console.log(" 페이지 새로고침");
    window.location.reload();
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
        theme === "high-contrast"
          ? "bg-black text-yellow-400"
          : isDarkMode
          ? "bg-gray-900"
          : "bg-gray-50"
      }`}
    >
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
            {frameError ? (
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
                    {frameError}
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={restartCamera}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <RotateCcw size={18} />
                      새로 고침
                    </button>
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
                      음성 출력
                    </label>
                    <button
                      onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
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
                      {isSpeechEnabled ? "음성 출력 켜짐" : "음성 출력 꺼짐"}
                    </button>
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