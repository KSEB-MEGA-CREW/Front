import React, { useState, useEffect } from "react";
import { useFrameExtraction } from "../../hooks/useFrameExtraction";
import { useVideoCapture } from "../../hooks/useVideoCapture";

const VideoPage = () => {
    const [translationText, setTranslationText] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [showSettings, setShowSettings] = useState(false);

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

    // 결과 처리
    useEffect(() => {
      if(result) {
        if(result.status === 'SUBMITTED'){
          setStatusMessage('프레임 전송 완료');
          setTimeout(() => setStatusMessage('Timeout!!!'), 2000);
        }
        if(result.translatedText){
          setTranslationText(result.translatedText);
          speakText(result.translatedText);
        }
      }
    },[result]);

    // 에러 처리
    useEffect(() => {
        const combinedError = cameraError || frameError;
        if (combinedError) {
            setStatusMessage(`오류: ${combinedError}`);
            setTimeout(() => setStatusMessage(''), 3000);
        }
    }, [cameraError, frameError]);

    const speakText = (text) => {
        if (text) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "ko-KR";
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative">
            <div className="relative w-full h-screen">
                {cameraError ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-red-400 text-lg mb-6">{cameraError}</p>
                            <button
                                onClick={() => restartCamera()}
                                className="px-8 py-3 bg-white/20 text-white rounded-full"
                            >
                                카메라 재시작
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {isProcessing && (
                            <div className="absolute top-6 left-6 bg-red-500/90 text-white px-4 py-2 rounded-full">
                                수화 분석 중
                            </div>
                        )}
                        {isCameraReady && (
                            <div className="absolute top-6 right-6 bg-green-500/90 text-white px-4 py-2 rounded-full">
                                {cameraInfo?.width}×{cameraInfo?.height}
                            </div>
                        )}
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="absolute top-6 right-20 bg-blue-500/90 text-white px-4 py-2 rounded-full"
                        >
                            ⚙️
                        </button>
                        {showSettings && (
                            <div className="absolute top-16 right-6 bg-black/80 text-white p-4 rounded-lg">
                                <h4 className="mb-2">카메라 설정</h4>
                                <div className="mb-3">
                                    <label className="block text-sm mb-1">카메라:</label>
                                    <select
                                        onChange={(e) => switchDevice(e.target.value)}
                                        className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                    >
                                        {availableDevices.map(device => (
                                            <option key={device.deviceId} value={device.deviceId}>
                                                {device.label || '카메라'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">해상도:</label>
                                    <select
                                        onChange={(e) => changeResolution(e.target.value)}
                                        className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                    >
                                        <option value="vga">640×480</option>
                                        <option value="hd">1280×720</option>
                                        <option value="fhd">1920×1080</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        {statusMessage && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black/60 text-white text-2xl font-bold px-8 py-6 rounded-2xl">
                                    {statusMessage}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div className="flex-1 mr-6">
                    <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <p className="text-xl text-white">
                            {translationText || (isProcessing ? "수화 분석 중..." : "수화 입력 대기 중...")}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={toggleRecording}
                        disabled={!isCameraReady}
                        className={`w-36 h-16 rounded-full backdrop-blur-md flex items-center justify-center font-bold ${
                        isProcessing
                        ? "bg-red-500/30 text-red-200"
                        : "bg-white/20 text-white disabled:opacity-50"
                        }`}
                    >
                        {isProcessing ? "⏹️ 중단" : "🎥 시작"}
                    </button>
                    <button
                        onClick={() => setTranslationText("")}
                        className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl text-white"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoPage;