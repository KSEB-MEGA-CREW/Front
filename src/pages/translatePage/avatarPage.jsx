import GLBAvatarPlayer from "./GLBAvatarPlayer.jsx";

import React, {
  useState,
  useEffect,
  useRef,
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
  User,
  MessageSquare,
  Clock,
} from "lucide-react";

import { useTheme } from "../../Context/themeContext";

const useUnityAvatar = () => {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 애니메이션 재생을 시뮬레이션하는 함수
  const sendAnimationData = () => {
    setIsPlaying(true);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
  };

  return {
    isLoaded: true, // Unity가 로드된 상태로 가정
    isLoading: false, // 로딩 중이 아닌 상태로 가정
    error: null, // 에러가 없는 상태로 가정
    isPlaying, // 현재 재생 상태
    containerRef,
    initializeUnity: () => {},
    sendAnimationData,
    stopAnimation,
    resetAvatar: () => {},
  };
};

// 3. useTextToSignAPI Hook Mock
// "../../hooks/useTextToSignAPI" 파일이 없어 임시로 생성합니다.
const useTextToSignAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const convertTextToSignLanguage = async (text) => {
    setIsLoading(true);
    // 1.5초 동안 API 호출을 시뮬레이션합니다.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
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
  const { theme, isDarkMode } = useTheme();
  const [inputText, setInputText] = useState("");
  const [translationHistory, setTranslationHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [selectedPredefined, setSelectedPredefined] = useState("");
  const [currentTranslation, setCurrentTranslation] = useState(null);
  const [animationUrl, setAnimationUrl] = useState("/만나서_반갑습니다.glb"); // 기본 애니메이션

  // Unity 아바타 훅
  const {
    isLoaded: isUnityLoaded,
    isLoading: isUnityLoading,
    error: unityError,
    isPlaying,
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

  

  // 미리 정의된 수어 구문들 (표시용 텍스트와 파일명 매핑)
  const predefinedPhrases = [
    { display: "안녕하세요", filename: "안녕하세요" },
    { display: "감사합니다", filename: "감사합니다" },
    { display: "알겠습니다", filename: "알겠습니다" },
    { display: "죄송합니다", filename: "죄송합니다" },
    { display: "괜찮아요", filename: "괜찮아요" },
    { display: "좋아요", filename: "좋아요" },
    { display: "싫어요", filename: "싫어요" },
    { display: "도움이 필요하신가요", filename: "help_needed" },
  ];

  // Unity 초기화
  useEffect(() => {
    if (!isUnityLoaded && !isUnityLoading && !unityError) {
      initializeUnity();
    }
  }, [isUnityLoaded, isUnityLoading, unityError, initializeUnity]);

  // 텍스트를 수어로 변환하고 아바타에 전송
  const handleConvertToSignLanguage = async (text, customFilename = null) => {
    if (!text.trim() || isPlaying) return;

     // customFilename이 없으면 predefinedPhrases에서 해당하는 filename 찾기
  let processedText = customFilename;
  if (!processedText) {
    const predefined = predefinedPhrases.find(p => p.display === text);
    processedText = predefined ? predefined.filename : text.replace(/ /g, '_');
  }
  
  const animationFileUrl = `/${processedText}.glb`;

    try {
      // GET 요청으로 파일 존재 여부 및 Content-Type 확인
      const response = await fetch(animationFileUrl);

      // SPA의 404 fallback (index.html 반환)을 피하기 위해 Content-Type 확인
      // 304 Not Modified 응답에서는 Content-Type이 없을 수 있으므로 추가 조건 포함
      const contentType = response.headers.get("Content-Type");
      if (response.ok && (contentType === "model/gltf-binary" || response.status === 304)) {
        // 파일이 존재하고 GLB 타입이 맞으면 애니메이션 재생
        setAnimationUrl(animationFileUrl);
        
        stopAnimation();
        setTimeout(() => {
          sendAnimationData();
        }, 10);

        const newTranslation = {
          id: Date.now(),
          text: text,
          timestamp: new Date(),
          requestId: `local-${Date.now()}`,
          status: "COMPLETED",
          // confidence: 1.0,  // 신뢰도 주석 처리
          duration: 3,
        };

        setCurrentTranslation(newTranslation);
        setTranslationHistory((prev) => [newTranslation, ...prev.slice(0, 9)]);

        if (isSpeechEnabled) {
          speakText(text);
        }
      } else {
        // 파일이 없거나 타입이 맞지 않으면 동작하지 않음
      }
    } catch (error) {
      console.error("애니메이션 파일 확인 중 오류 발생:", error);
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
  const handlePredefinedSelect = (phraseObj) => {
    setInputText(phraseObj.display);
    setSelectedPredefined(phraseObj.display);
    // 미리 정의된 구문은 바로 변환 실행
    // handleConvertToSignLanguage(phraseObj.display, phraseObj.filename);
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
        theme === 'high-contrast'
          ? "bg-black"
          : (isDarkMode ? "bg-gray-900" : "bg-gray-50")
      }`}
    >
      <div className="relative w-full h-screen flex flex-col xl:flex-row">
        <div className="flex-1 relative p-4">
          <div
            className={`w-full h-full rounded-3xl overflow-hidden relative border ${
              theme === 'high-contrast'
                ? "bg-black border-2 border-yellow-400"
                : (isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200")
            }`}
          >
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    theme === 'high-contrast'
                      ? "bg-black border-2 border-yellow-400 text-yellow-400"
                      : (isDarkMode
                        ? "bg-gray-700 text-gray-200"
                        : "bg-gray-100 text-gray-700")
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      theme === 'high-contrast'
                        ? "bg-black border-2 border-yellow-400 text-yellow-400"
                        : (isDarkMode
                          ? "bg-gray-700 text-[#ff4444]"
                          : "bg-gray-100 text-[#ff4444]")
                    }`}
                  >
                    <div className="w-2 h-2 bg-[#ff4444] rounded-full animate-pulse font-medium" />
                    재생 중: {currentTranslation.text}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* 신뢰도 배지 주석 처리
                {currentTranslation && (
                  <div
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                      theme === 'high-contrast'
                        ? "bg-black border-2 border-yellow-400 text-yellow-400"
                        : (isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700")
                    }`}
                  >
                    신뢰도: {Math.round(currentTranslation.confidence * 100)}%
                  </div>
                )}
                */}

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    theme === 'high-contrast'
                      ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : (isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-gray-100"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900")
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
                      theme === 'high-contrast'
                        ? "text-yellow-400"
                        : (isDarkMode ? "text-white" : "text-gray-800")
                    }`}
                  >
                    {unityError ? "Unity 로딩 오류" : "AI 서버 오류"}
                  </h3>
                  <p
                    className={`mb-6 ${
                      theme === 'high-contrast'
                        ? "text-yellow-400"
                        : (isDarkMode ? "text-gray-300" : "text-gray-600")
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
  className="w-full max-w-4xl h-full max-h-[600px] bg-gray-900/10 rounded-2xl border border-white/10"
  style={{ minHeight: "400px" }}
>
  <GLBAvatarPlayer
    avatarUrl="/avatar.glb"
    animationUrl={animationUrl} 
    play={isPlaying}
    dark={isDarkMode}
    onEnd={stopAnimation}
  />
</div>

                {(isUnityLoading || isConversionLoading) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div
                      className={`text-lg font-semibold px-8 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 ${
                        theme === 'high-contrast'
                          ? "bg-black border-2 border-yellow-400 text-yellow-400"
                          : (isDarkMode
                            ? "bg-gray-800 border-gray-700 text-gray-200"
                            : "bg-white border-gray-200 text-gray-800")
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
                  theme === 'high-contrast'
                    ? "bg-black border-2 border-yellow-400"
                    : (isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200")
                }`}
              >
                <h4
                  className={`text-lg font-semibold mb-4 ${
                    theme === 'high-contrast'
                      ? "text-yellow-400"
                      : (isDarkMode ? "text-white" : "text-gray-800")
                  }`}
                >
                  아바타 설정
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        theme === 'high-contrast'
                          ? "text-yellow-400"
                          : (isDarkMode ? "text-gray-300" : "text-gray-700")
                      }`}
                    >
                      음성 출력
                    </span>
                    <button
                      onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        theme === 'high-contrast'
                          ? "border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                          : (isSpeechEnabled
                            ? isDarkMode
                              ? "border-1 border-gray-400 hover:bg-gray-500 text-white"
                              : "border-1 border-gray-400 hover:bg-gray-500 text-gray-800"
                            : isDarkMode
                            ? "border-1 border-gray-400 hover:bg-gray-500 text-gray-300"
                            : "border-1 border-gray-400 hover:bg-gray-500 text-gray-600")
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
                      theme === 'high-contrast'
                        ? "border-yellow-400"
                        : (isDarkMode ? "border-gray-700" : "border-gray-200")
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={resetAvatar}
                        disabled={!isUnityLoaded}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
                          !isUnityLoaded
                            ? theme === 'high-contrast'
                              ? "bg-black border-2 border-yellow-400 text-yellow-400 opacity-50 cursor-not-allowed"
                              : (isDarkMode
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed")
                            : theme === 'high-contrast'
                            ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        <User size={16} />
                        리셋
                      </button>
                      <button
                        onClick={handleStopAnimation}
                        disabled={!isPlaying}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
                          !isPlaying
                            ? theme === 'high-contrast'
                              ? "bg-black border-2 border-yellow-400 text-yellow-400 opacity-50 cursor-not-allowed"
                              : (isDarkMode
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed")
                            : theme === 'high-contrast'
                            ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                            : "bg-[#ff4444] hover:bg-red-600 text-white"
                        }`}
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
              theme === 'high-contrast'
                ? "bg-black border-2 border-yellow-400"
                : (isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200")
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare
                size={20}
                className={`${
                  theme === 'high-contrast'
                    ? "text-yellow-400"
                    : (isDarkMode ? "text-gray-300" : "text-gray-700")
                }`}
              />
              <h3
                className={`text-lg font-semibold ${
                  theme === 'high-contrast'
                    ? "text-yellow-400"
                    : (isDarkMode ? "text-white" : "text-gray-800")
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
                  theme === 'high-contrast'
                    ? "bg-black border-2 border-yellow-400 text-yellow-400 placeholder-yellow-400"
                    : (isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                      : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500")
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
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-xl transition-all duration-300 transform shadow-lg ${
                    !inputText.trim() ||
                    !isUnityLoaded ||
                    isConversionLoading ||
                    isPlaying
                      ? theme === 'high-contrast'
                        ? "bg-black border-2 border-yellow-400 text-yellow-400 opacity-50 cursor-not-allowed"
                        : (isDarkMode
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed")
                      : theme === 'high-contrast'
                      ? "bg-black border-4 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : "bg-blue-500 hover:bg-blue-600 text-white hover:scale-[1.02]"
                  }`}
                >
                  수어 변환
                </button>
                <button
                  onClick={clearInput}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    theme === 'high-contrast'
                      ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : (isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600")
                  }`}
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl shadow-lg p-6 mb-4 border ${
              theme === 'high-contrast'
                ? "bg-black border-2 border-yellow-400"
                : (isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200")
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                theme === 'high-contrast'
                  ? "text-yellow-400"
                  : (isDarkMode ? "text-white" : "text-gray-800")
              }`}
            >
              자주 사용하는 구문
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {predefinedPhrases.map((phraseObj) => (
                <button
                  key={phraseObj.display}
                  onClick={() => handlePredefinedSelect(phraseObj)}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    selectedPredefined === phraseObj.display
                      ? theme === 'high-contrast'
                        ? "bg-yellow-400 text-black border-2 border-yellow-400"
                        : "bg-blue-500 text-white shadow-lg"
                      : theme === 'high-contrast'
                      ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : (isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700")
                  }`}
                >
                  {phraseObj.display}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`rounded-2xl shadow-lg p-6 flex-1 border ${
              theme === 'high-contrast'
                ? "bg-black border-2 border-yellow-400"
                : (isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200")
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock
                  size={20}
                  className={`${
                    theme === 'high-contrast'
                      ? "text-yellow-400"
                      : (isDarkMode ? "text-gray-300" : "text-gray-700")
                  }`}
                />
                <h3
                  className={`text-lg font-semibold ${
                    theme === 'high-contrast'
                      ? "text-yellow-400"
                      : (isDarkMode ? "text-white" : "text-gray-800")
                  }`}
                >
                  변환 기록
                </h3>
              </div>
              <button
                onClick={clearHistory}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  theme === 'high-contrast'
                    ? "hover:bg-yellow-400 text-yellow-400 hover:text-black border-2 border-yellow-400"
                    : (isDarkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-700")
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
                    theme === 'high-contrast'
                      ? "text-yellow-400"
                      : (isDarkMode ? "text-gray-400" : "text-gray-500")
                  }`}
                >
                  변환 기록이 없습니다
                </p>
              ) : (
                translationHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg p-3 border ${
                      theme === 'high-contrast'
                        ? "bg-black border-2 border-yellow-400"
                        : (isDarkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-50 border-gray-200")
                    }`}
                  >
                    <p
                      className={`text-sm leading-relaxed mb-2 ${
                        theme === 'high-contrast'
                          ? "text-yellow-400"
                          : (isDarkMode ? "text-gray-200" : "text-gray-800")
                      }`}
                    >
                      {item.text}
                    </p>
                    <div
                      className={`flex items-center justify-between text-xs ${
                        theme === 'high-contrast'
                          ? "text-yellow-400"
                          : (isDarkMode ? "text-gray-400" : "text-gray-500")
                      }`}
                    >
                      <span>{item.timestamp.toLocaleTimeString()}</span>
                      {/* 신뢰도 부분 주석 처리
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
                      */}
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