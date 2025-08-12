// 프레임 추출 관련 설정 상수

export const VIDEO_CONFIG = {
    FRAME_RATE: 10, // 10fps 고정
    FRAME_INTERVAL: 100, // 100ms
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 480,
    QUALITY: 0.8, // JPEG 품질
    MAX_FILE_SIZE: 50 * 1024, // 50KB
    MAX_RETRIES: 3
};

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    ENDPOINTS: {
        // 웹캠 -> 텍스트
        ANALYZE_FRAME: '/api/signlanguage/analyze',
        HEALTH_CHECK: '/api/signlanguage/health',

        // 텍스트 -> 수어 애니메이션
        TEXT_TO_SIGN: '/api/translation/text-to-sign',
        TRANSLATION_HEALTH: '/api/translation/health'
    }
};