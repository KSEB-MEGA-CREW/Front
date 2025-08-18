// 키포인트 추출
import { keypointUtils } from "../utils/keypointUtils";
import { MEDIAPIPE_CONFIG } from '../constants/videoConfig';
import { performanceLogger } from "../utils/performanceUtils";

export class MediaPipeService {
    constructor() {
        this.hands = null;
        this.isInitialized = false;
        this.IsProcessing = false;
        this.initPromise = null;
    }

    async initialize() {
        // 중복 초기화 방지
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._initialize();
        return this.initPromise;
    }

    async _initialize() {
        try {
            performanceLogger.startTimer('mediapipe_init');

            // MediaPipe Hands 라이브러리 로드 확인
            if (typeof window === 'undefined' || !window.Hands) {
                throw new Error('MediaPipe Hands library not loaded');
            }

            // Hands 인스턴스 생성
            this.hands = new window.Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            // MediaPipe 설정
            this.hands.setOptions({
                maxNumHands: MEDIAPIPE_CONFIG.MAX_NUM_HANDS,
                modelComplexity: MEDIAPIPE_CONFIG.MODEL_COMPLEXITY,
                minDetectionConfidence: MEDIAPIPE_CONFIG.MIN_DETECTION_CONFIDENCE,
                minTrackingConfidence: MEDIAPIPE_CONFIG.MIN_TRACKING_CONFIDENCE
            });

            this.isInitialized = true;

            const initTime = performanceLogger.endTimer('mediapipe_init');
            performanceLogger.addMetric('mediapipeInit', initTime);

            console.log('✅ MediaPipe Hands initialized successfully');
            return true;

        } catch (error) {
            console.error('❌ MediaPipe initialization failed:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    async extractKeypoints(videoElement) {
        if (!this.isInitialized || !this.hands) {
            throw new Error('MediaPipe not initialized');
        }

        if (this.isProcessing) {
            // 이전 처리가 완료되지 않은 경우 스킵
            return null;
        }

        this.isProcessing = true;
        performanceLogger.startTimer('keypoint_extraction');

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.isProcessing = false;
                reject(new Error('MediaPipe processing timeout'));
            }, 50); // 50ms 타임아웃

            this.hands.onResults((results) => {
                try {
                    clearTimeout(timeout);

                    const keypoints = keypointUtils.normalizeKeypoints(results);

                    const extractionTime = performanceLogger.endTimer('keypoint_extraction');
                    performanceLogger.addMetric('keypointExtraction', extractionTime);

                    this.isProcessing = false;
                    resolve(keypoints);

                } catch (error) {
                    this.isProcessing = false;
                    reject(error);
                }
            });

            // 비디오 프레임을 MediaPipe로 전송
            try {
                this.hands.send({ image: videoElement });
            } catch (error) {
                clearTimeout(timeout);
                this.isProcessing = false;
                reject(error);
            }
        });
    }

    isReady() {
        return this.isInitialized && this.hands !== null;
    }

    cleanup() {
        try {
            if (this.hands) {
                this.hands.close();
                this.hands = null;
            }
            this.isInitialized = false;
            this.isProcessing = false;
            this.initPromise = null;

            console.log('MediaPipe cleaned up');
        } catch (error) {
            console.error('MediaPipe cleanup error:', error);
        }
    }
}