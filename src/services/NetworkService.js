import { API_CONFIG } from "../constants/videoConfig";

/**
 * 백엔드 통신 제거
 * HTTP 통신 전용 
 * 실시간 수어 인식 => WebSocketService 사용
 */
export class NetworkService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.controller = new AbortController();
    }

    /**
     * JWT 토큰 유효성 검증
     * @param {string} token - JWT 토큰
     * @returns {Promise<boolean>} 토큰 유효성
     */
    async verifyToken(token) {
        try {
            const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.VERIFY_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token }),
                signal: this.controller.signal
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            return data.valid === true;

        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }

    /**
    * 서버 상태 확인
    * @returns {Promise<boolean>} 서버 상태
    */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.HEALTH_CHECK}`, {
                signal: this.controller.signal
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * 요청 중단
     */
    abort() {
        this.controller.abort();
        this.controller = new AbortController();
        console.log('🛑 HTTP 요청 중단');
    }

    // 텍스트를 수어로 변환 요청
    async convertTextToSign(translationRequest) {
        const MAX_RETRIES = API_CONFIG.MAX_RETRIES || 3;

        console.log(`텍스트-수어 변환 요청: "${translationRequest.text}"`);

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const token = this.getAuthToken();
                if (!token) throw new Error('인증 토큰이 없습니다.');

                const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.TEXT_TO_SIGN}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(translationRequest),
                    signal: this.controller.signal
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('텍스트-수어 변환 응답:', result);
                    return result;
                }

                // 실패 시 에러 처리
                const errorText = await response.text();
                const error = new Error(`HTTP ${response.status}: ${errorText}`);
                error.status = response.status;
                throw error;
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('텍스트-수어 변환 요청 취소됨');
                    return null;
                }

                console.error(`텍스트-수어 변환 시도 ${attempt} 실패:`, error.message);

                // 마지막 시도이거나 재시도 불가능한 에러
                if (attempt === MAX_RETRIES || !this.shouldRetry(error)) {
                    const finalError = this.createFinalError(error, 'translation');
                    throw finalError;
                }

                console.log(`텍스트-수어 변환 재시도 (${attempt}/${MAX_RETRIES})`);
                const delayTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                await this.delay(delayTime);
            }
        }
    }
}