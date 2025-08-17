import { MediaPipeService } from './MediaPipeService';
import { VIDEO_CONFIG } from '../constants/videoConfig';
import { keypointUtils } from '../utils/keypointUtils';
import { performanceLogger } from '../utils/performanceUtils';

export class FrameProcessor {
    constructor() {
        this.mediaPipe = new MediaPipeService();
        this.frameIndex = 0;
        this.keyPointBuffer = [];
        this.isInitialized = false;
        this.lastProcessTime = 0;
    }

    async initialize() {
        try {
            performanceLogger.startTimer('frame_processor_init');

            await this.mediaPipe.initialize();
            this.isInitialized = true;

            const initTime = performanceLogger.endTimer('frame_processor_init');
            console.log(`✅ FrameProcessor initialized in ${Math.round(initTime)}ms`);

            return true;
        } catch (error) {
            console.error('❌ FrameProcessor initialization failed:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    async extractKeypoints(videoElement, sessionId) {
        if (!this.isInitialized) {
            throw new Error('FrameProcessor not initialized');
        }

        if (!videoElement || videoElement.videoWidth === 0) {
            throw new Error('Video element not ready');
        }

        // 프레임 레이트 제어
        const now = performance.now();
        if (now - this.lastProcessTime < VIDEO_CONFIG.FRAME_INTERVAL) {
            return null; // 아직 처리할 시간이 아님
        }
        this.lastProcessTime = now;

        try {
            performanceLogger.startTimer('total_frame_processing');

            // MediaPipe로 키포인트 추출
            const keypoints = await this.mediaPipe.extractKeypoints(videoElement);

            if (!keypoints) {
                return null; // MediaPipe 처리 스킵됨
            }

            // 키포인트 유효성 검증
            if (!keypointUtils.validateKeypoints(keypoints)) {
                console.warn('Invalid keypoints detected, skipping frame');
                return null;
            }

            // 버퍼에 추가
            this.keyPointBuffer.push(keypoints);
            this.frameIndex++;

            console.log(`📊 Frame ${this.frameIndex}: Buffer size ${this.keyPointBuffer.length}/${VIDEO_CONFIG.KEYPOINT_BUFFER_SIZE}`);

            // 10프레임 수집 완료 확인
            if (this.keyPointBuffer.length >= VIDEO_CONFIG.KEYPOINT_BUFFER_SIZE) {
                // 시퀀스 유효성 검증
                if (!keypointUtils.validateSequence(this.keyPointBuffer)) {
                    console.warn('Invalid keypoint sequence, clearing buffer');
                    this.keyPointBuffer = [];
                    return null;
                }

                const batchKeypoints = [...this.keyPointBuffer];
                this.keyPointBuffer = []; // 버퍼 초기화

                const totalTime = performanceLogger.endTimer('total_frame_processing');
                performanceLogger.addMetric('totalProcessing', totalTime, {
                    frameIndex: this.frameIndex,
                    batchSize: batchKeypoints.length
                });

                console.log(`🎯 Batch ready: ${batchKeypoints.length} frames collected`);

                return {
                    keypoints: batchKeypoints,
                    frameIndex: this.frameIndex,
                    sessionId,
                    timestamp: Date.now(),
                    batchSize: batchKeypoints.length
                };
            }

            performanceLogger.endTimer('total_frame_processing');
            return null; // 아직 배치 크기 미달

        } catch (error) {
            performanceLogger.endTimer('total_frame_processing');
            console.error('Frame processing error:', error);
            throw error;
        }
    }

    getCurrentBufferSize() {
        return this.keyPointBuffer.length;
    }

    getFrameIndex() {
        return this.frameIndex;
    }

    resetFrameIndex() {
        this.frameIndex = 0;
        this.keyPointBuffer = [];
        this.lastProcessTime = 0;
        console.log('🔄 Frame processor reset');
    }

    isReady() {
        return this.isInitialized && this.mediaPipe.isReady();
    }

    cleanup() {
        try {
            this.mediaPipe.cleanup();
            this.keyPointBuffer = [];
            this.frameIndex = 0;
            this.isInitialized = false;
            this.lastProcessTime = 0;

            console.log('🧹 FrameProcessor cleaned up');
        } catch (error) {
            console.error('FrameProcessor cleanup error:', error);
        }
    }
}