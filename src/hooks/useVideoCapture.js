import { useState, useRef, useCallback, useEffect } from "react";
import { useCameraService } from "./useCameraService";

export const useVideoCapture = () => {
  const [stream, setStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [cameraInfo, setCameraInfo] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const {
    availableDevices,
    getAvailableDevices,
    createOptimalConstraints,
    getCameraInfo,
    generateErrorMessage,
    checkBrowserSupport,
  } = useCameraService();

  const startCamera = useCallback(
    async (options = {}) => {
      try {
        setError(null);
        setIsReady(false);

        const browserSupport = checkBrowserSupport();
        if (!browserSupport.isSupported) {
          throw new Error("브라우저가 카메라를 지원하지 않습니다.");
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const constraints = createOptimalConstraints(options);
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        streamRef.current = mediaStream;
        setStream(mediaStream);

        const info = await getCameraInfo(mediaStream);
        setCameraInfo(info);

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
    [createOptimalConstraints, getCameraInfo, generateErrorMessage, checkBrowserSupport]
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsReady(false);
    setCameraInfo(null);
  }, []);

  const restartCamera = useCallback(
    async (options) => {
      stopCamera();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return startCamera(options);
    },
    [stopCamera, startCamera]
  );

  const switchDevice = useCallback(
    async (deviceId) => {
      return startCamera({ preferredDeviceId: deviceId });
    },
    [startCamera]
  );

  const changeResolution = useCallback(
    async (resolution) => {
      return startCamera({ preferredResolution: resolution });
    },
    [startCamera]
  );

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    getAvailableDevices();
  }, [getAvailableDevices]);

  return {
    stream,
    isReady,
    error,
    cameraInfo,
    availableDevices,
    videoRef,
    startCamera,
    stopCamera,
    restartCamera,
    switchDevice,
    changeResolution,
    getAvailableDevices,
  };
};