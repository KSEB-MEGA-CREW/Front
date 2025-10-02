// src/services/FrameProcessor.js
import { performanceLogger } from "../utils/performanceUtils.js";
import { ERROR_CODES } from "../constants/videoConfig.js";

console.log('🔄 FrameProcessor.js 모듈 로드됨 - 프레임 배치 모드');

export class FrameProcessor {
    constructor() {
        console.log('🔧 FrameProcessor constructor - 프레임 배치 모드');
        
        // MediaPipe 관련 제거
        this.hands = null;
        this.ready = true; // MediaPipe 초기화 불필요
        
        // 배치 처리 관련 추가
        this.frameIndex = 0;
        this.frameBuffer = []; // 10개 프레임 저장
        this.batchSize = 10;
        this.isProcessing = false;
        this.initPromise = null;
        this.loadingTimeout = null;
        this.lastResults = null;
        this.pendingResolve = null;
        
        // 성능 최적화를 위한 Canvas 재사용
        this.canvas = null;
        this.ctx = null;
        
        // 스마트 일시정지 상태 추가
        this.isPaused = false;
        this.pauseReason = null;
        this.pausedAt = null;
        
        console.log('✅ FrameProcessor 생성 완료 - 배치 모드');
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
        throw new Error("브라우저 환경이 아닙니다");
      }

      // 2. Canvas 미리 생성 (성능 최적화)
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      
      // 3. 초기화 완료
      this.ready = true;
      this.initPromise = null;

      console.log('✅ FrameProcessor 초기화 완료 - Canvas 준비됨');
      return true;

    } catch (error) {
      console.error('❌ FrameProcessor 초기화 실패:', error);
      this.ready = false;
      this.initPromise = null;
      this.cleanup();
      throw error;
    }
  }

    // MediaPipe 관련 메서드 제거 - 더 이상 필요하지 않음

    async extractFrame(videoElement, sessionId) {
        console.log('📊 [FrameProcessor] 프레임 추출 시작', {
            ready: this.ready,
            sessionId,
            bufferSize: this.frameBuffer.length,
            frameIndex: this.frameIndex
        });

        if (!this.ready) {
            const error = {
                code: ERROR_CODES.MEDIAPIPE_INIT_FAILED,
                message: 'FrameProcessor가 초기화되지 않았습니다'
            };
            console.error('[FrameProcessor]', error);
            const err = new Error(error.message);
            err.code = error.code;
            throw err;
        }

        // 강화된 비디오 요소 검증
        if (!videoElement) {
            const error = {
                code: ERROR_CODES.VIDEO_ELEMENT_NOT_READY,
                message: '비디오 요소가 null입니다'
            };
            const err = new Error(error.message);
            err.code = error.code;
            throw err;
        }

        // readyState 확인 (최소 2 이상이어야 메타데이터 로드됨)
        if (videoElement.readyState < 2) {
            const error = {
                code: ERROR_CODES.VIDEO_ELEMENT_NOT_READY,
                message: `비디오가 아직 준비되지 않았습니다. readyState: ${videoElement.readyState}`
            };
            const err = new Error(error.message);
            err.code = error.code;
            throw err;
        }

        // 비디오 크기 검증
        if (!videoElement.videoWidth || !videoElement.videoHeight || 
            videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
            const error = {
                code: ERROR_CODES.VIDEO_ELEMENT_NOT_READY,
                message: `비디오 크기가 유효하지 않습니다: ${videoElement.videoWidth}x${videoElement.videoHeight}`
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
            performanceLogger.startTimer("frameExtraction");

            // Canvas와 Context 유효성 재확인
            if (!this.canvas || !this.ctx) {
                throw new Error('Canvas 또는 Context가 유효하지 않습니다');
            }

            // Canvas 크기 설정 (안전하게)
            if (this.canvas.width !== videoElement.videoWidth || this.canvas.height !== videoElement.videoHeight) {
                this.canvas.width = videoElement.videoWidth;
                this.canvas.height = videoElement.videoHeight;
                console.log(`📐 [FrameProcessor] Canvas 크기 설정: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
            }

            // 안전한 프레임 추출 (추가 검증 후 drawImage 호출)
            if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0 && videoElement.readyState >= 2) {
                this.ctx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
                const imageData = this.canvas.toDataURL('image/jpeg', 0.8);

                // 생성된 이미지 데이터 검증
                if (!imageData || imageData.length < 100) {
                    throw new Error('유효하지 않은 이미지 데이터가 생성되었습니다');
                }

                // 프레임 데이터 생성
                const frameData = {
                    imageData: imageData,
                    frameIndex: ++this.frameIndex,
                    timestamp: Date.now(),
                    dimensions: {
                        width: videoElement.videoWidth,
                        height: videoElement.videoHeight
                    }
                };

                // 버퍼에 추가
                this.frameBuffer.push(frameData);
                
                console.log(`📦 [FrameProcessor] 프레임 버퍼링: ${this.frameBuffer.length}/${this.batchSize}`, {
                    currentFrame: frameData.frameIndex,
                    bufferSize: this.frameBuffer.length
                });

                // 10개 모이면 배치 반환
                if (this.frameBuffer.length >= this.batchSize) {
                    const batchData = {
                        type: 'frame_batch',
                        sessionId: sessionId,
                        batchIndex: Math.floor(this.frameIndex / this.batchSize),
                        frames: [...this.frameBuffer], // 복사본 생성
                        frameCount: this.frameBuffer.length,
                        timestamp: Date.now()
                    };

                    // 버퍼 클리어
                    this.frameBuffer = [];
                    
                    const extractionTime = performanceLogger.endTimer('frameExtraction');
                    performanceLogger.addMetric("frameExtraction", extractionTime);

                    console.log(`📤 [FrameProcessor] 배치 전송 준비 완료:`, {
                        batchIndex: batchData.batchIndex,
                        frameCount: batchData.frameCount,
                        firstFrame: batchData.frames[0]?.frameIndex,
                        lastFrame: batchData.frames[batchData.frameCount - 1]?.frameIndex
                    });

                    return batchData;
                }

                // 10개 미만이면 null 반환 (아직 전송하지 않음)
                return null;
            } else {
                throw new Error('비디오 요소가 렌더링 가능한 상태가 아닙니다');
            }

        } catch (error) {
            console.error('❌ 프레임 추출 실패:', error);
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    // 강제 배치 전송 (세션 종료 시)
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
            console.log(`📤 [FrameProcessor] 최종 배치 전송:`, {
                frameCount: batchData.frameCount,
                isFinal: true
            });

            return batchData;
        }
        return null;
    }

    isReady() {
        const readyState = this.ready && !this.isPaused;
        console.log('🔍 [FrameProcessor] isReady 호출됨:', {
            ready: this.ready,
            isPaused: this.isPaused,
            finalState: readyState
        });
        return readyState;
    }

    resetFrameIndex() {
        this.frameIndex = 0;
        this.frameBuffer = []; // 버퍼도 클리어
    }

    getCurrentBufferSize() {
        return this.frameBuffer.length;
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

            if (this.canvas) {
                this.canvas = null;
                this.ctx = null;
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
        this.frameBuffer = [];
        if (this.canvas) {
            this.canvas = null;
            this.ctx = null;
        }
        console.log('🧹 [FrameProcessor] 정리 완료');
    }
}
