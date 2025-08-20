// src/services/FrameProcessor.js
import { keypointUtils } from "../utils/keypointUtils.js";
import { performanceLogger } from "../utils/performanceUtils.js";
import { MEDIAPIPE_CONFIG } from "../constants/videoConfig.js";

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
        const maxWaitTime = 5000;
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
        console.log('📊 키포인트 추출 시작');

        if (!this.ready) {
            throw new Error('❌ FrameProcessor가 초기화되지 않았습니다');
        }

    if (!videoElement || videoElement.videoWidth === 0) {
      throw new Error(" 비디오 요소가 준비되지 않았습니다");
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
                console.log('🤲 실제 MediaPipe로 키포인트 추출');
                try {
                    const results = await this.processFrame(videoElement);
                    keypoints = keypointUtils.normalizeKeypoints(results || {});
                } catch (mpError) {
                    console.warn('⚠️ MediaPipe 처리 실패, 테스트 모드로 전환:', mpError.message);
                    keypoints = this.generateTestKeypoints();
                }
            } else {
                console.log('🧪 테스트 모드: 가짜 키포인트 생성');
                keypoints = this.generateTestKeypoints();
            }

            // 키포인트 데이터 검증
            if (!Array.isArray(keypoints) || keypoints.length !== 194) {
                console.warn('⚠️ 잘못된 키포인트 형식, 기본값으로 대체');
                keypoints = new Array(194).fill(0.0);
            }

      // 프레임 버퍼에 추가
      this.frameBuffer.push(keypoints);
      this.frameIndex++;

            const extractionTime = performanceLogger.endTimer('keypointExtraction');

            console.log(`📊 버퍼 상태: ${this.frameBuffer.length}/10 프레임`);

      // 10프레임 배치 완성 시 반환
      if (this.frameBuffer.length >= 10) {
        const batchData = {
          keypoints: [...this.frameBuffer],
          frameIndex: this.frameIndex,
          batchSize: this.frameBuffer.length,
          sessionId,
        };

        this.frameBuffer = [];
        performanceLogger.addMetric("keypointExtraction", extractionTime);

                console.log(`📦 배치 완성: ${batchData.batchSize}프레임`);

                // 배치 데이터 검증 로그
                console.log('📊 배치 데이터 검증:', {
                    totalFrames: batchData.keypoints.length,
                    firstFrameLength: batchData.keypoints[0]?.length,
                    allFramesSameLength: batchData.keypoints.every(frame => frame.length === 194),
                    hasNonZeroValues: batchData.keypoints.some(frame => frame.some(val => val !== 0))
                });

                return batchData;
            }

            return null;

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
            // 🔧 수정: 타임아웃 시간 증가 (100ms → 500ms)
            const timeout = setTimeout(() => {
                console.warn('⏰ MediaPipe 처리 타임아웃 (500ms)');
                this.pendingResolve = null;
                reject(new Error('MediaPipe 처리 타임아웃 (500ms)'));
            }, 500);

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
        const readyState = this.ready && (this.hands !== null || !window.Hands);
        console.log('🔍 isReady 호출됨, 상태:', readyState);
        return readyState;
    }

  resetFrameIndex() {
    this.frameIndex = 0;
    this.frameBuffer = [];
  }

  getCurrentBufferSize() {
    return this.frameBuffer.length;
  }

  cleanup() {
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
            this.pendingResolve = null; // 🔧 추가: pendingResolve 초기화

            console.log('✅ FrameProcessor 정리 완료');
        } catch (error) {
            console.error('❌ FrameProcessor 정리 오류:', error);
        }
    }
}
