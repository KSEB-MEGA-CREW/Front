// src/hooks/useUnityAvatar.js
import { useState, useRef, useEffect, useCallback } from "react";

export const useUnityAvatar = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const unityInstanceRef = useRef(null);
  const containerRef = useRef(null);

  const initializeUnity = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (typeof window.createUnityInstance === 'undefined') {
        throw new Error('Unity Loader가 로드되지 않았습니다.');
      }

      const unityInstance = await window.createUnityInstance(containerRef.current, {
        dataUrl: "/unity/Build/WebGL.data",
        frameworkUrl: "/unity/Build/WebGL.framework.js",
        codeUrl: "/unity/Build/WebGL.wasm",
        streamingAssetsUrl: "StreamingAssets",
        companyName: "YourCompany",
        productName: "SignLanguageAvatar",
        productVersion: "1.0",
        showBanner: false,
        matchWebGLToCanvasSize: false,
        devicePixelRatio: 1
      });

      unityInstanceRef.current = unityInstance;
      setIsLoaded(true);

      window.ReceiveUnityMessage = (gameObject, methodName, parameter) => {
        handleUnityMessage(gameObject, methodName, parameter);
      };

    } catch (err) {
      console.error("Unity 초기화 오류:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUnityMessage = useCallback((gameObject, methodName, parameter) => {
    switch (methodName) {
      case 'OnAnimationStart':
        setIsPlaying(true);
        break;
      case 'OnAnimationComplete':
        setIsPlaying(false);
        break;
      case 'OnError':
        setError(parameter);
        break;
    }
  }, []);

  // AI 서버에서 받은 좌표 데이터를 Unity로 전송
  const sendCoordinateData = useCallback((coordinateData) => {
    if (!unityInstanceRef.current) {
      console.warn("Unity 인스턴스가 초기화되지 않았습니다.");
      return false;
    }

    try {
      // AI 서버 응답 데이터를 Unity로 전송
      unityInstanceRef.current.SendMessage(
        'AvatarController',
        'PlaySignAnimation',
        JSON.stringify(coordinateData)
      );
      return true;
    } catch (error) {
      console.error("좌표 데이터 전송 오류:", error);
      setError("애니메이션 재생 중 오류가 발생했습니다.");
      return false;
    }
  }, []);

  const stopAnimation = useCallback(() => {
    if (!unityInstanceRef.current) return false;

    try {
      unityInstanceRef.current.SendMessage('AvatarController', 'StopAnimation', '');
      setIsPlaying(false);
      return true;
    } catch (error) {
      console.error("애니메이션 정지 오류:", error);
      return false;
    }
  }, []);

  return {
    isLoaded,
    isLoading,
    error,
    isPlaying,
    containerRef,
    initializeUnity,
    sendCoordinateData,
    stopAnimation
  };
};