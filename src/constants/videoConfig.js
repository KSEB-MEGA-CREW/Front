// 프레임 추출 관련 설정 상수

export const VIDEO_CONFIG = {
    FRAME_RATE: 10, // 10fps 고정
    FRAME_INTERVAL: 100, // 100ms
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 480,
    QUALITY: 0.8, // JPEG 품질
    MAX_FILE_SIZE: 50 * 1024, // 50KB
    MAX_RETRIES: 3,
    KEYPOINT_BUFFER_SIZE: 10 // 10 frame buffer
};

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    WEBSOCKET_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws', // proxy 제거 -> 웹소켓 연결로 대체
    ENDPOINTS: {
        VERIFY_TOKEN: '/api/auth/verify-token'
    }
};

export const MEDIAPIPE_CONFIG = {
    MAX_NUM_HANDS: 2,
    MODEL_COMPLEXITY: 1,
    MIN_DETECTION_CONFIDENCE: 0.7,
    MIN_TRACKING_CONFIDENCE: 0.5,
    KEYPOINT_DIMENSIONS: 194, // 손 키포인트 차원
    SINGLE_HAND_LANDMARKS: 21,
    COORDINATES_PER_LANDMARK: 3 // x, y, z
};