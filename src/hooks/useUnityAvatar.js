import { useState, useRef, useEffect, useCallback } from "react";

// Unity WebGL과의 통신을 관리하는 커스텀 훅
export const useUnityAvatar = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(null);
  
  const unityInstanceRef = useRef(null);
  const containerRef = useRef(null);

  // Unity 인스턴스 초기화
  const initializeUnity = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Unity Loader가 로드되었는지 확인
      if (typeof window.createUnityInstance === 'undefined') {
        throw new Error('Unity Loader가 로드되지 않았습니다.');
      }

      // Unity 인스턴스 생성
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
      
      // Unity에서 React로의 메시지 수신 등록
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

  // Unity에서 오는 메시지 처리
  const handleUnityMessage = useCallback((gameObject, methodName, parameter) => {
    switch (methodName) {
      case 'OnAnimationStart':
        setIsPlaying(true);
        setCurrentAnimation(parameter);
        break;
      case 'OnAnimationComplete':
        setIsPlaying(false);
        setCurrentAnimation(null);
        break;
      case 'OnError':
        setError(parameter);
        break;
      default:
        console.log(`Unity 메시지: ${gameObject}.${methodName}(${parameter})`);
    }
  }, []);

  // Unity로 애니메이션 데이터 전송
  const sendAnimationData = useCallback((animationData) => {
    if (!unityInstanceRef.current) {
      console.warn("Unity 인스턴스가 초기화되지 않았습니다.");
      return false;
    }

    try {
      // Unity의 AvatarController GameObject에 메시지 전송
      unityInstanceRef.current.SendMessage(
        'AvatarController', 
        'PlaySignLanguageAnimation', 
        JSON.stringify(animationData)
      );
      return true;
    } catch (error) {
      console.error("애니메이션 데이터 전송 오류:", error);
      setError("애니메이션 재생 중 오류가 발생했습니다.");
      return false;
    }
  }, []);

  // 애니메이션 정지
  const stopAnimation = useCallback(() => {
    if (!unityInstanceRef.current) return false;

    try {
      unityInstanceRef.current.SendMessage('AvatarController', 'StopAnimation', '');
      setIsPlaying(false);
      setCurrentAnimation(null);
      return true;
    } catch (error) {
      console.error("애니메이션 정지 오류:", error);
      return false;
    }
  }, []);

  // 아바타 리셋
  const resetAvatar = useCallback(() => {
    if (!unityInstanceRef.current) return false;

    try {
      unityInstanceRef.current.SendMessage('AvatarController', 'ResetPose', '');
      setIsPlaying(false);
      setCurrentAnimation(null);
      return true;
    } catch (error) {
      console.error("아바타 리셋 오류:", error);
      return false;
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  const cleanup = useCallback(() => {
    if (unityInstanceRef.current) {
      unityInstanceRef.current.Quit();
      unityInstanceRef.current = null;
    }
    setIsLoaded(false);
    setIsPlaying(false);
    setCurrentAnimation(null);
  }, []);

  // Unity Loader 스크립트 로드
  useEffect(() => {
    const loadUnityLoader = () => {
      if (document.querySelector('script[src*="UnityLoader"]')) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/unity/Build/UnityLoader.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Unity Loader 스크립트를 로드할 수 없습니다.'));
        document.head.appendChild(script);
      });
    };

    loadUnityLoader()
      .then(() => {
        // Unity Loader가 로드되면 자동으로 Unity 초기화는 하지 않음
        // 사용자가 명시적으로 initializeUnity를 호출해야 함
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // 상태
    isLoaded,
    isLoading,
    error,
    isPlaying,
    currentAnimation,

    // 참조
    containerRef,

    // 메서드
    initializeUnity,
    sendAnimationData,
    stopAnimation,
    resetAvatar,
    cleanup
  };
};