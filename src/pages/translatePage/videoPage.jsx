import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFrameExtraction } from "../hooks/useFrameExtraction";
import { useAuth } from "../Context/authContext";
import { AlertCircle, Play, Square, Wifi, WifiOff } from "lucide-react";

const VideoPage = () => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [translationText, setTranslationText] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [stream, setStream] = useState(null);
  const [translationHistory, setTranslationHistory] = useState([]);

  // 통합 시스템 매니저 기반 훅 사용
  const {
    isProcessing,
    result,
    error: frameError,
    status,
    isConnected,
    sessionStats,
    startFrameExtraction,
    stopFrameExtraction,
    cleanup,
    initialize
  } = useFrameExtraction();

  // 카메라 스트림 초기화
  const initializeCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          facingMode: "user"
        },
        audio: false
      });

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setIsCameraReady(true);
            setCameraError("");
            console.log('✅ 카메라 스트림 준비 완료');
          }).catch(err => {
            console.error('비디오 재생 실패:', err);
            setCameraError("비디오 재생에 실패했습니다.");
          });
        };
      }

    } catch (err) {
      console.error('카메라 초기화 실패:', err);
      setCameraError(`카메라 접근 실패: ${err.message}`);
      setIsCameraReady(false);
    }
  }, [stream]);

  // 컴포넌트 마운트 시 카메라 초기화
  useEffect(() => {
    if (user?.id) {
      initializeCamera();
    }

    return () => {
      cleanup();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [user?.id, initializeCamera, cleanup]);

  // 결과 업데이트 및 히스토리 관리
  useEffect(() => {
    if (result?.translatedText) {
      setTranslationText(result.translatedText);
      
      // 히스토리에 추가 (중복 제거)
      setTranslationHistory(prev => {
        const newEntry = {
          id: Date.now(),
          text: result.translatedText,
          confidence: result.confidence,
          timestamp: result.timestamp || Date.now()
        };
        
        // 같은 텍스트가 연속으로 오면 업데이트만
        if (prev.length > 0 && prev[prev.length - 1].text === result.translatedText) {
          return prev;
        }
        
        return [...prev.slice(-9), newEntry]; // 최근 10개만 유지
      });
    }
  }, [result]);

  // 녹화 토글
  const toggleRecording = useCallback(async () => {
    if (!isCameraReady) {
      setCameraError("카메라가 준비되지 않았습니다.");
      return;
    }

    try {
      if (!isProcessing) {
        console.log('🎬 분석 시작');
        await startFrameExtraction(videoRef.current);
      } else {
        console.log('⏹️ 분석 중지');
        stopFrameExtraction();
      }
    } catch (err) {
      console.error('녹화 토글 오류:', err);
      setCameraError(`분석 ${isProcessing ? '중지' : '시작'} 실패: ${err.message}`);
    }
  }, [isCameraReady, isProcessing, startFrameExtraction, stopFrameExtraction]);

  // 상태에 따른 UI 텍스트
  const getStatusText = () => {
    switch (status) {
      case 'initializing':
        return '시스템 초기화 중...';
      case 'processing':
        return '수화 분석 중';
      case 'error':
        return '오류 발생';
      default:
        return '수화 입력 대기 중...';
    }
  };

  const getConnectionIcon = () => {
    return isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="relative w-full h-full">
        {/* 비디오 스트림 */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* 상태 표시 */}
        <div className="absolute top-6 left-6 flex gap-4">
          {/* 연결 상태 */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
            isConnected 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            {getConnectionIcon()}
            {isConnected ? '연결됨' : '연결 끊김'}
          </div>

          {/* 처리 상태 */}
          {status === 'processing' && (
            <div className="bg-blue-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
              <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
              {getStatusText()}
            </div>
          )}

          {/* 세션 통계 */}
          {sessionStats.startTime && (
            <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              프레임: {sessionStats.frameCount}
            </div>
          )}
        </div>

        {/* 에러 표시 */}
        {(frameError || cameraError) && (
          <div className="absolute top-20 left-6 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 max-w-md">
            <AlertCircle className="w-4 h-4" />
            {frameError || cameraError}
          </div>
        )}
      </div>

      {/* 번역 결과 및 컨트롤 */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between">
        <div className="flex-1 mr-6">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            {translationText ? (
              <p className="text-xl text-white font-medium">{translationText}</p>
            ) : (
              <p className="text-gray-400">{getStatusText()}</p>
            )}
            
            {/* 신뢰도 표시 */}
            {result?.confidence && (
              <div className="mt-2 text-sm text-gray-300">
                신뢰도: {(result.confidence * 100).toFixed(1)}%
              </div>
            )}
          </div>

          {/* 번역 히스토리 */}
          {translationHistory.length > 0 && (
            <div className="mt-4 bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/5">
              <h3 className="text-white text-sm font-semibold mb-2">최근 번역</h3>
              <div className="space-y-1">
                {translationHistory.slice(-3).map((entry) => (
                  <div key={entry.id} className="text-gray-300 text-sm">
                    {entry.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 컨트롤 버튼 */}
        <button
          onClick={toggleRecording}
          disabled={!isCameraReady || status === 'initializing'}
          className={`w-36 h-16 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center text-base font-bold px-4 ${
            isProcessing
              ? "bg-red-500/30 hover:bg-red-500/40 border border-red-400/30 text-red-200"
              : "bg-white/20 hover:bg-white/30 border border-white/20 text-white disabled:opacity-50"
          }`}
        >
          {isProcessing ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              분석 중단
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              분석 시작
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoPage;