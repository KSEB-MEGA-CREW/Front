// /src/pages/avatarPage.jsx
import GLBAvatarPlayerRaw from "./GLBAvatarPlayer.jsx";

import React, { useState, useEffect, useRef, memo } from "react";
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
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { useTheme } from "../../Context/themeContext";
import TransHistoryModal from "../../components/modals/TransHistoryModal";

// 조건에 맞는 애니메이션 출력을 위한 상태 추가
const [animationType, setAnimationType] = useState('glb'); // 'glb' 또는 'unity'


/** GLBAvatarPlayer 메모이즈: 설정 토글 등 부모 리렌더 시 재마운트로 멈추는 현상 방지 */
const GLBAvatarPlayer = memo(GLBAvatarPlayerRaw);


/** =============== Mock: useTextToSignAPI =============== */
const useTextToSignAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const convertTextToSignLanguage = async (_text) => {
    setIsLoading(true);
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

/** =============== Page =============== */
const AvatarPage = () => {
  const { theme, isDarkMode } = useTheme();

  const [inputText, setInputText] = useState("");
  const [translationHistory, setTranslationHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [selectedPredefined, setSelectedPredefined] = useState("");
  const [currentTranslation, setCurrentTranslation] = useState(null);
  const [animationUrl, setAnimationUrl] = useState("/만나서_반갑습니다.glb");
  const [cameraZoom, setCameraZoom] = useState(1);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

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

  const {
    isLoading: isConversionLoading,
    error: conversionError,
    convertTextToSignLanguage,
  } = useTextToSignAPI();

  // 자주 사용하는 구문 상수 정의
  const FREQUENT_PHRASES = {
    "안녕하세요": "안녕하세요",
    "감사합니다": "감사합니다",
    "죄송합니다": "죄송합니다",
    "알겠습니다": "알겠습니다",
    "좋다": "좋다",
    "가다": "가다",
    "잘하다": "잘하다",
    "느리다": "느리다"
  };

  const predefinedPhrases = [
    { display: "안녕하세요", filename: "안녕하세요" },
    { display: "감사합니다", filename: "감사합니다" },
    { display: "죄송합니다", filename: "죄송합니다" },
    { display: "알겠습니다", filename: "알겠습니다" },
    { display: "좋다", filename: "좋다" },
    { display: "가다", filename: "가다" },
    { display: "잘하다", filename: "잘하다" },
    { display: "느리다", filename: "느리다" },
  ];

  // 자주 사용하는 구문인지 판별하는 함수
  const isFrequentlyUsedPhrase = (text) => {
    return Object.prototype.hasOwnProperty.call(FREQUENT_PHRASES, text.trim());
  };

  useEffect(() => {
    if (!isUnityLoaded && !isUnityLoading && !unityError) {
      initializeUnity();
    }
  }, [isUnityLoaded, isUnityLoading, unityError, initializeUnity]);
  //-------------unity 실제 구현------------//
  // 메인 수어 변환 함수 - 자주 사용하는 구문인지 판별하여 분기
const handleConvertToSignLanguage = async (text, customFilename = null) => {
    if (!text.trim() || isPlaying) return;

    // 자주 사용하는 구문 확인
    if (isFrequentlyUsedPhrase(text)) {
      setAnimationType('glb');
      await handleConvertToSignLanguageGLB(text, customFilename);
    } else {
      setAnimationType('unity');
      await handleConverToSignLanguageAni(text);
    }
  };

  // GLB 애니메이션 처리 (기존 코드 분리)
  const handleConvertToSignLanguageGLB = async (text, customFilename = null) => {
    if (!text.trim() || isPlaying) return;

    // 파일명 결정
    let processedText = customFilename;
    if (!processedText) {
      const predefined = predefinedPhrases.find((p) => p.display === text);
      processedText = predefined
        ? predefined.filename
        : text.replace(/ /g, "_");
    }
    const animationFileUrl = `/${processedText}.glb`;

    try {
      const response = await fetch(animationFileUrl);
      const contentType = response.headers.get("Content-Type");

      if (
        response.ok &&
        (contentType === "model/gltf-binary" || response.status === 304)
      ) {
        // 먼저 애니메이션을 완전히 멈춤
        stopAnimation();
        
        // 캐시 우회를 위해 타임스탬프를 추가한 URL 생성
        const urlWithTimestamp = `${animationFileUrl}?t=${Date.now()}`;
        
        // 애니메이션 URL 변경 (캐시 우회)
        setAnimationUrl(urlWithTimestamp);
        
        // GLB 로딩 완료를 더 오래 기다린 후 재생 시작
        setTimeout(() => {
          sendAnimationData();
        }, 500);

        const newTranslation = {
          id: Date.now(),
          text,
          timestamp: new Date(),
          requestId: `local-${Date.now()}`,
          status: false, // 평가되지 않은 상태
          duration: 3,
          type: "glb"
        };

        setCurrentTranslation(newTranslation);
        setTranslationHistory((prev) => [newTranslation, ...prev.slice(0, 9)]);

        if (isSpeechEnabled) speakText(text);
      } else {
        console.error('GLB 파일 조건 불일치:', {
          ok: response.ok,
          status: response.status,
          contentType,
          animationFileUrl
        });
      }
    } catch (error) {
      console.error("애니메이션 파일 확인 중 오류 발생:", error);
    }
  };

  // Unity 애니메이션 처리 (AI 서버 연동)
  const handleConverToSignLanguageAni = async (text) => {
    if (!text.trim() || isPlaying || !isUnityLoaded) return;

    try {
      // AI 서버에 텍스트 전송하여 좌표 데이터 받기
      const result = await convertTextToSignLanguage(text);
      
      if (result.success) {
        // Unity에 좌표 데이터 전송
        const success = sendCoordinateData(result.data);
        
        if (success) {
          const newTranslation = {
            id: Date.now(),
            text,
            timestamp: new Date(),
            requestId: result.requestId,
            status: "PLAYING",
            duration: estimateAnimationDuration(result.data),
            type: "unity"
          };

          setCurrentTranslation(newTranslation);
          setTranslationHistory(prev => [newTranslation, ...prev.slice(0, 9)]);

          if (isSpeechEnabled) {
            speakText(text);
          }
        }
      }
    } catch (error) {
      console.error("수어 변환 중 오류:", error);
    }
  };

  // 애니메이션 지속 시간 추정 함수
  const estimateAnimationDuration = (coordinateData) => {
    return Array.isArray(coordinateData) ? coordinateData.length * 0.1 : 3; // 프레임당 100ms
  };

  const speakText = (text) => {
    if (text && isSpeechEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  /** 프리셋 클릭: 재생 중이면 바로 취소(정지) + 입력만 채우고 '대기' */
  const handlePredefinedSelect = (phraseObj) => {
    if (isPlaying) {
      stopAnimation(); // 이전 재생 취소
      setCurrentTranslation(null);
    }
    setInputText(phraseObj.display); // 대기 상태로 입력만 채움
    setSelectedPredefined(phraseObj.display);
    // 자동 실행(변환 호출) 없음 — 사용자가 '수어 변환'을 눌러야 실행
  };

  const clearInput = () => {
    setInputText("");
    setSelectedPredefined("");
    setCurrentTranslation(null);
  };

  const clearHistory = () => {
    setTranslationHistory([]);
    setShowHistoryModal(false);
  };

  const handleReplayTranslation = (text) => {
    setInputText(text);
    setShowHistoryModal(false);
    
    // 자주 사용하는 구문인지 확인하여 분기 처리
    if (isFrequentlyUsedPhrase(text)) {
      // 자주 사용하는 구문의 경우 해당 파일명으로 직접 변환 호출
      const filename = FREQUENT_PHRASES[text.trim()];
      handleConvertToSignLanguage(text, filename);
    } else {
      // 일반 텍스트는 기존 방식대로 처리 (AI 서버 연동)
      handleConvertToSignLanguage(text);
    }
  };

  // 번역 기록 상태 업데이트 핸들러
  const handleUpdateHistory = (historyId, updates) => {
    setTranslationHistory(prev => 
      prev.map(item => 
        item.id === historyId ? { ...item, ...updates } : item
      )
    );
  };

  const handleStopAnimation = () => {
    stopAnimation();
    setCurrentTranslation(null);
  };

  // Zoom handlers
  const handleZoomIn = () => setCameraZoom((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () =>
    setCameraZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setCameraZoom(1);

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
    if (isPlaying) {
      return animationType === 'unity' ? "Unity 수어 재생 중" : "GLB 수어 재생 중";
    }
    if (isUnityLoaded) return "준비 완료";
    return "초기화 중...";
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        theme === "high-contrast"
          ? "bg-black"
          : isDarkMode
          ? "bg-gray-900"
          : "bg-gray-50"
      }`}
    >
      <div className="relative w-full h-screen flex flex-col xl:flex-row">
        {/* ===== Left: Avatar Area ===== */}
        <div className="flex-1 relative p-4">
          <div
            className={`w-full h-full rounded-3xl overflow-hidden relative border ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400"
                : isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {/* top status + settings */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    theme === "high-contrast"
                      ? "bg-black border-2 border-yellow-400 text-yellow-400"
                      : isDarkMode
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
                      theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 text-yellow-400"
                        : isDarkMode
                        ? "bg-gray-700 text-[#ff4444]"
                        : "bg-gray-100 text-[#ff4444]"
                    }`}
                  >
                    <div className="w-2 h-2 bg-[#ff4444] rounded-full animate-pulse" />
                    재생 중: {currentTranslation.text}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 설정 클릭이 다른 곳에 전파되어 재생에 영향 주지 않도록
                    setShowSettings((v) => !v); // 재생 상태(isPlaying)는 그대로 유지
                  }}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    theme === "high-contrast"
                      ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-gray-100"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>
           {/* avatar panel */}
            <div className="w-full h-full flex items-center justify-center relative">
              <div
                className={`w-full max-w-4xl h-full max-h-[600px]  border relative ${
                  theme === "high-contrast"
                    ? "bg-gray-900 border-yellow-400"
                    : isDarkMode
                    ? "bg-gray-900/10 border-white/10"
                    : "bg-gray-900/10 border-white/10"
                }`}
                style={{ minHeight: "400px" }}
              >
                {animationType === 'glb' ? (
                  <GLBAvatarPlayer
                    avatarUrl="/avatar.glb"
                    animationUrl={animationUrl}
                    play={isPlaying}
                    dark={isDarkMode || theme === "high-contrast"}
                    zoom={cameraZoom}
                    onEnd={stopAnimation}
                  />
                ) : (
                  <div 
                    ref={containerRef}
                    className="w-full h-full"
                    style={{ minHeight: "400px" }}
                  >
                    {/* Unity WebGL이 여기에 마운트됨 */}
                  </div>
                )}
                
                {/* 줌 컨트롤은 GLB일 때만 표시 */}
                {animationType === 'glb' && (
                  <div className="absolute top-2 right-2 md:top-2 md:right-2 z-20 flex items-center gap-1">
                    {/* 기존 줌 컨트롤 코드 */}
                  </div>
                )}
              </div>
            </div>
                {/* === Zoom controls INSIDE the panel (right-top) === */}
                <div className="absolute top-2 right-2 md:top-2 md:right-2 z-20 flex items-center gap-1">
                  <button
                    onClick={handleZoomOut}
                    className={`p-2 rounded-lg transition-all duration-200 shadow-lg ${
                      theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        : isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white"
                        : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200"
                    }`}
                    title="축소"
                  >
                    <ZoomOut size={16} />
                  </button>

                  <button
                    onClick={handleZoomReset}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg ${
                      theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        : isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white"
                        : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200"
                    }`}
                    title="원본 크기"
                  >
                    {Math.round(cameraZoom * 100)}%
                  </button>

                  <button
                    onClick={handleZoomIn}
                    className={`p-2 rounded-lg transition-all duration-200 shadow-lg ${
                      theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        : isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white"
                        : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200"
                    }`}
                    title="확대"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>
              </div>

              {(isUnityLoading || isConversionLoading) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <div
                    className={`text-lg font-semibold px-8 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 ${
                      theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 text-yellow-400"
                        : isDarkMode
                        ? "bg-gray-800 border-gray-700 text-gray-200"
                        : "bg-white border-gray-200 text-gray-800"
                    }`}
                  >
                    <Loader size={24} className="animate-spin text-blue-500" />
                    {isUnityLoading
                      ? "Unity 아바타 로딩 중..."
                      : "AI가 수어를 생성하고 있습니다..."}
                  </div>
                </div>
              )}
            </div>

            {/* settings panel */}
            {showSettings && (
              <div
                className={`absolute top-16 right-4 rounded-2xl p-6 shadow-2xl z-20 min-w-[280px] border ${
                  theme === "high-contrast"
                    ? "bg-black border-2 border-yellow-400"
                    : isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
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
                  아바타 설정
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        theme === "high-contrast"
                          ? "text-yellow-400"
                          : isDarkMode
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      음성 출력
                    </span>
                    <button
                      onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        theme === "high-contrast"
                          ? "border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                          : isDarkMode
                          ? "border border-gray-400 hover:bg-gray-500 text-white"
                          : "border border-gray-400 hover:bg-gray-200 text-gray-800"
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
                      theme === "high-contrast"
                        ? "border-yellow-400"
                        : isDarkMode
                        ? "border-gray-700"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={resetAvatar}
                        disabled={!isUnityLoaded}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
                          !isUnityLoaded
                            ? theme === "high-contrast"
                              ? "bg-black border-2 border-yellow-400 text-yellow-400 opacity-50 cursor-not-allowed"
                              : isDarkMode
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : theme === "high-contrast"
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
                            ? theme === "high-contrast"
                              ? "bg-black border-2 border-yellow-400 text-yellow-400 opacity-50 cursor-not-allowed"
                              : isDarkMode
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : theme === "high-contrast"
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

        {/* ===== Right: Controls ===== */}
        <div
          className={`w-full xl:w-96 p-4 flex flex-col max-h-[50vh] xl:max-h-none ${
            theme === "high-contrast" ? "overflow-y-auto" : ""
          }`}
        >
          {/* 입력 */}
          <div
            className={`rounded-2xl shadow-lg mb-4 border ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400 p-4"
                : isDarkMode
                ? "bg-gray-800 border-gray-700 p-6"
                : "bg-white border-gray-200 p-6"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare
                size={20}
                className={`${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-gray-300"
                    : "text-gray-700"
                }`}
              />
              <h3
                className={`text-lg font-semibold ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-white"
                    : "text-gray-800"
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
                  theme === "high-contrast"
                    ? "bg-black border-2 border-yellow-400 text-yellow-400 placeholder-yellow-400"
                    : isDarkMode
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
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-xl transition-all duration-300 transform shadow-lg ${
                    !inputText.trim() ||
                    !isUnityLoaded ||
                    isConversionLoading ||
                    isPlaying
                      ? theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 text-yellow-400 opacity-50 cursor-not-allowed"
                        : isDarkMode
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : theme === "high-contrast"
                      ? "bg-black border-4 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : "bg-blue-500 hover:bg-blue-600 text-white hover:scale-[1.02]"
                  }`}
                >
                  수어 변환
                </button>

                <button
                  onClick={clearInput}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    theme === "high-contrast"
                      ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* 프리셋 */}
          <div
            className={`rounded-2xl shadow-lg mb-4 border ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400 p-4"
                : isDarkMode
                ? "bg-gray-800 border-gray-700 p-6"
                : "bg-white border-gray-200 p-6"
            }`}
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
              자주 사용하는 구문
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {predefinedPhrases.map((phraseObj) => (
                <button
                  key={phraseObj.display}
                  onClick={() => handlePredefinedSelect(phraseObj)}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    selectedPredefined === phraseObj.display
                      ? theme === "high-contrast"
                        ? "bg-yellow-400 text-black border-2 border-yellow-400"
                        : "bg-blue-500 text-white shadow-lg"
                      : theme === "high-contrast"
                      ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {phraseObj.display}
                </button>
              ))}
            </div>
          </div>

          {/* 변환 기록 보기 버튼 */}
          <div
            className={`rounded-2xl shadow-lg border ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400 p-4"
                : isDarkMode
                ? "bg-gray-800 border-gray-700 p-6"
                : "bg-white border-gray-200 p-6"
            }`}
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Clock
                  size={20}
                  className={`${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                />
                <h3
                  className={`text-lg font-semibold ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                >
                  변환 기록
                </h3>
              </div>

              <div
                className={`text-sm mb-4 ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                {translationHistory.length > 0
                  ? `${translationHistory.length}개의 변환 기록이 있습니다`
                  : "아직 변환 기록이 없습니다"}
              </div>

              <button
                onClick={() => setShowHistoryModal(true)}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-xl transition-all duration-200 ${
                  theme === "high-contrast"
                    ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    : isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                }`}
              >
                <MessageSquare size={18} />
                변환 기록 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 변환 기록 모달 */}
      <TransHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        translationHistory={translationHistory}
        onClearHistory={clearHistory}
        onReplayTranslation={handleReplayTranslation}
        onUpdateHistory={handleUpdateHistory}
      />
    </div>
  );
};

export default AvatarPage;
