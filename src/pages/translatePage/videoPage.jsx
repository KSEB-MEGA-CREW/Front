import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFrameExtraction } from "../../hooks/useFrameExtraction";
import { AlertCircle, Settings, Maximize, Minimize, Volume2, VolumeX, Play, Square, RotateCcw, Wifi, WifiOff } from "lucide-react";

const VideoPage = () => {
  const videoRef = useRef(null);
  const [translationText, setTranslationText] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [stream, setStream] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
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
    translationState,
    startFrameExtraction,
    stopFrameExtraction,
    cleanup
  } = useFrameExtraction();

  // 카메라 스트림 설정
  const getCamera = useCallback(async () => {
    console.log("📷 카메라 초기화 시작...");
    
    try {
      if (stream) {
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

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setIsCameraReady(true);
            setCameraError("");
            
            const videoTrack = newStream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            setCameraInfo({
              width: settings.width,
              height: settings.height,
              deviceLabel: videoTrack.label
            });
          }).catch(playErr => {
            setCameraError("비디오 재생에 실패했습니다.");
          });
        };
      }
    } catch (err) {
      setCameraError("카메라 접근에 실패했습니다. 카메라 권한을 확인해 주세요.");
      setIsCameraReady(false);
    }
  }, [stream, selectedDeviceId]);

  // 카메라 초기화
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableDevices(videoDevices);

        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        } else if (selectedDeviceId) {
          await getCamera();
        }
      } catch (err) {
        setCameraError("카메라 초기화에 실패했습니다.");
      }
    };

    initializeCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedDeviceId]);

  // 🔄 수정: 웹소켓 결과 업데이트 (완성된 문장만 히스토리에 저장)
  useEffect(() => {
    if (result?.label && result?.type === 'sentence') {
      console.log("📝 완성된 문장 히스토리 추가:", result);
      
      const newTranslation = {
        text: result.label,
        confidence: result.confidence || 1.0,
        timestamp: new Date(),
        glosses: result.glosses || [],
        type: 'sentence'
      };
      
      setTranslationHistory(prev => [newTranslation, ...prev.slice(0, 9)]);
      setTranslationText(result.label);

      // TTS 음성 출력 (완성된 문장만)
      if (isSpeechEnabled) {
        speakText(result.label);
      }
    }
    
    // 실시간 예측도 현재 텍스트로 표시 (히스토리에는 저장하지 않음)
    if (result?.label && result?.type === 'prediction') {
      setTranslationText(result.label);
    }
  }, [result, isSpeechEnabled]);

  // TTS 음성 출력
  const speakText = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // 🔄 추가: 결과 타입별 구분 표시 함수
  const renderTranslationResult = () => {
    if (!result) {
      return (
        <div className="text-center py-8">
          <p className={`text-gray-400 italic ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            수어를 인식하면 여기에 번역 결과가 표시됩니다
          </p>
        </div>
      );
    }

    const isCompleteSentence = result.type === 'sentence';
    const isRealtimePrediction = result.type === 'prediction';
    
    return (
      <div className="space-y-4">
        {/* 결과 타입 표시 */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isCompleteSentence 
              ? isDarkMode ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-green-100 text-green-700 border border-green-200"
              : isDarkMode ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-blue-100 text-blue-700 border border-blue-200"
          }`}>
            {isCompleteSentence ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-semibold">완성된 문장</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>실시간 예측</span>
              </>
            )}
          </div>
          
          {result.confidence && (
            <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              신뢰도: {Math.round(result.confidence * 100)}%
            </span>
          )}
        </div>

        {/* 번역 결과 텍스트 */}
        <div className={`p-4 rounded-xl border ${
          isCompleteSentence
            ? isDarkMode ? "bg-green-900/20 border-green-500/30" : "bg-green-50 border-green-200"
            : isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
        }`}>
          <p className={`text-lg font-medium leading-relaxed ${
            isCompleteSentence 
              ? "text-xl font-semibold"
              : ""
          } ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            {result.label}
          </p>
        </div>

        {/* Gloss 정보 (완성된 문장인 경우) */}
        {isCompleteSentence && result.glosses && result.glosses.length > 0 && (
          <div className={`p-3 rounded-lg border ${
            isDarkMode ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-200"
          }`}>
            <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              <span className="font-medium">사용된 수어:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {result.glosses.map((gloss, index) => (
                  <span 
                    key={index}
                    className={`px-2 py-1 rounded text-xs font-mono ${
                      isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {gloss}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 타임스탬프 */}
        <div className="text-right">
          <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            {new Date(result.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  };

  // 웹소켓 연결 상태에 따른 아이콘 및 텍스트
  const getConnectionStatusIcon = () => {
    switch (connectionState) {
      case 'OPEN':
        return <Wifi size={16} className="text-green-500" />;
      case 'CONNECTING':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <WifiOff size={16} className="text-red-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'OPEN':
        return 'WebSocket 연결됨';
      case 'CONNECTING':
        return '연결 중...';
      case 'CLOSING':
        return '연결 종료 중...';
      default:
        return 'WebSocket 연결 안됨';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'OPEN':
        return 'border-green-500/30 bg-green-500/10';
      case 'CONNECTING':
        return 'border-blue-500/30 bg-blue-500/10';
      default:
        return 'border-red-500/30 bg-red-500/10';
    }
  };

  // 녹화/분석 토글
  const toggleRecording = useCallback(async () => {
    if (!videoRef.current) {
      console.error("❌ 비디오 요소가 없어서 중단");
      return;
    }

    try {
      if (!isProcessing) {
        await startFrameExtraction(videoRef.current);
      } else {
        stopFrameExtraction();
      }
    } catch (error) {
      console.error('❌ Recording toggle error:', error);
    }
  }, [isProcessing, startFrameExtraction, stopFrameExtraction]);

  // 카메라 재시작
  const restartCamera = useCallback(async () => {
    setCameraError("");
    await getCamera();
  }, [getCamera]);

  // 디바이스 변경
  const switchDevice = useCallback((deviceId) => {
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
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      isDarkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      {/* 메인 컨테이너 */}
      <div className="relative w-full h-screen flex flex-col lg:flex-row">
        {/* 비디오 영역 */}
        <div className="flex-1 relative p-4">
          <div className={`w-full h-full rounded-3xl shadow-2xl overflow-hidden relative border ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            {/* 상단 상태 바 */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${
                  isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700"
                } ${getConnectionStatusColor()}`}>
                  {getConnectionStatusIcon()}
                  <span>{getConnectionStatusText()}</span>
                </div>

                {isProcessing && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    isDarkMode ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700"
                  }`}>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    수어 분석 중
                  </div>
                )}

                {/* 🔄 추가: 번역 상태 표시 */}
                {translationState === 'active' && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    isDarkMode ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"
                  }`}>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    번역 세션 활성
                  </div>
                )}

                {sessionStats && (
                  <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
                  }`}>
                    FPS: {sessionStats.fps || 0}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isCameraReady && cameraInfo && (
                  <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                  }`}>
                    {cameraInfo.width}×{cameraInfo.height}
                  </div>
                )}

                <button onClick={toggleFullscreen} className={`p-2 rounded-xl transition-all duration-200 ${
                  isDarkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-gray-100"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                }`}>
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>

                <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-xl transition-all duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-gray-100"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                }`}>
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
                  <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    카메라 오류
                  </h3>
                  <p className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {cameraError}
                  </p>
                  <button onClick={restartCamera} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
                    <RotateCcw size={18} />
                    카메라 재시작
                  </button>
                </div>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
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
              <div className={`absolute top-16 right-4 rounded-2xl p-6 shadow-2xl z-20 min-w-[280px] border ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  카메라 설정
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      카메라 선택
                    </label>
                    <select value={selectedDeviceId || ''} onChange={(e) => switchDevice(e.target.value)} className={`w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}>
                      {availableDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `카메라 ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      다크 모드
                    </label>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-full rounded-lg px-3 py-2 text-sm border transition-colors ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                        : "bg-white border-gray-300 text-gray-900 hover:bg-gray-200"
                    }`}>
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
         <div className={`rounded-2xl p-6 shadow-xl border ${
           isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
         }`}>
           <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
             번역 결과
           </h3>
           <div className={`min-h-[120px] rounded-xl p-4 border ${
             isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
           }`}>
             {/* 🔄 수정: 새로운 결과 표시 함수 사용 */}
             {renderTranslationResult()}
           </div>
         </div>

         {/* 번역 히스토리 */}
         <div className={`flex-1 rounded-2xl p-6 shadow-xl border ${
           isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
         }`}>
           <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
             완성된 문장 히스토리
           </h3>
           <div className="space-y-2 max-h-64 overflow-y-auto">
             {translationHistory.length === 0 ? (
               <p className={`text-sm italic ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                 아직 완성된 문장이 없습니다.
               </p>
             ) : (
               translationHistory.map((item, index) => (
                 <div key={index} className={`p-3 rounded-lg border ${
                   isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                 }`}>
                   <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                     {item.text}
                   </p>
                   
                   {item.glosses && item.glosses.length > 0 && (
                     <p className={`text-xs mt-1 font-mono ${
                       isDarkMode ? "text-gray-400" : "text-gray-500"
                     }`}>
                       {item.glosses.join(' → ')}
                     </p>
                   )}
                   
                   <div className={`flex justify-between items-center mt-1 text-xs ${
                     isDarkMode ? "text-gray-400" : "text-gray-500"
                   }`}>
                     <span>{item.timestamp.toLocaleTimeString()}</span>
                     <div className="flex items-center gap-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                       완성
                     </div>
                   </div>
                 </div>
               ))
             )}
           </div>
         </div>

         {/* 컨트롤 버튼들 */}
         <div className="flex items-center gap-2 lg:gap-3">
           <button
             onClick={toggleRecording}
             disabled={!videoRef.current}
             className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 py-3 lg:py-4 px-4 lg:px-6 rounded-xl lg:rounded-2xl font-semibold text-base lg:text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
               isProcessing
                 ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
                 : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-purple-600 text-white disabled:opacity-50 disabled:transform-none"
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
                 ? "border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
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
