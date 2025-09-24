import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../../Context/themeContext";
import TransHistoryModal from "../../components/modals/TransHistoryModal";
import { useUnityAvatar } from "../../hooks/useUnityAvatar";
import { AnimationManager } from "../../services/AnimationManager";

// 분리된 컴포넌트들 임포트
import AvatarDisplay from "./components/AvatarDisplay";
import TextInputPanel from "./components/TextInputPanel";
import PredefinedPhrasesPanel from "./components/PredefinedPhrasesPanel";
import ControlPanel from "./components/ControlPanel";


/** =============== 리팩토링된 AvatarPage =============== */
const AvatarPage = () => {
  const { theme, isDarkMode } = useTheme();
  
  // 애니메이션 관련 상태
  const [animationType, setAnimationType] = useState('glb'); // 'glb' | 'unity'
  const [animationUrl, setAnimationUrl] = useState("/만나서_반갑습니다.glb");
  const [currentTranslation, setCurrentTranslation] = useState(null);
  
  // UI 상태
  const [inputText, setInputText] = useState("");
  const [selectedPredefined, setSelectedPredefined] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // 설정
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [cameraZoom, setCameraZoom] = useState(1);
  
  // 기록
  const [translationHistory, setTranslationHistory] = useState([]);
  
  // 로딩 및 에러 상태
  const [isConversionLoading, setIsConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState(null);
  
  // Unity 훅
  const {
    isLoaded: isUnityLoaded,
    isLoading: isUnityLoading,
    error: unityError,
    isPlaying,
    initializeUnity,
    sendAnimationData,
    sendCoordinateData,
    stopAnimation,
    resetAvatar,
    containerRef
  } = useUnityAvatar();
  
  // AnimationManager 인스턴스
  const animationManagerRef = useRef(null);
  
  // AnimationManager 초기화
  useEffect(() => {
    if (!animationManagerRef.current) {
      animationManagerRef.current = new AnimationManager();
      
      // 이벤트 리스너 등록
      const manager = animationManagerRef.current;
      
      manager.on('animationStart', (data) => {
        setAnimationType(data.mode);
        setCurrentTranslation(data);
      });
      
      manager.on('glbAnimationReady', (animationData) => {
        setAnimationUrl(animationData.animationUrl);
        // GLB 애니메이션 시작 신호
        setTimeout(() => {
          sendAnimationData();
        }, 500);
        addToHistory(animationData);
      });
      
      manager.on('unityAnimationReady', (animationData) => {
        // Unity에 좌표 데이터 전송
        if (sendCoordinateData(animationData.coordinateData)) {
          addToHistory(animationData);
        }
      });
      
      manager.on('animationStop', () => {
        setCurrentTranslation(null);
      });
      
      manager.on('animationError', ({ error }) => {
        setConversionError(error.message);
        setIsConversionLoading(false);
      });
    }
    
    return () => {
      if (animationManagerRef.current) {
        animationManagerRef.current.dispose();
      }
    };
  }, [sendAnimationData, sendCoordinateData]);

  // Unity 초기화
  useEffect(() => {
    if (!isUnityLoaded && !isUnityLoading && !unityError) {
      initializeUnity();
    }
  }, [isUnityLoaded, isUnityLoading, unityError, initializeUnity]);
  // 헬퍼 함수들
  const addToHistory = useCallback((animationData) => {
    setTranslationHistory(prev => [animationData, ...prev.slice(0, 9)]);
  }, []);

  const speakText = useCallback((text) => {
    if (text && isSpeechEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [isSpeechEnabled]);

  // 메인 수어 변환 함수 (AnimationManager 사용)
  const handleConvertToSignLanguage = useCallback(async (text, customFilename = null) => {
    if (!text.trim() || isPlaying) return;
    
    if (!animationManagerRef.current) {
      setConversionError('Animation Manager가 초기화되지 않았습니다.');
      return;
    }

    try {
      setIsConversionLoading(true);
      setConversionError(null);
      
      // AnimationManager를 통한 변환 처리
      const result = await animationManagerRef.current.convertTextToAnimation(text, {
        customFilename,
        speechEnabled: isSpeechEnabled
      });
      
      // 음성 출력
      if (isSpeechEnabled) {
        speakText(text);
      }
      
    } catch (error) {
      console.error('애니메이션 변환 오류:', error);
      setConversionError(error.message);
    } finally {
      setIsConversionLoading(false);
    }
  }, [isPlaying, isSpeechEnabled, speakText]);

  // 사전 정의된 구문 선택 처리
  const handlePredefinedSelect = useCallback((phraseObj) => {
    if (isPlaying) {
      handleStopAnimation();
    }
    setInputText(phraseObj.display);
    setSelectedPredefined(phraseObj.display);
  }, [isPlaying]);

  // 입력 관련 핸들러들
  const handleInputChange = useCallback((e) => {
    setInputText(e.target.value);
    setSelectedPredefined("");
  }, []);

  const clearInput = useCallback(() => {
    setInputText("");
    setSelectedPredefined("");
    setCurrentTranslation(null);
  }, []);

  // 제어 관련 핸들러들
  const handleStopAnimation = useCallback(() => {
    stopAnimation();
    if (animationManagerRef.current) {
      animationManagerRef.current.stopAnimation();
    }
    setCurrentTranslation(null);
  }, [stopAnimation]);

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  const handleToggleSpeech = useCallback(() => {
    setIsSpeechEnabled(prev => !prev);
  }, []);

  // 줌 컨트롤 핸들러들
  const handleZoomIn = useCallback(() => {
    setCameraZoom(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCameraZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleZoomReset = useCallback(() => {
    setCameraZoom(1);
  }, []);

  // 히스토리 관련 핸들러들
  const clearHistory = useCallback(() => {
    setTranslationHistory([]);
    setShowHistoryModal(false);
  }, []);

  const handleShowHistory = useCallback(() => {
    setShowHistoryModal(true);
  }, []);

  const handleReplayTranslation = useCallback(async (text) => {
    setInputText(text);
    setShowHistoryModal(false);
    
    // AnimationManager를 통해 다시 재생
    await handleConvertToSignLanguage(text);
  }, [handleConvertToSignLanguage]);

  const handleUpdateHistory = useCallback((historyId, updates) => {
    setTranslationHistory(prev => 
      prev.map(item => 
        item.id === historyId ? { ...item, ...updates } : item
      )
    );
  }, []);

  // 버튼 상태 확인
  const isConvertButtonEnabled = useCallback(() => {
    if (!inputText.trim() || isConversionLoading || isPlaying) {
      return false;
    }
    
    const manager = animationManagerRef.current;
    if (!manager) return false;
    
    // 자주 사용하는 구문인 경우 GLB 모드로 처리 (Unity 불필요)
    if (manager.isFrequentlyUsedPhrase(inputText.trim())) {
      return true;
    }
    
    // 일반 텍스트인 경우 Unity 필요
    return isUnityLoaded;
  }, [inputText, isConversionLoading, isPlaying, isUnityLoaded]);

  // 애니메이션 종료 처리
  const handleAnimationEnd = useCallback(() => {
    handleStopAnimation();
  }, [handleStopAnimation]);

  // AnimationManager에서 사전 정의된 구문 리스트 가져오기
  const predefinedPhrases = animationManagerRef.current?.predefinedPhrases || [];

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
        {/* ===== Left: Avatar Display Area ===== */}
        <div className="flex-1 relative p-4">
          <AvatarDisplay
            // Unity 관련
            isUnityLoaded={isUnityLoaded}
            isUnityLoading={isUnityLoading}
            unityError={unityError}
            unityContainerRef={containerRef}
            
            // 애니메이션 관련
            animationType={animationType}
            animationUrl={animationUrl}
            isPlaying={isPlaying}
            currentTranslation={currentTranslation}
            
            // 공통 상태
            isConversionLoading={isConversionLoading}
            conversionError={conversionError}
            
            // GLB 관련
            cameraZoom={cameraZoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onAnimationEnd={handleAnimationEnd}
          />

          {/* 설정 버튼 */}
          <div className="absolute top-8 right-8 z-30">
            <ControlPanel
              showSettings={showSettings}
              onToggleSettings={handleToggleSettings}
              isSpeechEnabled={isSpeechEnabled}
              onToggleSpeech={handleToggleSpeech}
              isUnityLoaded={isUnityLoaded}
              isPlaying={isPlaying}
              onResetAvatar={resetAvatar}
              onStopAnimation={handleStopAnimation}
              translationHistoryCount={translationHistory.length}
              onShowHistory={handleShowHistory}
            />
          </div>
        </div>

        {/* ===== Right: Control Panels ===== */}
        <div
          className={`w-full xl:w-96 p-4 flex flex-col max-h-[50vh] xl:max-h-none ${
            theme === "high-contrast" ? "overflow-y-auto" : ""
          }`}
        >
          {/* 텍스트 입력 패널 */}
          <TextInputPanel
            inputText={inputText}
            onInputChange={handleInputChange}
            onConvert={() => handleConvertToSignLanguage(inputText)}
            onClear={clearInput}
            isConvertButtonEnabled={isConvertButtonEnabled()}
          />

          {/* 사전 정의된 구문 패널 */}
          <PredefinedPhrasesPanel
            predefinedPhrases={predefinedPhrases}
            selectedPhrase={selectedPredefined}
            onPhraseSelect={handlePredefinedSelect}
            isDisabled={isPlaying}
          />
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