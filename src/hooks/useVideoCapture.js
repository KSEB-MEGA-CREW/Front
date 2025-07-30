import { useState, useRef, useCallback, useEffect } from "react";
import { useCameraService } from "./useCameraService";
// 웹캠 스트림 관리
// 카메라 하드웨어 제어
// 현재 핵심 기능만 구현 추후 추가 기능 구현하기

export const useVideoCapture = () => {
  const [stream, setStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [cameraInfo, setCameraInfo] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // 카메라 서비스 훅 사용
  const {
    availableDevices,
    getAvailableDevices,
    createOptimalConstraints,
    getCameraInfo,
    generateErrorMessage,
    checkBrowserSupport,
  } = useCameraService();

  // camera stream start
  const startCamera = useCallback(
    async (options = {}) => {
      try {
        setError(null);
        setIsReady(false);

        // 브라우저 지원 확인
        const browserSupport = checkBrowserSupport();
        if (!browserSupport.isSupported) {
          throw new Error("브라우저가 카메라를 지원하지 않습니다.");
        }

        // 기존 스트림 정지
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        // 최적화된 제약조건 생성
        const constraints = createOptimalConstraints(options);

        // 새 스트림 요청
        const mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );

        streamRef.current = mediaStream;
        setStream(mediaStream);

        // 카메라 정보 수집
        const info = await getCameraInfo(mediaStream);
        setCameraInfo(info);

        // 비디오 엘리먼트에 연결
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              .play()
              .then(() => setIsReady(true))
              .catch((err) =>
                setError("비디오 재생에 실패했습니다: " + err.message)
              );
          };

          videoRef.current.onerror = () => {
            setError("비디오 로드 중 오류가 발생했습니다.");
          };
        }
        return mediaStream;
      } catch (err) {
        const errorMessage = generateErrorMessage(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [
      createOptimalConstraints,
      getCameraInfo,
      generateErrorMessage,
      checkBrowserSupport,
    ]
  );

  // 카메라 정지
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks.forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsReady(false);
    setCameraInfo(null);
  }, []);

  // 카메라 재시작
  const restartCamera = useCallback(
    async (options) => {
      stopCamera();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return startCamera(options);
    },
    [stopCamera, startCamera]
  );

  // 디바이스 변경
  const switchDevice = useCallback(
    async (deviceId) => {
      return startCamera({ preferredDeviceId: deviceId });
    },
    [startCamera]
  );

  // 해상도 변경
  const changeResolution = useCallback(
    async (resolution) => {
      return startCamera({ preferredResolution: resolution });
    },
    [startCamera]
  );

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // 초기 디바이스 목록 로드
  useEffect(() => {
    getAvailableDevices();
  }, [getAvailableDevices]);

  return {
    // 상태
    stream,
    isReady,
    error,
    cameraInfo,
    availableDevices,

    // 참조
    videoRef,

    // 메서드
    startCamera,
    stopCamera,
    restartCamera,
    switchDevice,
    changeResolution,
    getAvailableDevices,
  };
};
