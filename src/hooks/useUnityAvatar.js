import { useState, useRef, useEffect, useCallback } from "react";

// Unity WebGL과의 통신을 관리하는 안정화된 커스텀 훅
export const useUnityAvatar = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  
  const unityInstanceRef = useRef(null);
  const containerRef = useRef(null);
  const initializationTimeoutRef = useRef(null);
  const maxInitAttempts = 3;

  // Unity 인스턴스 초기화 (개선된 안정화 버전)
  const initializeUnity = useCallback(async () => {
    // 이미 로드된 경우 중복 실행 방지
    if (isLoaded || isLoading) {
      console.log('Unity 이미 로드됨 또는 로딩 중');
      return;
    }

    // 최대 재시도 횟수 체크
    if (initializationAttempts >= maxInitAttempts) {
      setError('Unity 초기화 최대 시도 횟수 초과');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setInitializationAttempts(prev => prev + 1);

      console.log(`Unity 초기화 시도 ${initializationAttempts + 1}/${maxInitAttempts}`);

      // 1. Unity Loader 스크립트 확인 및 대기
      await waitForUnityLoader();

      // 2. 컨테이너 DOM 마운트 확인 및 대기 (개선된 로직)
      await waitForContainer();

      // 3. 기존 Unity 인스턴스 정리
      if (unityInstanceRef.current) {
        console.log('기존 Unity 인스턴스 정리 중...');
        await cleanupUnityInstance();
      }

      // 4. Unity 인스턴스 생성 (정확한 파일 경로)
      console.log('Unity 인스턴스 생성 중...');
      const unityConfig = {
        dataUrl: "/unity/webgl.data",
        frameworkUrl: "/unity/build.framework.js", 
        codeUrl: "/unity/build.wasm",
        streamingAssetsUrl: "/unity/StreamingAssets",
        companyName: "KSEB",
        productName: "SignLanguageAvatar",
        productVersion: "1.0",
        showBanner: false,
        matchWebGLToCanvasSize: true,
        devicePixelRatio: Math.min(window.devicePixelRatio, 2)
      };

      const unityInstance = await window.createUnityInstance(
        containerRef.current, 
        unityConfig,
        (progress) => {
          console.log(`Unity 로딩 진행률: ${Math.round(progress * 100)}%`);
        }
      );

      unityInstanceRef.current = unityInstance;
      setIsLoaded(true);
      setInitializationAttempts(0); // 성공 시 시도 횟수 리셋
      
      // Unity에서 React로의 메시지 수신 등록 (전역 함수 중복 방지)
      if (!window.ReceiveUnityMessage) {
        window.ReceiveUnityMessage = (gameObject, methodName, parameter) => {
          handleUnityMessage(gameObject, methodName, parameter);
        };
      }

      console.log('Unity 초기화 완료');

    } catch (err) {
      console.error(`Unity 초기화 오류 (시도 ${initializationAttempts + 1}):`, err);
      setError(err.message);
      
      // 재시도 로직 (일정 시간 후)
      if (initializationAttempts < maxInitAttempts - 1) {
        const retryDelay = (initializationAttempts + 1) * 2000; // 2초씩 증가
        console.log(`${retryDelay / 1000}초 후 Unity 초기화 재시도...`);
        
        initializationTimeoutRef.current = setTimeout(() => {
          initializeUnity();
        }, retryDelay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [initializationAttempts, isLoaded, isLoading]);

  // Unity Loader 대기 함수 (개선)
  const waitForUnityLoader = useCallback(() => {
    return new Promise((resolve, reject) => {
      let checkCount = 0;
      const maxChecks = 100; // 최대 10초 (100ms * 100)
      
      const checkLoader = () => {
        checkCount++;
        
        if (typeof window.createUnityInstance !== 'undefined') {
          console.log('Unity Loader 확인됨');
          resolve();
        } else if (checkCount >= maxChecks) {
          reject(new Error('Unity Loader 로드 타임아웃 (10초)'));
        } else {
          setTimeout(checkLoader, 100);
        }
      };
      
      checkLoader();
    });
  }, []);

  // 컨테이너 대기 함수 (강화된 DOM 체크)
  const waitForContainer = useCallback(() => {
    return new Promise((resolve, reject) => {
      let checkCount = 0;
      const maxChecks = 50; // 최대 5초 (100ms * 50)
      
      const checkContainer = () => {
        checkCount++;
        
        if (containerRef.current && 
            containerRef.current.parentNode && 
            containerRef.current.offsetParent !== null) {
          // DOM이 실제로 렌더링되고 표시 가능한지 확인
          console.log('Unity 컨테이너 DOM 준비 완료:', {
            element: containerRef.current,
            dimensions: {
              width: containerRef.current.offsetWidth,
              height: containerRef.current.offsetHeight
            }
          });
          resolve();
        } else if (checkCount >= maxChecks) {
          reject(new Error('Unity 컨테이너 DOM 마운트 타임아웃 (5초)'));
        } else {
          setTimeout(checkContainer, 100);
        }
      };
      
      checkContainer();
    });
  }, []);

  // Unity 인스턴스 정리 함수
  const cleanupUnityInstance = useCallback(async () => {
    if (unityInstanceRef.current) {
      try {
        await unityInstanceRef.current.Quit();
        console.log('Unity 인스턴스 정리 완료');
      } catch (error) {
        console.warn('Unity 정리 중 오류 (무시됨):', error);
      }
      unityInstanceRef.current = null;
    }
  }, []);

  // Unity에서 오는 메시지 처리 (개선)
  const handleUnityMessage = useCallback((gameObject, methodName, parameter) => {
    console.log(`Unity 메시지 수신: ${gameObject}.${methodName}`, parameter);
    
    switch (methodName) {
      case 'OnAnimationStart':
        setIsPlaying(true);
        setCurrentAnimation(parameter);
        break;
      case 'OnAnimationComplete':
      case 'OnAnimationEnd':
        setIsPlaying(false);
        setCurrentAnimation(null);
        break;
      case 'OnError':
        setError(parameter);
        break;
      case 'OnReady':
        console.log('Unity 아바타 준비 완료');
        break;
      default:
        console.log(`처리되지 않은 Unity 메시지: ${methodName}`);
    }
  }, []);

  // 좌표 데이터를 Unity로 전송 (AnimationManager와 연동)
  const sendCoordinateData = useCallback((coordinateData) => {
    if (!unityInstanceRef.current) {
      console.warn("Unity 인스턴스가 초기화되지 않았습니다.");
      return false;
    }

    if (!isLoaded) {
      console.warn("Unity가 아직 로드되지 않았습니다.");
      return false;
    }

    try {
      console.log('Unity로 좌표 데이터 전송:', coordinateData);
      
      unityInstanceRef.current.SendMessage(
        'AvatarController', 
        'PlaySignAnimation', 
        JSON.stringify(coordinateData)
      );
      
      setIsPlaying(true);
      return true;
    } catch (error) {
      console.error("좌표 데이터 전송 오류:", error);
      setError("애니메이션 재생 중 오류가 발생했습니다.");
      return false;
    }
  }, [isLoaded]);

  // GLB 애니메이션 신호 전송 (기존 호환성)
  const sendAnimationData = useCallback((animationData = {}) => {
    if (!unityInstanceRef.current) {
      console.warn("Unity 인스턴스가 초기화되지 않았습니다.");
      return false;
    }

    try {
      console.log('Unity GLB 애니메이션 신호 전송');
      
      unityInstanceRef.current.SendMessage(
        'AvatarController', 
        'PlayGLBAnimation', 
        JSON.stringify(animationData)
      );
      
      return true;
    } catch (error) {
      console.error("GLB 애니메이션 신호 전송 오류:", error);
      setError("애니메이션 재생 중 오류가 발생했습니다.");
      return false;
    }
  }, []);

  // 애니메이션 정지
  const stopAnimation = useCallback(() => {
    if (!unityInstanceRef.current) {
      console.warn("Unity 인스턴스가 초기화되지 않았습니다.");
      return false;
    }

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
    if (!unityInstanceRef.current) {
      console.warn("Unity 인스턴스가 초기화되지 않았습니다.");
      return false;
    }

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

  // Unity Loader 스크립트 로드 (개선된 중복 방지)
  useEffect(() => {
    const loadUnityLoader = async () => {
      // 스크립트가 이미 로드되었는지 확인
      if (document.querySelector('script[src*="76485bb6de948dcda80ca8ec0ddab156.loader"]') ||
          typeof window.createUnityInstance !== 'undefined') {
        console.log('Unity Loader 이미 로드됨');
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/unity/76485bb6de948dcda80ca8ec0ddab156.loader.js';
        script.async = true;
        script.onload = () => {
          console.log('Unity Loader 스크립트 로드 완료');
          resolve();
        };
        script.onerror = (error) => {
          console.error('Unity Loader 스크립트 로드 실패:', error);
          reject(new Error('Unity Loader 스크립트를 로드할 수 없습니다.'));
        };
        document.head.appendChild(script);
      });
    };

    loadUnityLoader().catch((error) => {
      console.error('Unity Loader 로드 실패:', error);
      setError(error.message);
    });
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      console.log('useUnityAvatar 정리 중...');
      
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      
      if (unityInstanceRef.current) {
        cleanupUnityInstance();
      }
      
      setIsLoaded(false);
      setIsPlaying(false);
      setCurrentAnimation(null);
    };
  }, [cleanupUnityInstance]);

  return {
    // 상태
    isLoaded,
    isLoading,
    error,
    isPlaying,
    currentAnimation,
    initializationAttempts,

    // 참조
    containerRef,

    // 메서드
    initializeUnity,
    sendAnimationData,      // GLB 호환
    sendCoordinateData,     // Unity 좌표 데이터
    stopAnimation,
    resetAvatar,
    cleanup: cleanupUnityInstance
  };
};