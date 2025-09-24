// 프레임 추출 관련 설정 상수

console.log('📊 [videoConfig.js] 설정 파일 로드됨');

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

console.log('📊 [videoConfig.js] VIDEO_CONFIG:', VIDEO_CONFIG);

// 환경변수 검증 함수
const validateEnvVariables = () => {
    const requiredVars = {
        VITE_API_URL: import.meta.env.VITE_API_URL,
        VITE_WS_URL: import.meta.env.VITE_WS_URL
    };

    const missing = Object.entries(requiredVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        console.warn(`⚠️ 환경변수 누락: ${missing.join(', ')}`);
        console.warn('기본값을 사용하지만 프로덕션에서는 환경변수를 설정하세요.');
    }

    return {
        baseUrl: requiredVars.VITE_API_URL || 'http://localhost:8080',
        websocketUrl: requiredVars.VITE_WS_URL || 'ws://localhost:8000'
    };
};

const { baseUrl, websocketUrl } = validateEnvVariables();

export const API_CONFIG = {
    BASE_URL: baseUrl,
    WEBSOCKET_URL: websocketUrl + '/ws', // WebSocket 엔드포인트 추가

    ENDPOINTS: {
        VERIFY_TOKEN: '/api/auth/verify-token',
        HEALTH_CHECK: '/api/auth/health'
    },

    // WebSocket 관련 설정
    MAX_RECONNECT_ATTEMPTS: 3,
    RECONNECT_INTERVAL: 1000, // 1초
    CONNECTION_TIMEOUT: 10000, // 10초

    // 환경별 설정 확인
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,

    // 연결 상태 검증
    validateConnection: () => {
        return {
            baseUrl: baseUrl.startsWith('http'),
            websocketUrl: websocketUrl.startsWith('ws'),
            hasValidUrls: baseUrl.startsWith('http') && websocketUrl.startsWith('ws')
        };
    }
};

export const MEDIAPIPE_CONFIG = {
    MAX_NUM_HANDS: 2,
    MODEL_COMPLEXITY: 1,
    MIN_DETECTION_CONFIDENCE: 0.5,
    MIN_TRACKING_CONFIDENCE: 0.3,
    KEYPOINT_DIMENSIONS: 194, // 손 키포인트 차원
    SINGLE_HAND_LANDMARKS: 21,
    COORDINATES_PER_LANDMARK: 3, // x, y, z

    // 타임아웃 설정 표준화
    PROCESSING_TIMEOUT: 500, // MediaPipe 처리 타임아웃 (ms)
    INITIALIZATION_TIMEOUT: 10000, // 초기화 타임아웃 (ms)
    KEYPOINT_EXTRACTION_TIMEOUT: 500 // 키포인트 추출 타임아웃 (ms)
};

console.log('📊 [videoConfig.js] MEDIAPIPE_CONFIG:', MEDIAPIPE_CONFIG);

// AI 서버 메시지 타입 정의 (서버와 동일)
export const MESSAGE_TYPES = {
    // client => server
    KEYPOINTS: 'keypoints',
    TRANSLATION_START: 'start_translation',
    TRANSLATION_END: 'stop_translation',
    PING: 'ping',

    // server => client  
    PREDICTION_RESULT: 'prediction_result',
    TRANSLATION_RESULT: 'translation_result',
    TRANSLATION_STATUS: 'translation_status',
    ERROR: 'error',
    PONG: 'pong'
};

// 에러 코드 정의 (서버와 일치)
export const ERROR_CODES = {
    // 인증 에러
    AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
    AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
    AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
    AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',

    // MediaPipe 에러
    MEDIAPIPE_INIT_FAILED: 'MEDIAPIPE_INIT_FAILED',
    MEDIAPIPE_PROCESSING_TIMEOUT: 'MEDIAPIPE_PROCESSING_TIMEOUT',
    KEYPOINT_EXTRACTION_FAILED: 'KEYPOINT_EXTRACTION_FAILED',

    // WebSocket 에러
    WEBSOCKET_CONNECTION_FAILED: 'WEBSOCKET_CONNECTION_FAILED',
    WEBSOCKET_SEND_FAILED: 'WEBSOCKET_SEND_FAILED',
    WEBSOCKET_RECONNECT_FAILED: 'WEBSOCKET_RECONNECT_FAILED',

    // 일반 에러
    CAMERA_ACCESS_DENIED: 'CAMERA_ACCESS_DENIED',
    VIDEO_ELEMENT_NOT_READY: 'VIDEO_ELEMENT_NOT_READY',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

console.log('📊 [videoConfig.js] MESSAGE_TYPES:', MESSAGE_TYPES);
console.log('📊 [videoConfig.js] ERROR_CODES:', ERROR_CODES);