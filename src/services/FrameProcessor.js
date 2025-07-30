import { VIDEO_CONFIG } from "../constants/videoConfig";

// frame 처리/변환
export class FrameProcessor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = VIDEO_CONFIG.CANVAS_WIDTH;
        this.canvas.height = VIDEO_CONFIG.CANVAS_HEIGHT;
        this.frameIndex = 0;
    }

    // 비디오에서 프레임 추출 <- 백엔드 FrameRequest dto 구조에 맞춰서 작성
    // userId는 API 훅에서 처리
    extractFrame(videoElement, sessionId) {
        if (!videoElement || videoElement.videoWidth === 0) {
            throw new Error('Video element not ready');
        }

        // Canvas에 현재 프레임 그리기
        this.ctx.drawImage(
            videoElement,
            0, 0,
            this.canvas.width,
            this.canvas.height
        );

        // Base64로 변환 (data:image/jpeg;base64, 접두사 제거)
        const dataURL = this.canvas.toDataURL('image/jpeg', VIDEO_CONFIG.QUALITY);
        const frameData = dataURL.split(',')[1]; // Base64 부분만 추출

        // 파일 크기 체크 => 필요 시 추가
        // const sizeInBytes = this.getBase64Size(frameData);
        // if (sizeInBytes > VIDEO_CONFIG.MAX_FILE_SIZE) {
        //     console.warn(`Frame size too large: ${sizeInBytes} bytes`);
        // }

        const frameRequest = {
            frameData: frameData,
            timestamp: Date.now(),
            sessionId: sessionId,
            frameIndex: this.frameIndex++
        };

        return frameRequest;
    }

    // Base64 크기 계산
    // getBase64Size(base64String) {
    //     return Math.round((base64String.length * 3) / 4);
    // }

    // frame index reset
    resetFrameIndex() {
        this.frameIndex = 0;
    }

    // 메모리 정리
    cleanup() {
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.ctx = null;
        }
    }
}
