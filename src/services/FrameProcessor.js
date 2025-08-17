// services/FrameProcessor.js
import { keypointUtils } from '../utils/keypointUtils';
import { performanceLogger } from '../utils/performanceUtils';

export class FrameProcessor {
    constructor() {
        this.hands = null;
        this.isReady = false;
        this.frameIndex = 0;
        this.frameBuffer = [];
    }

    async initialize() {
        try {
            // MediaPipe Hands 초기화
            if (typeof window !== 'undefined' && window.Hands) {
                this.hands = new window.Hands({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
                });

                this.hands.setOptions({
                    maxNumHands: 2,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.5
                });

                this.hands.onResults((results) => {
                    this.lastResults = results;
                });

                this.isReady = true;
                console.log('✅ FrameProcessor initialized');
            } else {
                throw new Error('MediaPipe Hands not loaded');
            }
        } catch (error) {
            console.error('FrameProcessor initialization failed:', error);
            throw error;
        }
    }

    async extractKeypoints(videoElement, sessionId) {
        if (!this.isReady || !videoElement) {
            throw new Error('FrameProcessor not ready or video element missing');
        }

        try {
            performanceLogger.startTimer('keypointExtraction');

            // MediaPipe 처리
            await this.hands.send({ image: videoElement });

            // 키포인트 추출
            const keypoints = keypointUtils.normalizeKeypoints(this.lastResults || {});

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

                // 버퍼 초기화
                this.frameBuffer = [];

                performanceLogger.addMetric('keypointExtraction', extractionTime);

                return batchData;
            }

            return null;

        } catch (error) {
            console.error('Keypoint extraction failed:', error);
            throw error;
        }
    }

    isReady() {
        return this.isReady;
    }

    resetFrameIndex() {
        this.frameIndex = 0;
        this.frameBuffer = [];
    }

    getCurrentBufferSize() {
        return this.frameBuffer.length;
    }

    cleanup() {
        if (this.hands) {
            this.hands.close();
            this.hands = null;
        }
        this.isReady = false;
        this.frameBuffer = [];
        console.log('🧹 FrameProcessor cleaned up');
    }
}