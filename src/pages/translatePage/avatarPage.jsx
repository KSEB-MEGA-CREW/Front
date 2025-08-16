import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
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

//=========== 오류 해결을 위한 Mock 코드 ===========//

// 1. ThemeContext Mock
// "../../Context/themeContext" 파일이 없어 임시로 생성합니다.
const ThemeContext = createContext();
const ThemeProvider = ({ children }) => {
  // 기본적으로 다크 모드를 사용하도록 설정합니다.
  const [isDarkMode, setIsDarkMode] = useState(true);
  const value = { isDarkMode, setIsDarkMode };
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
const useTheme = () => useContext(ThemeContext);

// 2. useUnityAvatar Hook Mock
// "../../hooks/useUnityAvatar" 파일이 없어 임시로 생성합니다.
const useUnityAvatar = () => {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 애니메이션 재생을 시뮬레이션하는 함수
  const sendAnimationData = () => {
    console.log("Mock: 애니메이션 데이터 전송 시도");
    setIsPlaying(true);
    // 3초 후에 애니메이션이 끝나는 것을 시뮬레이션합니다.
    setTimeout(() => {
      setIsPlaying(false);
      console.log("Mock: 애니메이션 종료");
    }, 3000);
  };

  return {
    isLoaded: true, // Unity가 로드된 상태로 가정
    isLoading: false, // 로딩 중이 아닌 상태로 가정
    error: null, // 에러가 없는 상태로 가정
    isPlaying, // 현재 재생 상태
    containerRef,
    initializeUnity: () => console.log("Mock: Unity 초기화"),
    sendAnimationData,
    stopAnimation: () => {
      console.log("Mock: 애니메이션 정지");
      setIsPlaying(false);
    },
    resetAvatar: () => console.log("Mock: 아바타 리셋"),
  };
};

// 3. useTextToSignAPI Hook Mock
// "../../hooks/useTextToSignAPI" 파일이 없어 임시로 생성합니다.
const useTextToSignAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const convertTextToSignLanguage = async (text) => {
    setIsLoading(true);
    console.log(`Mock API: "${text}" 변환 중...`);
    // 1.5초 동안 API 호출을 시뮬레이션합니다.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    console.log("Mock API: 변환 완료");
    return {
      success: true,
      data: { requestId: `mock-${Date.now()}`, status: "SUBMITTED" },
    };
  };

  return {
    isLoading,
    error: null,
    convertTextToSignLanguage,
    clearError: () => {},
  };
};

//=========== Mock 코드 종료 ===========//

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
    if (!text.trim() || isPlaying) return;

    try {
      clearError();
      const result = await convertTextToSignLanguage(text);

      if (result.success) {
        console.log("✅ 번역 요청 전송 완료:", result.data);
        sendAnimationData(); // 애니메이션 재생 시작

        const newTranslation = {
          id: Date.now(),
          text: text,
          timestamp: new Date(),
          requestId: result.data.requestId,
          status: result.data.status,
          confidence: Math.random() * 0.2 + 0.8, // 80% ~ 100% 사이의 랜덤 신뢰도
          duration: 3,
        };

        setCurrentTranslation(newTranslation);
        setTranslationHistory((prev) => [newTranslation, ...prev.slice(0, 9)]);

        if (isSpeechEnabled) {
          speakText(text);
        }
      }
    } catch (error) {
      console.error("수어 변환 오류:", error);
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
      <div className="relative w-full h-screen flex flex-col xl:flex-row">
        <div className="flex-1 relative p-4">
          <div
            className={`w-full h-full rounded-3xl shadow-2xl overflow-hidden relative border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-200"
                      : "bg-gray-100 text-gray-700"
                  } ${getStatusColor()}`}
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                      isDarkMode
                        ? "bg-gray-500 text-purple-300"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    <div className="w-2 h-2 bg-[#ff5555] rounded-full animate-pulse" />
                    재생 중: {currentTranslation.text}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentTranslation && (
                  <div
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    신뢰도: {Math.round(currentTranslation.confidence * 100)}%
                  </div>
                )}

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-gray-100"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>

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
                    {String(unityError || conversionError)}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <RotateCcw size={18} />
                    페이지 새로고침
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div
                  ref={containerRef}
                  className="w-full max-w-4xl h-full max-h-[600px] bg-gray-900/10 rounded-2xl border border-white/10 flex items-center justify-center"
                  style={{ minHeight: "400px" }}
                >
                  <p className={isDarkMode ? "text-gray-600" : "text-gray-400"}>
                    (Unity 아바타가 여기에 표시됩니다)
                  </p>
                </div>

                {(isUnityLoading || isConversionLoading) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div
                      className={`text-lg font-semibold px-8 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-gray-200"
                          : "bg-white border-gray-200 text-gray-800"
                      }`}
                    >
                      <Loader
                        size={24}
                        className="animate-spin text-blue-500"
                      />
                      {isUnityLoading
                        ? "Unity 아바타 로딩 중..."
                        : "AI가 수어를 생성하고 있습니다..."}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showSettings && (
              <div
                className={`absolute top-16 right-4 rounded-2xl p-6 shadow-2xl z-20 min-w-[280px] border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
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
                    <div className="flex items-center gap-2">
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

        <div className="w-full xl:w-96 p-4 flex flex-col max-h-[50vh] xl:max-h-none">
          <div
            className={`rounded-2xl shadow-lg p-6 mb-4 border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
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
                className={`w-full h-32 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500"
                }`}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleConvertToSignLanguage(inputText)}
                  disabled={
                    !inputText.trim() ||
                    !isUnityLoaded ||
                    isConversionLoading ||
                    isPlaying
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:transform-none text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                >
                  수어 변환
                </button>
                <button
                  onClick={clearInput}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl shadow-lg p-6 mb-4 border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
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
                      ? "bg-blue-500 text-white shadow-lg"
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

          <div
            className={`rounded-2xl shadow-lg p-6 flex-1 border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
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
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
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
                    className={`rounded-lg p-3 border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
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

// App 컴포넌트가 ThemeProvider를 사용하도록 설정
const App = () => {
  return (
    <ThemeProvider>
      <AvatarPage />
    </ThemeProvider>
  );
};

export default App;
