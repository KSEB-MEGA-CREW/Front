// 단순화된 FrameProcessor - 핵심 기능만 유지

console.log('🔄 FrameProcessor.js 모듈 로드됨 - 단순화된 버전');

export class FrameProcessor {
    constructor() {
        console.log('🔧 FrameProcessor 생성 - 단순화된 버전');
        
        // 핵심 기능만 유지
        this.canvas = null;
        this.ctx = null;
        this.frameBuffer = [];
        this.batchSize = 10;
        this.frameIndex = 0;
        this.ready = false;
        
        console.log('✅ FrameProcessor 생성 완료');
    }

    async initialize() {
        try {
            // 브라우저 환경 확인
            if (typeof window === "undefined") {
                throw new Error("브라우저 환경이 아닙니다");
            }

            // Canvas 생성
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            
            if (!this.ctx) {
                throw new Error('Canvas 2D Context 생성에 실패했습니다');
            }
            
            this.canvas.style.display = 'none';
            this.ready = true;
            
            console.log('✅ FrameProcessor 초기화 완료');
            return true;

        } catch (error) {
            console.error('❌ FrameProcessor 초기화 실패:', error);
            this.ready = false;
            throw error;
        }
    }

    async extractFrame(videoElement, sessionId) {
        // 기본 검증만 - 복잡한 자동 복구 제거
        if (!this.ready || !this.canvas || !this.ctx) {
            throw new Error('FrameProcessor가 초기화되지 않았습니다');
        }

        if (!videoElement || videoElement.readyState < 2) {
            return null; // 조용히 건너뛰기
        }

        if (!videoElement.videoWidth || !videoElement.videoHeight) {
            return null; // 조용히 건너뛰기
        }

        try {
            // Canvas 크기 조정
            if (this.canvas.width !== videoElement.videoWidth) {
                this.canvas.width = videoElement.videoWidth;
                this.canvas.height = videoElement.videoHeight;
            }

            // 프레임 추출
            this.ctx.drawImage(videoElement, 0, 0);
            const imageData = this.canvas.toDataURL('image/jpeg', 0.8);

            // 배치 처리
            const frameData = {
                imageData: imageData,
                frameIndex: ++this.frameIndex,
                timestamp: Date.now(),
                dimensions: {
                    width: videoElement.videoWidth,
                    height: videoElement.videoHeight
                }
            };

            this.frameBuffer.push(frameData);

            // 10개 모이면 배치 반환
            if (this.frameBuffer.length >= this.batchSize) {
                const batchData = {
                    type: 'frame_batch',
                    sessionId: sessionId,
                    batchIndex: Math.floor(this.frameIndex / this.batchSize),
                    frames: [...this.frameBuffer],
                    frameCount: this.frameBuffer.length,
                    timestamp: Date.now()
                };

                this.frameBuffer = [];
                console.log(`📤 배치 전송: ${batchData.frameCount}개 프레임`);
                return batchData;
            }

            return null;

        } catch (error) {
            console.error('❌ 프레임 추출 실패:', error);
            throw error;
        }
    }

    // 세션 종료 시 남은 프레임 전송
    flushBuffer(sessionId) {
        if (this.frameBuffer.length > 0) {
            const batchData = {
                type: 'frame_batch_final',
                sessionId: sessionId,
                batchIndex: Math.floor(this.frameIndex / this.batchSize),
                frames: [...this.frameBuffer],
                frameCount: this.frameBuffer.length,
                timestamp: Date.now(),
                isFinal: true
            };

            this.frameBuffer = [];
            console.log(`📤 최종 배치 전송: ${batchData.frameCount}개 프레임`);
            return batchData;
        }
        return null;
    }

    isReady() {
        return this.ready;
    }

    resetFrameIndex() {
        this.frameIndex = 0;
        this.frameBuffer = [];
    }

    getCurrentBufferSize() {
        return this.frameBuffer.length;
    }

    // 단순한 정리
    cleanup() {
        console.log('🧹 FrameProcessor 정리 시작');
        
        this.frameBuffer = [];
        this.frameIndex = 0;
        
        if (this.canvas) {
            this.canvas.width = 0;
            this.canvas.height = 0;
            this.canvas = null;
            this.ctx = null;
        }
        
        this.ready = false;
        console.log('✅ FrameProcessor 정리 완료');
    }
}