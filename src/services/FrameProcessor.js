// src/services/FrameProcessor.js
import { keypointUtils } from "../utils/keypointUtils.js";
import { performanceLogger } from "../utils/performanceUtils.js";
import { MEDIAPIPE_CONFIG, ERROR_CODES } from "../constants/videoConfig.js";

console.log('🔄 FrameProcessor.js 모듈 로드됨');

export class FrameProcessor {
    constructor() {
        console.log('🔧 FrameProcessor constructor 호출됨');
        this.hands = null;
        this.ready = false;
        this.frameIndex = 0;
        this.frameBuffer = [];
        this.isProcessing = false;
        this.initPromise = null;
        this.loadingTimeout = null;
        this.lastResults = null;
        this.pendingResolve = null; // 🔧 추가: 대기 중인 Promise resolve 함수
        
        // 스마트 일시정지 상태 추가
        this.isPaused = false;
        this.pauseReason = null;
        this.pausedAt = null;
        
        console.log('✅ FrameProcessor 생성 완료');
    }

  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  async _initialize() {
    try {
      // 1. 브라우저 환경 확인
      if (typeof window === "undefined") {
        throw new Error(" 브라우저 환경이 아닙니다");
      }

      // 2. MediaPipe 라이브러리 대기 (최대 5초)
      await this.waitForMediaPipe();

            // 3. Hands 인스턴스 생성
            console.log('🤲 MediaPipe Hands 인스턴스 생성 중...');

            if (window.Hands) {
                this.hands = new window.Hands({
                    locateFile: (file) => {
                        const url = `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                        console.log(`📁 MediaPipe 파일 로드: ${url}`);
                        return url;
                    }
                });

                // 4. 설정 적용
                this.hands.setOptions({
                    maxNumHands: MEDIAPIPE_CONFIG?.MAX_NUM_HANDS || 2,
                    modelComplexity: MEDIAPIPE_CONFIG?.MODEL_COMPLEXITY || 1,
                    minDetectionConfidence: MEDIAPIPE_CONFIG?.MIN_DETECTION_CONFIDENCE || 0.7,
                    minTrackingConfidence: MEDIAPIPE_CONFIG?.MIN_TRACKING_CONFIDENCE || 0.5
                });

                // 🔧 수정: MediaPipe 결과 콜백 개선
                this.hands.onResults((results) => {
                    this.lastResults = results;
                    console.log('📊 MediaPipe 결과 수신:', {
                        handsDetected: results?.multiHandLandmarks?.length || 0,
                        timestamp: Date.now()
                    });

                    // 🔧 추가: 대기 중인 Promise 해결
                    if (this.pendingResolve) {
                        this.pendingResolve(results);
                        this.pendingResolve = null;
                    }
                });

                console.log('✅ MediaPipe Hands 설정 완료');
            } else {
                console.log('⚠️ MediaPipe 없음 - 테스트 모드');
            }

            // 5. 초기화 완료
            this.ready = true;
            this.initPromise = null;

            console.log('✅ FrameProcessor 초기화 완료');
            return true;

        } catch (error) {
            console.error('❌ FrameProcessor 초기화 실패:', error);
            this.ready = false;
            this.initPromise = null;
            this.cleanup();
            throw error;
        }
    }

    // MediaPipe 라이브러리 로드 대기
    async waitForMediaPipe() {
        const maxWaitTime = MEDIAPIPE_CONFIG.INITIALIZATION_TIMEOUT / 2; // 5초
        const checkInterval = 100;
        let waitTime = 0;

        return new Promise((resolve) => {
            const checkMediaPipe = () => {
                if (window.Hands) {
                    console.log('✅ MediaPipe Hands 로드 완료');
                    resolve();
                    return;
                }

                waitTime += checkInterval;
                if (waitTime >= maxWaitTime) {
                    console.warn('⚠️ MediaPipe 라이브러리 로드 타임아웃 - 테스트 모드로 전환');
                    resolve();
                    return;
                }

        setTimeout(checkMediaPipe, checkInterval);
      };

      checkMediaPipe();
    });
  }

    async extractKeypoints(videoElement, sessionId) {
        console.log('📊 [FrameProcessor.js] 키포인트 추출 시작', {
            ready: this.ready,
            sessionId,
            hands: !!this.hands,
            isProcessing: this.isProcessing,
            bufferSize: this.frameBuffer.length
        });

        if (!this.ready) {
            const error = {
                code: ERROR_CODES.MEDIAPIPE_INIT_FAILED,
                message: 'FrameProcessor가 초기화되지 않았습니다'
            };
            console.error('[FrameProcessor.js]', error);
            const err = new Error(error.message);
            err.code = error.code;
            throw err;
        }

    if (!videoElement || videoElement.videoWidth === 0) {
      const error = {
        code: ERROR_CODES.VIDEO_ELEMENT_NOT_READY,
        message: '비디오 요소가 준비되지 않았습니다'
      };
      const err = new Error(error.message);
      err.code = error.code;
      throw err;
    }

    if (this.isProcessing) {
      return null;
    }

    try {
      this.isProcessing = true;
      performanceLogger.startTimer("keypointExtraction");

            let keypoints;

            // MediaPipe 사용 가능 여부에 따라 분기 처리
            if (this.hands && window.Hands) {
                console.log('🤲 [FrameProcessor.js] 실제 MediaPipe로 키포인트 추출', {
                    videoWidth: videoElement?.videoWidth,
                    videoHeight: videoElement?.videoHeight,
                    readyState: videoElement?.readyState
                });
                try {
                    const results = await this.processFrame(videoElement);
                    keypoints = keypointUtils.normalizeKeypoints(results || {});
                } catch (mpError) {
                    console.warn('⚠️ MediaPipe 처리 실패, 테스트 모드로 전환:', mpError.message);
                    keypoints = this.generateTestKeypoints();
                }
            } else {
                console.log('🧪 [FrameProcessor.js] 테스트 모드: 가짜 키포인트 생성', {
                    handsExists: !!this.hands,
                    windowHandsExists: !!window.Hands
                });
                keypoints = this.generateTestKeypoints();
            }

            // 키포인트 데이터 검증
            if (!Array.isArray(keypoints) || keypoints.length !== 194) {
                console.warn('⚠️ 잘못된 키포인트 형식, 기본값으로 대체');
                keypoints = new Array(194).fill(0.0);
            }

      // 단일 프레임 데이터 검증
      console.log('📊 [FrameProcessor] 단일 프레임 데이터:', {
        type: Array.isArray(keypoints) ? 'Array' : typeof keypoints,
        length: Array.isArray(keypoints) ? keypoints.length : 'N/A',
        firstFew: Array.isArray(keypoints) ? keypoints.slice(0, 3) : keypoints,
        frameIndex: this.frameIndex + 1,
        isValidFormat: Array.isArray(keypoints) && keypoints.length === 194
      });
      
      this.frameIndex++;
      const extractionTime = performanceLogger.endTimer('keypointExtraction');
      performanceLogger.addMetric("keypointExtraction", extractionTime);

      // 서버 스키마에 맞춘 단일 프레임 데이터 반환
      const frameData = {
        keypoints: keypoints, // List[float] (194개 값)
        frameIndex: this.frameIndex,
        sessionId,
      };

      console.log(`📦 [FrameProcessor] 단일 프레임 전송 준비: 프레임 ${frameData.frameIndex}`);
      console.log('📊 [FrameProcessor] 전송 데이터 구조:', {
        keypointsType: Array.isArray(frameData.keypoints) ? 'Array' : typeof frameData.keypoints,
        keypointsLength: Array.isArray(frameData.keypoints) ? frameData.keypoints.length : 'N/A',
        dataStructure: 'List[float]', // 서버 기대 구조
        sampleValues: Array.isArray(frameData.keypoints) ? frameData.keypoints.slice(0, 5) : 'N/A'
      });

      return frameData;

        } catch (error) {
            console.error('❌ 키포인트 추출 실패:', error);
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    generateTestKeypoints() {
        const keypoints = new Array(194).fill(0.0);

        // 손이 감지된 것처럼 일부 값을 랜덤하게 설정
        for (let i = 0; i < 63; i += 3) {
            keypoints[i] = Math.random() * 0.5 + 0.25; // x 좌표
            keypoints[i + 1] = Math.random() * 0.5 + 0.25; // y 좌표  
            keypoints[i + 2] = Math.random() * 0.1; // z 좌표
        }

        console.log('🧪 테스트 키포인트 생성 완료');
        return keypoints;
    }

    // 🔧 수정: MediaPipe 처리 방식 개선
    processFrame(videoElement) {
        return new Promise((resolve, reject) => {
            console.log('🎬 [FrameProcessor.js] processFrame 시작', {
                videoElement: !!videoElement,
                videoWidth: videoElement?.videoWidth,
                videoHeight: videoElement?.videoHeight,
                hands: !!this.hands
            });
            
            // 표준화된 타임아웃 사용
            const timeout = setTimeout(() => {
                console.warn(`⏰ [FrameProcessor.js] MediaPipe 처리 타임아웃 (${MEDIAPIPE_CONFIG.PROCESSING_TIMEOUT}ms)`);
                this.pendingResolve = null;
                reject(new Error(`MediaPipe 처리 타임아웃 (${MEDIAPIPE_CONFIG.PROCESSING_TIMEOUT}ms)`));
            }, MEDIAPIPE_CONFIG.PROCESSING_TIMEOUT);

            try {
                // 🔧 수정: 결과 대기 설정
                this.pendingResolve = (results) => {
                    clearTimeout(timeout);
                    resolve(results);
                };

                // MediaPipe에 이미지 전송
                this.hands.send({ image: videoElement });

            } catch (error) {
                clearTimeout(timeout);
                this.pendingResolve = null;
                reject(error);
            }
        });
    }

    isReady() {
        const readyState = this.ready && (this.hands !== null || !window.Hands) && !this.isPaused;
        console.log('🔍 [FrameProcessor] isReady 호출됨:', {
            ready: this.ready,
            hands: !!this.hands,
            isPaused: this.isPaused,
            finalState: readyState
        });
        return readyState;
    }

  resetFrameIndex() {
    this.frameIndex = 0;
    // 버퍼는 더 이상 사용하지 않음
  }

  getCurrentBufferSize() {
    return 0; // 단일 프레임 전송이므로 사용하지 않음
  }

    // 스마트 일시정지: 리소스 보존
    pause(reason = 'unknown') {
        console.log(`⏸️ [FrameProcessor] 일시정지: ${reason}`);
        this.isPaused = true;
        this.pauseReason = reason;
        this.pausedAt = Date.now();
        this.isProcessing = false;
    }
    
    // 스마트 재개: 즉시 복구
    resume() {
        console.log(`▶️ [FrameProcessor] 재개: 이전 ${this.pauseReason}`);
        this.isPaused = false;
        this.pauseReason = null;
        this.pausedAt = null;
        
        // 상태 검증 후 재개
        if (this.ready && this.hands) {
            console.log('✅ [FrameProcessor] 재개 완료 - 상태 정상');
            return true;
        } else {
            console.warn('⚠️ [FrameProcessor] 재개 시 상태 비정상:', {
                ready: this.ready,
                hands: !!this.hands
            });
            return false;
        }
    }
    
    // 일시정지 상태 확인
    isPausedState() {
        return {
            isPaused: this.isPaused,
            reason: this.pauseReason,
            duration: this.pausedAt ? Date.now() - this.pausedAt : 0
        };
    }

    // 완전 정리는 전용 메서드로 분리 (비상 시에만 사용)
    forceCleanup() {
        console.log('🧺 [FrameProcessor] 강제 정리 시작');
        try {
            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
                this.loadingTimeout = null;
            }

            if (this.hands) {
                this.hands.close();
                this.hands = null;
            }

            this.ready = false;
            this.isProcessing = false;
            this.frameBuffer = [];
            this.initPromise = null;
            this.lastResults = null;
            this.pendingResolve = null;
            
            // 일시정지 상태도 초기화
            this.isPaused = false;
            this.pauseReason = null;
            this.pausedAt = null;

            console.log('✅ [FrameProcessor] 강제 정리 완료');
        } catch (error) {
            console.error('❌ [FrameProcessor] 강제 정리 오류:', error);
        }
    }
    
    // 기본 cleanup은 일시정지로 변경
    cleanup() {
        this.pause('cleanup_requested');
    }
}
