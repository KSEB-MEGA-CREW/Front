import React, { useState, useEffect } from "react";
import {
  Square,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Loader,
  AlertCircle,
  CheckCircle,
  Sparkles,
  User,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useUnityAvatar } from "../../hooks/useUnityAvatar";
import { useTextToSignAPI } from "../../hooks/useTextToSignAPI";
import { useTheme } from "../../Context/themeContext";

const AvatarPage = () => {
  const { isDarkMode } = useTheme();
  const [inputText, setInputText] = useState("");
  const [translationHistory, setTranslationHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [selectedPredefined, setSelectedPredefined] = useState("");
  const [currentTranslation, setCurrentTranslation] = useState(null);

  // Unity 아바타 훅
  const {
    isLoaded: isUnityLoaded,
    isLoading: isUnityLoading,
    error: unityError,
    isPlaying,
    // currentAnimation,
    containerRef,
    initializeUnity,
    sendAnimationData,
    stopAnimation,
    resetAvatar,
  } = useUnityAvatar();

  // 텍스트-수어 변환 API 훅
  const {
    isLoading: isConversionLoading,
    error: conversionError,
    convertTextToSignLanguage,
    // getPredefinedSignLanguages,
    clearError,
  } = useTextToSignAPI();

  // 미리 정의된 수어 구문들
  const predefinedPhrases = [
    "안녕하세요",
    "감사합니다",
    "죄송합니다",
    "네, 알겠습니다",
    "아니요",
    "도움이 필요합니다",
    "괜찮습니다",
    "잘 부탁드립니다",
  ];

  // Unity 초기화
  useEffect(() => {
    if (!isUnityLoaded && !isUnityLoading && !unityError) {
      initializeUnity();
    }
  }, [isUnityLoaded, isUnityLoading, unityError, initializeUnity]);

  // 텍스트를 수어로 변환하고 아바타에 전송
  const handleConvertToSignLanguage = async (text) => {
    if (!text.trim()) return;

    try {
        clearError();
        const result = await convertTextToSignLanguage(text);
        
        if (result.success) {
            console.log('✅ 번역 요청 전송 완료:', result.data);
            
            // 즉시 응답 처리 (실제 애니메이션은 WebSocket으로 받을 예정)
            const newTranslation = {
                id: Date.now(),
                text: text,
                timestamp: new Date(),
                requestId: result.data.requestId,
                status: result.data.status, // "SUBMITTED"
                confidence: 0.0, // WebSocket으로 업데이트 예정
                duration: 0 // WebSocket으로 업데이트 예정
            };
            
            setCurrentTranslation(newTranslation);
            setTranslationHistory(prev => [newTranslation, ...prev.slice(0, 9)]);
            
            // 음성 출력
            if (isSpeechEnabled) {
                speakText(text);
            }
            
            // TODO: WebSocket으로 실제 애니메이션 데이터 대기

        }
    } catch (error) {
        console.error("수어 변환 오류:", error);
        setError(error.message);
    }
  };

  // 텍스트 음성 출력
  const speakText = (text) => {
    if (text && isSpeechEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 미리 정의된 구문 선택
  const handlePredefinedSelect = (phrase) => {
    setInputText(phrase);
    setSelectedPredefined(phrase);
  };

  // 입력 초기화
  const clearInput = () => {
    setInputText("");
    setSelectedPredefined("");
    setCurrentTranslation(null);
  };

  // 기록 초기화
  const clearHistory = () => {
    setTranslationHistory([]);
  };

  // 아바타 정지
  const handleStopAnimation = () => {
    stopAnimation();
    setCurrentTranslation(null);
  };

  const getStatusColor = () => {
    if (unityError || conversionError) return "text-red-500";
    if (isConversionLoading || isUnityLoading) return "text-yellow-500";
    if (isUnityLoaded && !isPlaying) return "text-green-500";
    if (isPlaying) return "text-blue-500";
    return "text-gray-500";
  };

  const getStatusText = () => {
    if (unityError) return "Unity 로딩 오류";
    if (conversionError) return "AI 변환 오류";
    if (isConversionLoading) return "AI 변환 중...";
    if (isUnityLoading) return "Unity 로딩 중...";
    if (isPlaying) return "수어 재생 중";
    if (isUnityLoaded) return "준비 완료";
    return "초기화 중...";
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* 메인 컨테이너 */}
      <div className="relative w-full h-screen flex flex-col xl:flex-row">
        {/* Unity 아바타 영역 */}
        <div className="flex-1 relative p-4">
          <div
            className={`
            w-full h-full rounded-3xl shadow-2xl overflow-hidden relative border
            ${
              isDarkMode
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
                  flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold
                  ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-200"
                      : "bg-gray-100 text-gray-700"
                  } ${getStatusColor()}
                `}
                >
                  {isUnityLoading || isConversionLoading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : unityError || conversionError ? (
                    <AlertCircle size={16} />
                  ) : isUnityLoaded ? (
                    <CheckCircle size={16} />
                  ) : (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{getStatusText()}</span>
                </div>

                {isPlaying && currentTranslation && (
                  <div
                    className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold
                    ${
                      isDarkMode
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-purple-100 text-purple-700"
                    }
                  `}
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    재생 중: {currentTranslation.text}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentTranslation && (
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
                    신뢰도: {Math.round(currentTranslation.confidence * 100)}%
                  </div>
                )}

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

            {/* Unity WebGL 컨테이너 또는 에러 표시 */}
            {unityError || conversionError ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} className="text-red-600" />
                  </div>
                  <h3
                    className={`text-xl font-bold mb-3 ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {unityError ? "Unity 로딩 오류" : "AI 서버 오류"}
                  </h3>
                  <p
                    className={`mb-6 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {unityError || conversionError}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <RotateCcw size={18} />
                    페이지 새로고침
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {/* Unity WebGL 컨테이너 */}
                <div
                  ref={containerRef}
                  className="w-full max-w-4xl h-full max-h-[600px] bg-gray-900/10 rounded-2xl border border-white/10"
                  style={{ minHeight: "400px" }}
                />

                {/* 로딩 오버레이 */}
                {(isUnityLoading || isConversionLoading) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div
                      className={`
                      text-lg font-semibold px-8 py-4 rounded-2xl shadow-2xl 
                      border flex items-center gap-3
                      ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-gray-200"
                          : "bg-white border-gray-200 text-gray-800"
                      }
                    `}
                    >
                      <Loader
                        size={24}
                        className="animate-spin text-purple-600"
                      />
                      {isUnityLoading
                        ? "Unity 아바타 로딩 중..."
                        : "AI가 수어를 생성하고 있습니다..."}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 설정 패널 */}
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
                  아바타 설정
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      음성 출력
                    </span>
                    <button
                      onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isSpeechEnabled
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isSpeechEnabled ? (
                        <Volume2 size={16} />
                      ) : (
                        <VolumeX size={16} />
                      )}
                    </button>
                  </div>

                  <div
                    className={`pt-2 border-t ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={resetAvatar}
                        disabled={!isUnityLoaded}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 text-blue-700 disabled:text-gray-400 rounded-lg transition-all duration-200 text-sm"
                      >
                        <User size={16} />
                        아바타 리셋
                      </button>

                      <button
                        onClick={handleStopAnimation}
                        disabled={!isPlaying}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 text-red-700 disabled:text-gray-400 rounded-lg transition-all duration-200 text-sm"
                      >
                        <Square size={16} />
                        정지
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 텍스트 입력 및 제어 영역 */}
        <div className="w-full xl:w-96 p-4 flex flex-col max-h-[50vh] xl:max-h-none">
          {/* 텍스트 입력 */}
          <div
            className={`
            rounded-2xl shadow-lg p-6 mb-4 border
            ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare
                size={20}
                className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              />
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                텍스트 입력
              </h3>
            </div>

            <div className="space-y-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="수어로 변환할 텍스트를 입력하세요..."
                className={`
                  w-full h-32 rounded-xl p-4 resize-none 
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 
                  transition-all duration-200 border
                  ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                      : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500"
                  }
                `}
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleConvertToSignLanguage(inputText)}
                  disabled={
                    !inputText.trim() || !isUnityLoaded || isConversionLoading
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:transform-none text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                >
                  {isConversionLoading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  수어 변환
                </button>

                <button
                  onClick={clearInput}
                  className={`
                    p-3 rounded-xl transition-all duration-200
                    ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }
                  `}
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* 미리 정의된 구문 */}
          <div
            className={`
            rounded-2xl shadow-lg p-6 mb-4 border
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
              자주 사용하는 구문
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {predefinedPhrases.map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => handlePredefinedSelect(phrase)}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    selectedPredefined === phrase
                      ? "bg-purple-500 text-white shadow-lg"
                      : isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          {/* 변환 기록 */}
          <div
            className={`
            rounded-2xl shadow-lg p-6 flex-1 border
            ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock
                  size={20}
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                />
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  변환 기록
                </h3>
              </div>
              <button
                onClick={clearHistory}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  }
                `}
                title="기록 지우기"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {translationHistory.length === 0 ? (
                <p
                  className={`text-center py-8 italic ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  변환 기록이 없습니다
                </p>
              ) : (
                translationHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`
                    rounded-lg p-3 border
                    ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-200"
                    }
                  `}
                  >
                    <p
                      className={`text-sm leading-relaxed mb-2 ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {item.text}
                    </p>
                    <div
                      className={`flex items-center justify-between text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <span>{item.timestamp.toLocaleTimeString()}</span>
                      <div className="flex items-center gap-2">
                        <span>신뢰도 {Math.round(item.confidence * 100)}%</span>
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.confidence > 0.8
                              ? "bg-green-500"
                              : item.confidence > 0.6
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarPage;
