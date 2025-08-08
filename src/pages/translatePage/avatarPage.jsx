import React, { useState, useEffect } from "react";
import { 
  Play, Square, RotateCcw, Settings, Volume2, VolumeX, 
  Loader, AlertCircle, CheckCircle, Send, Sparkles,
  User, MessageSquare, Clock
} from "lucide-react";
import { useUnityAvatar } from "../../hooks/useUnityAvatar";
import { useTextToSignAPI } from "../../hooks/useTextToSignAPI";

const AvatarPage = () => {
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
    currentAnimation,
    containerRef,
    initializeUnity,
    sendAnimationData,
    stopAnimation,
    resetAvatar
  } = useUnityAvatar();

  // 텍스트-수어 변환 API 훅
  const {
    isLoading: isConversionLoading,
    error: conversionError,
    convertTextToSignLanguage,
    getPredefinedSignLanguages,
    clearError
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
    "잘 부탁드립니다"
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
        // 변환 성공 시 아바타에 애니메이션 데이터 전송
        const success = sendAnimationData(result.animationData);
        
        if (success) {
          const newTranslation = {
            id: Date.now(),
            text: text,
            timestamp: new Date(),
            confidence: result.confidence,
            duration: result.animationData.duration || 2.5
          };
          
          setCurrentTranslation(newTranslation);
          setTranslationHistory(prev => [newTranslation, ...prev.slice(0, 9)]);
          
          // 음성 출력
          if (isSpeechEnabled) {
            speakText(text);
          }
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
    if (unityError || conversionError) return 'text-red-500';
    if (isConversionLoading || isUnityLoading) return 'text-yellow-500';
    if (isUnityLoaded && !isPlaying) return 'text-green-500';
    if (isPlaying) return 'text-blue-500';
    return 'text-gray-500';
  };

  const getStatusText = () => {
    if (unityError) return 'Unity 로딩 오류';
    if (conversionError) return 'AI 변환 오류';
    if (isConversionLoading) return 'AI 변환 중...';
    if (isUnityLoading) return 'Unity 로딩 중...';
    if (isPlaying) return '수어 재생 중';
    if (isUnityLoaded) return '준비 완료';
    return '초기화 중...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      
      {/* 메인 컨테이너 */}
      <div className="relative w-full h-screen flex flex-col xl:flex-row">
        
        {/* Unity 아바타 영역 */}
        <div className="flex-1 relative p-4">
          <div className="w-full h-full bg-white/20 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden relative">
            
            {/* 상단 상태 바 */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 bg-white/30 backdrop-blur-md rounded-full text-sm font-medium ${getStatusColor()}`}>
                  {(isUnityLoading || isConversionLoading) ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (unityError || conversionError) ? (
                    <AlertCircle size={16} />
                  ) : isUnityLoaded ? (
                    <CheckCircle size={16} />
                  ) : (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{getStatusText()}</span>
                </div>
                
                {isPlaying && currentTranslation && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 backdrop-blur-md rounded-full text-purple-700 text-sm font-medium">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    재생 중: {currentTranslation.text}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {currentTranslation && (
                  <div className="px-3 py-1.5 bg-white/30 backdrop-blur-md rounded-full text-sm font-medium text-gray-700">
                    신뢰도: {Math.round(currentTranslation.confidence * 100)}%
                  </div>
                )}
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 bg-white/30 hover:bg-white/40 backdrop-blur-md rounded-xl text-gray-700 hover:text-gray-900 transition-all duration-200"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>

            {/* Unity WebGL 컨테이너 또는 에러 표시 */}
            {(unityError || conversionError) ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} className="text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {unityError ? "Unity 로딩 오류" : "AI 서버 오류"}
                  </h3>
                  <p className="text-gray-600 mb-6">
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
                  style={{ minHeight: '400px' }}
                />
                
                {/* 로딩 오버레이 */}
                {(isUnityLoading || isConversionLoading) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="bg-white/90 backdrop-blur-xl text-gray-800 text-lg font-semibold px-8 py-4 rounded-2xl shadow-2xl border border-white/30 flex items-center gap-3">
                      <Loader size={24} className="animate-spin text-purple-600" />
                      {isUnityLoading ? "Unity 아바타 로딩 중..." : "AI가 수어를 생성하고 있습니다..."}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 설정 패널 */}
            {showSettings && (
              <div className="absolute top-16 right-4 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl z-20 min-w-[280px]">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">아바타 설정</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">음성 출력</span>
                    <button
                      onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isSpeechEnabled 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isSpeechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                  </div>
                  
                  <div className="pt-2 border-t border-white/20">
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
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={20} className="text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-800">텍스트 입력</h3>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="수어로 변환할 텍스트를 입력하세요..."
                className="w-full h-32 bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-gray-800 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
              />
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleConvertToSignLanguage(inputText)}
                  disabled={!inputText.trim() || !isUnityLoaded || isConversionLoading}
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
                  className="p-3 bg-white/30 hover:bg-white/40 text-gray-600 rounded-xl transition-all duration-200"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* 미리 정의된 구문 */}
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">자주 사용하는 구문</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {predefinedPhrases.map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => handlePredefinedSelect(phrase)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPredefined === phrase
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-white/30 hover:bg-white/40 text-gray-700'
                  }`}
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          {/* 변환 기록 */}
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-800">변환 기록</h3>
              </div>
              <button
                onClick={clearHistory}
                className="p-2 hover:bg-white/20 rounded-lg text-gray-500 hover:text-gray-700 transition-all duration-200"
                title="기록 지우기"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {translationHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8 italic">변환 기록이 없습니다</p>
              ) : (
                translationHistory.map((item) => (
                  <div key={item.id} className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-gray-800 text-sm leading-relaxed mb-2">{item.text}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.timestamp.toLocaleTimeString()}</span>
                      <div className="flex items-center gap-2">
                        <span>신뢰도 {Math.round(item.confidence * 100)}%</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.confidence > 0.8 ? 'bg-green-500' : item.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`} />
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
