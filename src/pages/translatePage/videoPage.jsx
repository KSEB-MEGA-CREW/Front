// src/pages/translatePage/videoPage.jsx
import React, { useState, useRef, useEffect } from "react";

const VideoPage = () => {
  const videoRef = useRef(null);
  const [translationText, setTranslationText] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [stream, setStream] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const getCamera = async () => {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
            facingMode: "user",
          },
          audio: false,
        });

        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              .play()
              .then(() => {
                setIsCameraReady(true);
                setCameraError("");
              })
              .catch((err) => {
                console.error("비디오 재생 오류:", err);
                setCameraError("비디오 재생에 실패했습니다.");
              });
          };

          videoRef.current.onerror = (err) => {
            console.error("비디오 오류:", err);
            setCameraError("비디오 로드 중 오류가 발생했습니다.");
          };
        }
      } catch (err) {
        console.error("카메라 접근 오류:", err);
        let errorMessage = "카메라 접근에 실패했습니다.";
        if (err.name === "NotAllowedError") {
          errorMessage =
            "카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라를 허용해주세요.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "카메라를 찾을 수 없습니다.";
        } else if (err.name === "NotReadableError") {
          errorMessage = "카메라가 다른 애플리케이션에서 사용 중입니다.";
        }

        setCameraError(errorMessage);
        setIsCameraReady(false);
      }
    };

    getCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const restartCamera = () => {
    setIsCameraReady(false);
    setCameraError("");

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const toggleRecording = () => {
    const startMsg = "🎥 녹화를 시작합니다";
    const endMsg = "⏳ 수어를 해석합니다...";

    if (!isRecording) {
      setStatusMessage(startMsg);
      setIsRecording(true);
      setTranslationText("");
      setTimeout(() => {
        setStatusMessage("");
      }, 1500);
    } else {
      setStatusMessage(endMsg);
      setIsRecording(false);

      // 실제 해석 처리 로직 대신 시뮬레이션
      setTimeout(() => {
        setStatusMessage("");
        const simulated = "안녕하세요. 만나서 반갑습니다.";
        setTranslationText(simulated);
        speakText(simulated);
      }, 2000);
    }
  };

  const speakText = (text) => {
    if (text && text !== "수어 입력 대기 중..." && text !== "수어 인식 중...") {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearText = () => {
    setTranslationText("");
  };

  return (
    <div className="min-h-screen h-full bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 별 애니메이션 배경 */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 웹캠 화면 */}
      <div className="relative z-10 w-full h-screen">
        {cameraError ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-red-400 text-lg mb-6">{cameraError}</p>
              <button
                onClick={restartCamera}
                className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all duration-300 backdrop-blur-sm border border-white/30"
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

            {/* 녹화 상태 */}
            {isRecording && (
              <div className="absolute top-6 left-6 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                인식 중
              </div>
            )}

            {/* 카메라 연결됨 */}
            {isCameraReady && (
              <div className="absolute top-6 right-6 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
                연결됨
              </div>
            )}

            {/* 상태 메시지 중앙 출력 */}
            {statusMessage && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-black/60 text-white text-3xl font-bold px-8 py-6 rounded-2xl animate-pulse">
                  {statusMessage}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 번역 결과 및 컨트롤 */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between">
        {/* 번역 결과 */}
        <div className="flex-1 mr-6">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            {translationText ? (
              <div className="flex items-center justify-between">
                <p className="text-xl text-white font-medium">
                  {translationText}
                </p>
                <button
                  onClick={() => speakText(translationText)}
                  className="ml-4 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300"
                >
                  🔊
                </button>
              </div>
            ) : (
              <p className="text-gray-400">수어 입력 대기 중...</p>
            )}
          </div>
        </div>

        {/* 버튼 컨트롤 */}
        <div className="flex space-x-3">
          <button
            onClick={toggleRecording}
            className={`w-36 h-16 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center text-base font-bold px-4 ${
              isRecording
                ? "bg-red-500/30 hover:bg-red-500/40 border border-red-400/30 text-red-200"
                : "bg-white/20 hover:bg-white/30 border border-white/20 text-white"
            }`}
          >
            {isRecording ? "⏹️ 녹화 중단" : "🎥 녹화 시작"}
          </button>

          <button
            onClick={clearText}
            className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-300 flex items-center justify-center text-2xl border border-white/20 text-white"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
