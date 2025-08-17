// src/services/FrameProcessor.js
import { keypointUtils } from "../utils/keypointUtils.js";
import { performanceLogger } from "../utils/performanceUtils.js";
import { MEDIAPIPE_CONFIG } from "../constants/videoConfig.js";
console.log('🔄 FrameProcessor.js 모듈 로드됨');

export class FrameProcessor {
    constructor() {
        this.hands = null;
        this.isReady = false;
        this.frameIndex = 0;
        this.frameBuffer = [];
        this.isProcessing = false;
        this.initPromise = null;
        this.loadingTimeout = null;
    }

    async initialize() {
        console.log('🔄 FrameProcessor 초기화 시작...');

        if (this.initPromise) {
            console.log('⏳ 이미 초기화 중...');
            return this.initPromise;
        }

        this.initPromise = this._initialize();
        return this.initPromise;
    }

    async _initialize() {
        try {
            // 1. 브라우저 환경 확인
            if (typeof window === 'undefined') {
                throw new Error('❌ 브라우저 환경이 아닙니다');
            }

            // 2. MediaPipe 라이브러리 대기 (최대 5초)
            await this.waitForMediaPipe();

            // 3. Hands 인스턴스 생성
            console.log('🤲 MediaPipe Hands 인스턴스 생성 중...');
            this.hands = new window.Hands({
                locateFile: (file) => {
                    const url = `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    console.log(`📁 MediaPipe 파일 로드: ${url}`);
                    return url;
                }
            });

            // 4. 설정 적용
            this.hands.setOptions({
                maxNumHands: MEDIAPIPE_CONFIG.MAX_NUM_HANDS,
                modelComplexity: MEDIAPIPE_CONFIG.MODEL_COMPLEXITY,
                minDetectionConfidence: MEDIAPIPE_CONFIG.MIN_DETECTION_CONFIDENCE,
                minTrackingConfidence: MEDIAPIPE_CONFIG.MIN_TRACKING_CONFIDENCE
            });

            // 5. 초기화 완료
            this.isReady = true;
            this.initPromise = null;

            console.log('✅ FrameProcessor 초기화 완료');
            return true;

        } catch (error) {
            console.error('❌ FrameProcessor 초기화 실패:', error);
            this.isReady = false;
            this.initPromise = null;

            // 초기화 실패 시 정리
            this.cleanup();
            throw error;
        }
    }

    // MediaPipe 라이브러리 로드 대기
    async waitForMediaPipe() {
        const maxWaitTime = 5000; // 5초
        const checkInterval = 100; // 100ms마다 확인
        let waitTime = 0;

        return new Promise((resolve, reject) => {
            const checkMediaPipe = () => {
                if (window.Hands) {
                    console.log('✅ MediaPipe Hands 로드 완료');
                    resolve();
                    return;
                }

                waitTime += checkInterval;
                if (waitTime >= maxWaitTime) {
                    reject(new Error('❌ MediaPipe 라이브러리 로드 타임아웃 (5초)'));
                    return;
                }

                console.log(`⏳ MediaPipe 로드 대기 중... (${waitTime}ms)`);
                setTimeout(checkMediaPipe, checkInterval);
            };

            checkMediaPipe();
        });
    }

    async extractKeypoints(videoElement, sessionId) {
        if (!this.isReady || !this.hands) {
            throw new Error('❌ FrameProcessor가 초기화되지 않았습니다');
        }

        if (!videoElement || videoElement.videoWidth === 0) {
            throw new Error('❌ 비디오 요소가 준비되지 않았습니다');
        }

        if (this.isProcessing) {
            console.log('⏭️ 이전 프레임 처리 중... 스킵');
            return null;
        }

        try {
            this.isProcessing = true;
            performanceLogger.startTimer('keypointExtraction');

            // MediaPipe 처리
            const results = await this.processFrame(videoElement);

            // 키포인트 추출
            const keypoints = keypointUtils.normalizeKeypoints(results || {});

            // 프레임 버퍼에 추가
            this.frameBuffer.push(keypoints);
            this.frameIndex++;

            const extractionTime = performanceLogger.endTimer('keypointExtraction');

            // 10프레임 배치 완성 시 반환
            if (this.frameBuffer.length >= 10) {
                const batchData = {
                    keypoints: [...this.frameBuffer],
                    frameIndex: this.frameIndex,
                    batchSize: this.frameBuffer.length,
                    sessionId
                };

                this.frameBuffer = [];
                performanceLogger.addMetric('keypointExtraction', extractionTime);

                console.log(`📦 배치 완성: ${batchData.batchSize}프레임`);
                return batchData;
            }

            console.log(`📊 버퍼 상태: ${this.frameBuffer.length}/10 프레임`);
            return null;

        } catch (error) {
            console.error('❌ 키포인트 추출 실패:', error);
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    processFrame(videoElement) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('MediaPipe 처리 타임아웃 (100ms)'));
            }, 100);

            // 결과 콜백 설정 (한 번만 실행)
            const handleResults = (results) => {
                clearTimeout(timeout);
                this.hands.onResults(() => { }); // 콜백 초기화
                resolve(results);
            };

            this.hands.onResults(handleResults);

            try {
                this.hands.send({ image: videoElement });
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    isReady() {
        return this.isReady && this.hands !== null;
    }

    resetFrameIndex() {
        this.frameIndex = 0;
        this.frameBuffer = [];
        console.log('🔄 프레임 인덱스 리셋');
    }

    getCurrentBufferSize() {
        return this.frameBuffer.length;
    }

    cleanup() {
        try {
            console.log('🧹 FrameProcessor 정리 시작...');

            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
                this.loadingTimeout = null;
            }

            if (this.hands) {
                this.hands.close();
                this.hands = null;
            }

            this.isReady = false;
            this.isProcessing = false;
            this.frameBuffer = [];
            this.initPromise = null;

            console.log('✅ FrameProcessor 정리 완료');
        } catch (error) {
            console.error('❌ FrameProcessor 정리 오류:', error);
        }
    }
}