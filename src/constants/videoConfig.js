// 프레임 추출 관련 설정 상수

export const VIDEO_CONFIG = {
    FRAME_RATE: 10,
    FRAME_INTERVAL: 100, // 100ms = 10fps
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 480,
    QUALITY: 0.8
};

// API 설정
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
    ENDPOINTS: {
        VERIFY_TOKEN: '/api/auth/verify-token',
        HEALTH_CHECK: '/api/auth/health',
        SIGNUP: '/api/auth/signup',
        LOGIN: '/api/auth/login'
    }
};

// export const API_CONFIG = {
//     BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
//     WEBSOCKET_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',

//     ENDPOINTS: {
//         VERIFY_TOKEN: '/api/auth/verify-token',
//         HEALTH_CHECK: '/api/auth/health'
//     }
// };

export const MEDIAPIPE_CONFIG = {
    MAX_NUM_HANDS: 2,
    MODEL_COMPLEXITY: 1,
    MIN_DETECTION_CONFIDENCE: 0.7,
    MIN_TRACKING_CONFIDENCE: 0.5
};

// AI 서버 websocket 메시지 타입 정의
export const MESSAGE_TYPES = {
    // Client → Server
    KEYPOINTS: "keypoints",
    TRANSLATION_START: "translation_start",
    TRANSLATION_END: "translation_end",
    PING: "ping",

    // Server → Client
    PREDICTION_RESULT: "prediction_result",
    TRANSLATION_RESULT: "translation_result",
    TRANSLATION_STATUS: "translation_status",
    ERROR: "error",
    PONG: "pong"
};