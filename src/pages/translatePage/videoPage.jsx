import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, CameraOff, Mic, MicOff, Play, Square, Settings, 
  Volume2, VolumeX, RotateCcw, Maximize, Minimize,
  AlertCircle, CheckCircle, Wifi, WifiOff
} from "lucide-react";
import { useFrameExtraction } from "../../hooks/useFrameExtraction";
import { useVideoCapture } from "../../hooks/useVideoCapture";

const VideoPage = () => {
    const [translationText, setTranslationText] = useState("");
    const [translationHistory, setTranslationHistory] = useState([]);
    const [statusMessage, setStatusMessage] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('connected');
    const [confidence, setConfidence] = useState(0);
    const translationRef = useRef(null);

    const { 
        videoRef, 
        isReady: isCameraReady, 
        error: cameraError,
        restartCamera,
        switchDevice,
        changeResolution,
        cameraInfo,
        availableDevices,
        startCamera
    } = useVideoCapture();

    const {isProcessing, 
        result, 
        error:frameError, 
        startFrameExtraction, 
        stopFrameExtraction} = useFrameExtraction();

    
    // 카메라 시작
    useEffect(() => {
      startCamera({
        preferredResolution: 'hd',
        preferredFrameRate: 30,
        facingMode: 'user'
      });
    }, [startCamera]);

    // toggle logic 단순화
    const toggleRecording = () => {
        console.log("=== toggleRecording 클릭됨 ===");
        console.log("isProcessing:", isProcessing);
        console.log("videoRef.current:", videoRef.current);
        console.log("isCameraReady:", isCameraReady);

        if(!isProcessing) {
            console.log("=== startFrameExtraction 호출 시도 ===");
            setStatusMessage("수화 인식 시작");
            startFrameExtraction(videoRef.current); // sessionId 전달하지 않음
        } else{
            console.log("=== stopFrameExtraction 호출 ===");
            stopFrameExtraction();
            setStatusMessage("수화 인식 중단");
        }
        setTimeout(() => setStatusMessage(""), 1500);
    };

    // 결과 처리 - 개선된 번역 결과 처리
    useEffect(() => {
      if(result) {
        if(result.status === 'SUBMITTED'){
          setStatusMessage('AI 분석 중...');
          setConnectionStatus('processing');
          setTimeout(() => setStatusMessage(''), 1500);
        }
        if(result.translatedText){
          const newTranslation = {
            id: Date.now(),
            text: result.translatedText,
            timestamp: new Date(),
            confidence: result.confidence || 0.85
          };
          
          setTranslationText(result.translatedText);
          setTranslationHistory(prev => [newTranslation, ...prev.slice(0, 9)]); // 최대 10개 유지
          setConfidence(result.confidence || 0.85);
          setConnectionStatus('connected');
          
          if(isSpeechEnabled) {
            speakText(result.translatedText);
          }
        }
      }
    },[result, isSpeechEnabled]);

    // 에러 처리
    useEffect(() => {
        const combinedError = cameraError || frameError;
        if (combinedError) {
            setStatusMessage(`오류: ${combinedError}`);
            setTimeout(() => setStatusMessage(''), 3000);
        }
    }, [cameraError, frameError]);

    const speakText = (text) => {
        if (text && isSpeechEnabled) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "ko-KR";
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const clearTranslation = () => {
        setTranslationText("");
        setTranslationHistory([]);
        setConfidence(0);
    };

    const getConnectionStatusColor = () => {
        switch(connectionStatus) {
            case 'connected': return 'text-green-400';
            case 'processing': return 'text-yellow-400';
            case 'disconnected': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getConnectionStatusIcon = () => {
        switch(connectionStatus) {
            case 'connected': return <Wifi size={16} />;
            case 'processing': return <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full" />;
            case 'disconnected': return <WifiOff size={16} />;
            default: return <WifiOff size={16} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            
            {/* 메인 컨테이너 */}
            <div className="relative w-full h-screen flex flex-col lg:flex-row">
                
                {/* 비디오 영역 */}
                <div className="flex-1 relative p-4">
                    <div className="w-full h-full bg-white/20 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden relative">
                        
                        {/* 상단 상태 바 */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-2 px-3 py-1.5 bg-white/30 backdrop-blur-md rounded-full text-sm font-medium ${getConnectionStatusColor()}`}>
                                    {getConnectionStatusIcon()}
                                    <span>
                                        {connectionStatus === 'connected' ? '연결됨' : 
                                         connectionStatus === 'processing' ? '분석 중' : '연결 끊김'}
                                    </span>
                                </div>
                                
                                {isProcessing && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 backdrop-blur-md rounded-full text-red-700 text-sm font-medium">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        수어 분석 중
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {isCameraReady && (
                                    <div className="px-3 py-1.5 bg-white/30 backdrop-blur-md rounded-full text-sm font-medium text-gray-700">
                                        {cameraInfo?.width}×{cameraInfo?.height}
                                    </div>
                                )}
                                
                                <button
                                    onClick={toggleFullscreen}
                                    className="p-2 bg-white/30 hover:bg-white/40 backdrop-blur-md rounded-xl text-gray-700 hover:text-gray-900 transition-all duration-200"
                                >
                                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                                </button>
                                
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 bg-white/30 hover:bg-white/40 backdrop-blur-md rounded-xl text-gray-700 hover:text-gray-900 transition-all duration-200"
                                >
                                    <Settings size={18} />
                                </button>
                            </div>
                        </div>

                        {/* 비디오 또는 에러 표시 */}
                        {cameraError ? (
                            <div className="w-full h-full flex items-center justify-center p-8">
                                <div className="text-center max-w-md">
                                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <AlertCircle size={32} className="text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">카메라 오류</h3>
                                    <p className="text-gray-600 mb-6">{cameraError}</p>
                                    <button
                                        onClick={() => restartCamera()}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
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

                        {/* 설정 패널 */}
                        {showSettings && (
                            <div className="absolute top-16 right-4 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl z-20 min-w-[280px]">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">카메라 설정</h4>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">카메라 선택</label>
                                        <select
                                            onChange={(e) => switchDevice(e.target.value)}
                                            className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            {availableDevices.map(device => (
                                                <option key={device.deviceId} value={device.deviceId}>
                                                    {device.label || `카메라 ${device.deviceId.slice(0, 8)}...`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">해상도</label>
                                        <select
                                            onChange={(e) => changeResolution(e.target.value)}
                                            className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="vga">640×480 (표준)</option>
                                            <option value="hd">1280×720 (HD)</option>
                                            <option value="fhd">1920×1080 (Full HD)</option>
                                        </select>
                                    </div>
                                    
                                    <div className="pt-2 border-t border-white/20">
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
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 상태 메시지 */}
                        {statusMessage && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-30">
                                <div className="bg-white/90 backdrop-blur-xl text-gray-800 text-lg font-semibold px-8 py-4 rounded-2xl shadow-2xl border border-white/30">
                                    {statusMessage}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 번역 결과 사이드바 */}
                <div className="w-full lg:w-96 p-4 flex flex-col max-h-[50vh] lg:max-h-none">
                    
                    {/* 현재 번역 결과 */}
                    <div className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 mb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">실시간 번역</h3>
                            {confidence > 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${confidence > 0.8 ? 'bg-green-500' : confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                        {Math.round(confidence * 100)}%
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div 
                            ref={translationRef}
                            className="min-h-[120px] bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                        >
                            <p className="text-lg text-gray-800 leading-relaxed">
                                {translationText || (
                                    <span className="text-gray-500 italic">
                                        {isProcessing ? "AI가 수어를 분석하고 있어요..." : "수어를 입력해주세요"}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* 번역 기록 */}
                    <div className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-4 lg:p-6 flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base lg:text-lg font-semibold text-gray-800">번역 기록</h3>
                            <button
                                onClick={clearTranslation}
                                className="p-2 hover:bg-white/20 rounded-lg text-gray-500 hover:text-gray-700 transition-all duration-200"
                                title="기록 지우기"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                        
                        <div className="space-y-2 lg:space-y-3 max-h-[200px] lg:max-h-[400px] overflow-y-auto">
                            {translationHistory.length === 0 ? (
                                <p className="text-gray-500 text-center py-4 lg:py-8 italic text-sm lg:text-base">번역 기록이 없습니다</p>
                            ) : (
                                translationHistory.map((item) => (
                                    <div key={item.id} className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5 lg:p-3 border border-white/20">
                                        <p className="text-gray-800 text-xs lg:text-sm leading-relaxed">{item.text}</p>
                                        <div className="flex items-center justify-between mt-1.5 lg:mt-2 text-xs text-gray-500">
                                            <span>{item.timestamp.toLocaleTimeString()}</span>
                                            <div className="flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${item.confidence > 0.8 ? 'bg-green-500' : item.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                                {Math.round(item.confidence * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 컨트롤 버튼들 */}
                    <div className="flex items-center gap-2 lg:gap-3 mt-4">
                        <button
                            onClick={toggleRecording}
                            disabled={!isCameraReady}
                            className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 py-3 lg:py-4 px-4 lg:px-6 rounded-xl lg:rounded-2xl font-semibold text-base lg:text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
                                isProcessing
                                    ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
                                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white disabled:opacity-50 disabled:transform-none"
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
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                                    : 'bg-white/30 text-gray-600 hover:bg-white/40'
                            }`}
                            title="음성 출력 토글"
                        >
                            {isSpeechEnabled ? <Volume2 size={18} className="lg:w-5 lg:h-5" /> : <VolumeX size={18} className="lg:w-5 lg:h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPage;