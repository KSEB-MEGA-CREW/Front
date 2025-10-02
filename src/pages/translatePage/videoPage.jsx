import React, { useState, useRef, useEffect, useCallback } from "react";
import { useWebSocketContext } from "../../Context/WebSocketContext";
import { useFrameExtraction } from "../../hooks/useFrameExtraction";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { v4 as uuidv4 } from "uuid";
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
  const sessionIdRef = useRef(uuidv4());
  const isMountedRef = useRef(true);
  const speechTimeoutRef = useRef(null);

  // UI 상태
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [permissionState, setPermissionState] = useState("prompt");
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [cameraInfo, setCameraInfo] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  
  // Context 사용
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const {
    isConnected,
    connectionState,
    connectionError,
    translationState,
    isTranslationActive,
    lastResult,
    sessionStats,
    translationHistory,
    startTranslation,
    stopTranslation,
    clearError: clearWsError,
    clearHistory,
    reconnect,
  } = useWebSocketContext();

  // 단순화된 키포인트 추출 훅
  const { 
    isProcessing, 
    startFrameExtraction, 
    stopFrameExtraction,
    error: frameError 
  } = useFrameExtraction();

  // 권한 상태 확인
  const checkCameraPermission = useCallback(async () => {
    try {
      const permission = await navigator.permissions.query({ name: "camera" });
      setPermissionState(permission.state);

      permission.addEventListener("change", () => {
        setPermissionState(permission.state);
        console.log("🔒 [VideoPage] 카메라 권한 상태 변경:", permission.state);
      });

      return permission.state;
    } catch (error) {
      console.warn("⚠️ [VideoPage] 권한 API 사용 불가:", error);
      return "unknown";
    }
  }, []);

  // 권한 요청
  const requestCameraPermission = useCallback(async () => {
    console.log("🔒 [VideoPage] 카메라 권한 요청 시작");

    try {
      const currentPermission = await checkCameraPermission();
      
      if (currentPermission === "denied") {
        setCameraError(`
          카메라 접근이 차단되었습니다. 
          
          권한을 허용하려면:
          1. 주소창 왼쪽의 ℹ️ 또는 🔒 클릭하세요
          2. 카메라를 '허용'으로 변경하세요
          3. 페이지를 새로고침하세요
        `);
        return false;
      }

      setShowPermissionDialog(true);

      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      tempStream.getTracks().forEach((track) => track.stop());

      setShowPermissionDialog(false);
      setPermissionState("granted");
      setCameraError("");
      console.log("✅ [VideoPage] 카메라 권한 승인됨");
      return true;
    } catch (error) {
      setShowPermissionDialog(false);
      console.error("🚨 [VideoPage] 카메라 권한 거부:", error);

      if (error.name === "NotAllowedError") {
        setPermissionState("denied");
        setCameraError("카메라 접근 권한이 거부되었습니다.");
      } else if (error.name === "NotFoundError") {
        setCameraError("카메라를 찾을 수 없습니다.");
      } else if (error.name === "NotReadableError") {
        setCameraError("카메라가 다른 응용 프로그램에서 사용 중입니다.");
      } else {
        setCameraError("카메라 접근 중 오류가 발생했습니다: " + error.message);
      }
      return false;
    }
  }, [checkCameraPermission]);

  // 카메라 장치 목록 가져오기
  const getAvailableDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);
      
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
      
      console.log(`📷 [VideoPage] 사용 가능한 카메라 ${videoDevices.length}개 발견`);
    } catch (error) {
      console.error("🚨 [VideoPage] 장치 목록 가져오기 실패:", error);
    }
  }, [selectedDeviceId]);

  // 카메라 스트림 시작
  const startCamera = useCallback(async () => {
    if (isCameraReady) return;

    console.log("📷 [VideoPage] 카메라 시작");
    setCameraError("");

    try {
      if (permissionState !== "granted") {
        const granted = await requestCameraPermission();
        if (!granted) return;
      }

      await getAvailableDevices();

      const constraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: selectedDeviceId ? undefined : "user",
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        setCameraInfo({
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate,
          deviceId: settings.deviceId,
        });

        setIsCameraReady(true);
        console.log("✅ [VideoPage] 카메라 시작 완료");
      }
    } catch (error) {
      console.error("🚨 [VideoPage] 카메라 시작 실패:", error);
      setCameraError("카메라를 시작할 수 없습니다: " + error.message);
    }
  }, [isCameraReady, permissionState, selectedDeviceId, requestCameraPermission, getAvailableDevices]);

  // 카메라 중지
  const stopCamera = useCallback(() => {
    console.log("📷 [VideoPage] 카메라 중지");

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraReady(false);
    setCameraInfo(null);
  }, []);

  // 번역 시작 (단순화됨)
  const handleStartTranslation = useCallback(async () => {
    if (!isConnected) {
      setCameraError("서버에 연결되지 않았습니다. 연결을 확인해주세요.");
      return;
    }

    if (!isCameraReady) {
      await startCamera();
      return;
    }

    if (!videoRef.current) {
      setCameraError("비디오 요소가 준비되지 않았습니다.");
      return;
    }

    try {
      console.log("🚀 [VideoPage] 번역 시작");
      
      // 비디오 요소 상태 검증
      const videoElement = videoRef.current;
      if (!videoElement) {
        throw new Error("비디오 요소가 준비되지 않았습니다");
      }

      // 비디오 준비 상태 대기
      if (videoElement.readyState < 2) {
        console.log("⏳ [VideoPage] 비디오 메타데이터 로딩 대기 중...");
        
        const waitForVideo = () => new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("비디오 로딩 시간 초과"));
          }, 5000);

          const checkReady = () => {
            if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
              clearTimeout(timeout);
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          
          checkReady();
        });

        await waitForVideo();
        console.log("✅ [VideoPage] 비디오 준비 완료:", {
          readyState: videoElement.readyState,
          width: videoElement.videoWidth,
          height: videoElement.videoHeight
        });
      }
      
      // 새로운 세션 ID 생성
      sessionIdRef.current = uuidv4();
      clearWsError();
      clearHistory();

      // 번역 세션 시작
      startTranslation(sessionIdRef.current);
      
      // 키포인트 추출 시작 (세션 ID 전달) - 비디오 준비 완료 후
      await startFrameExtraction(videoRef.current, sessionIdRef.current);
      
    } catch (error) {
      console.error("🚨 [VideoPage] 번역 시작 실패:", error);
      setCameraError("번역 시작에 실패했습니다: " + error.message);
    }
  }, [
    isConnected,
    isCameraReady,
    startCamera,
    startTranslation,
    startFrameExtraction,
    clearWsError,
    clearHistory,
  ]);

  // 번역 중지 (단순화됨)
  const handleStopTranslation = useCallback(() => {
    console.log("🛑 [VideoPage] 번역 중지");

    try {
      // 키포인트 추출 중지
      stopFrameExtraction();
      
      // 번역 세션 종료
      stopTranslation();
      
    } catch (error) {
      console.error("🚨 [VideoPage] 번역 중지 실패:", error);
    }
  }, [stopFrameExtraction, stopTranslation]);

  // TTS 음성 출력
  const speakText = useCallback((text) => {
    if (!isSpeechEnabled || !text) return;

    try {
      // 기존 음성 중지
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      speechSynthesis.speak(utterance);

      // 3초 후 자동 정리
      speechTimeoutRef.current = setTimeout(() => {
        speechSynthesis.cancel();
      }, 3000);

    } catch (error) {
      console.error("🚨 [VideoPage] TTS 오류:", error);
    }
  }, [isSpeechEnabled]);

  // 번역 결과 처리
  useEffect(() => {
    if (lastResult?.label) {
      console.log("📝 [VideoPage] 번역 결과:", lastResult.label);
      speakText(lastResult.label);
    }
  }, [lastResult, speakText]);

  // 컴포넌트 초기화
  useEffect(() => {
    console.log("🎬 [VideoPage] 컴포넌트 마운트");
    isMountedRef.current = true;
    
    checkCameraPermission();
    
    return () => {
      console.log("🎬 [VideoPage] 컴포넌트 언마운트");
      isMountedRef.current = false;
      
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechSynthesis.cancel();
      }
      
      stopCamera();
    };
  }, [checkCameraPermission, stopCamera]);

  // 연결 상태에 따른 UI 색상
  const getConnectionColor = () => {
    if (!isConnected) return "text-red-500";
    if (isTranslationActive) return "text-green-500";
    return "text-yellow-500";
  };

  const getConnectionIcon = () => {
    if (!isConnected) return <WifiOff className="w-5 h-5" />;
    if (isTranslationActive) return <Wifi className="w-5 h-5" />;
    return <Wifi className="w-5 h-5" />;
  };

  const getConnectionText = () => {
    if (!isConnected) return "연결 끊김";
    if (isTranslationActive) return "번역 중";
    if (translationState === "starting") return "시작 중";
    if (translationState === "stopping") return "종료 중";
    return "연결됨";
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : theme === 'high-contrast'
        ? 'bg-black text-yellow-400'
        : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800'
    }`}>
      
      {/* 헤더 */}
      <div className={`sticky top-0 z-10 backdrop-blur-sm border-b ${
        theme === 'dark' 
          ? 'bg-gray-800/90 border-gray-700' 
          : theme === 'high-contrast'
          ? 'bg-black/90 border-yellow-400'
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* 제목 */}
            <h1 className="text-xl font-bold">수어 → 한국어</h1>
            
            {/* 연결 상태 */}
            <div className={`flex items-center gap-2 ${getConnectionColor()}`}>
              {getConnectionIcon()}
              <span className="text-sm font-medium">{getConnectionText()}</span>
            </div>
            
            {/* 설정 버튼 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700' 
                    : theme === 'high-contrast'
                    ? 'hover:bg-gray-800 border border-yellow-400'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 비디오 섹션 */}
          <div className={`rounded-2xl shadow-xl overflow-hidden ${
            theme === 'dark' 
              ? 'bg-gray-800' 
              : theme === 'high-contrast'
              ? 'bg-black border-2 border-yellow-400'
              : 'bg-white'
          }`}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">카메라</h2>
              
              {/* 비디오 컨테이너 */}
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* 권한 요청 다이얼로그 */}
                {showPermissionDialog && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                      <Camera className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                      <p className="text-gray-700 dark:text-gray-300">
                        카메라 접근 권한을 요청하고 있습니다...
                      </p>
                    </div>
                  </div>
                )}
                
                {/* 카메라 정보 오버레이 */}
                {cameraInfo && (
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {cameraInfo.width}×{cameraInfo.height} @ {Math.round(cameraInfo.frameRate)}fps
                  </div>
                )}
              </div>
              
              {/* 에러 메시지 */}
              {(cameraError || connectionError || frameError) && (
                <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
                  theme === 'dark' 
                    ? 'bg-red-900/20 border border-red-800' 
                    : theme === 'high-contrast'
                    ? 'bg-red-900 border border-red-400'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800 dark:text-red-200">오류 발생</p>
                    <p className="text-red-600 dark:text-red-300 whitespace-pre-line">
                      {cameraError || connectionError || frameError}
                    </p>
                  </div>
                </div>
              )}
              
              {/* 컨트롤 버튼들 */}
              <div className="flex gap-3 mt-6">
                {/* 번역 시작/중지 버튼 */}
                <button
                  onClick={isTranslationActive ? handleStopTranslation : handleStartTranslation}
                  disabled={!isConnected}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    isTranslationActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : isConnected
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isTranslationActive ? (
                    <>
                      <Square className="w-5 h-5" />
                      중지
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      시작
                    </>
                  )}
                </button>
                
                {/* 카메라 시작/중지 버튼 */}
                <button
                  onClick={isCameraReady ? stopCamera : startCamera}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : theme === 'high-contrast'
                      ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-yellow-400'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  {isCameraReady ? '카메라 중지' : '카메라 시작'}
                </button>
                
                {/* 음성 토글 */}
                <button
                  onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                  className={`p-3 rounded-xl transition-all ${
                    isSpeechEnabled
                      ? theme === 'dark'
                        ? 'bg-green-600 text-white'
                        : theme === 'high-contrast'
                        ? 'bg-green-700 text-yellow-400 border border-yellow-400'
                        : 'bg-green-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-400'
                        : theme === 'high-contrast'
                        ? 'bg-gray-800 text-gray-500 border border-gray-500'
                        : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isSpeechEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* 번역 결과 섹션 */}
          <div className={`rounded-2xl shadow-xl ${
            theme === 'dark' 
              ? 'bg-gray-800' 
              : theme === 'high-contrast'
              ? 'bg-black border-2 border-yellow-400'
              : 'bg-white'
          }`}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">번역 결과</h2>
              
              {/* 현재 결과 */}
              <div className={`p-4 rounded-xl mb-4 min-h-[120px] ${
                theme === 'dark' 
                  ? 'bg-gray-900' 
                  : theme === 'high-contrast'
                  ? 'bg-gray-900 border border-yellow-400'
                  : 'bg-gray-50'
              }`}>
                {lastResult ? (
                  <div>
                    <div className="text-2xl font-medium mb-2">
                      {lastResult.label}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>신뢰도: {Math.round((lastResult.confidence || 0) * 100)}%</span>
                      <span>타입: {lastResult.type === 'sentence' ? '문장' : '단어'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    {isTranslationActive ? '수어를 인식하고 있습니다...' : '번역을 시작해주세요'}
                  </div>
                )}
              </div>
              
              {/* 번역 히스토리 */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h3 className="font-medium text-gray-600 dark:text-gray-400">최근 번역</h3>
                {translationHistory.length > 0 ? (
                  translationHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-gray-700' 
                          : theme === 'high-contrast'
                          ? 'bg-gray-800 border border-gray-600'
                          : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{item.text}</span>
                        <span className="text-xs text-gray-500">{item.timestamp}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        신뢰도: {Math.round(item.confidence * 100)}%
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    아직 번역 결과가 없습니다
                  </div>
                )}
              </div>
              
              {/* 통계 정보 */}
              {sessionStats && (
                <div className={`mt-4 p-3 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700' 
                    : theme === 'high-contrast'
                    ? 'bg-gray-800 border border-gray-600'
                    : 'bg-gray-100'
                }`}>
                  <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2">세션 통계</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">총 프레임:</span>
                      <span className="ml-2 font-medium">{sessionStats.total_frames}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">평균 신뢰도:</span>
                      <span className="ml-2 font-medium">{Math.round((sessionStats.avg_confidence || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 연결 재시도 버튼 */}
        {!isConnected && (
          <div className="text-center mt-8">
            <button
              onClick={reconnect}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              서버 재연결
            </button>
          </div>
        )}
      </div>
      
      {/* 설정 패널 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 rounded-2xl shadow-xl ${
            theme === 'dark' 
              ? 'bg-gray-800' 
              : theme === 'high-contrast'
              ? 'bg-black border-2 border-yellow-400'
              : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">설정</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`p-2 rounded-lg ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700' 
                      : theme === 'high-contrast'
                      ? 'hover:bg-gray-800 border border-yellow-400'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  ×
                </button>
              </div>
              
              {/* 테마 설정 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">테마</label>
                  <button
                    onClick={toggleTheme}
                    className={`w-full p-3 rounded-lg text-left ${
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : theme === 'high-contrast'
                        ? 'bg-gray-800 hover:bg-gray-700 border border-yellow-400'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {theme === 'light' && '🌞 밝은 모드'}
                    {theme === 'dark' && '🌙 어두운 모드'}
                    {theme === 'high-contrast' && '🔆 고대비 모드'}
                  </button>
                </div>
                
                {/* 카메라 선택 */}
                {availableDevices.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">카메라</label>
                    <select
                      value={selectedDeviceId || ''}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className={`w-full p-3 rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600' 
                          : theme === 'high-contrast'
                          ? 'bg-gray-800 border-yellow-400 text-yellow-400'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {availableDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `카메라 ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPage;