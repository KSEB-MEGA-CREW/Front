// src/services/NetworkService.js
import { API_CONFIG } from "../constants/videoConfig.js";

export class NetworkService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.controller = new AbortController();
    }

    /**
     * JWT 토큰 유효성 검증
     */
    async verifyToken(token) {
        try {
            console.log('🔍 Verifying token:', token.substring(0, 20) + '...');

            const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.VERIFY_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
                signal: this.controller.signal
            });

            if (!response.ok) {
                return false;
            }
            
            console.log('🔍 Token verification response status:', response.status);
            if (!response.ok) {
                console.warn('🔍 Token verification failed with status:', response.status);
                return false;
            }

            const data = await response.json();
            console.log('🔍 Token verification response:', data);

            return data.success && data.data && data.data.valid === true;

        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }

    /**
     * 인증 토큰 가져오기
     */
    getAuthToken() {
        return localStorage.getItem('token') ||
            sessionStorage.getItem('token') ||
            localStorage.getItem('authToken');
    }

    /**
     * 서버 상태 확인
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

    /**
     * 텍스트를 수어로 변환 요청
     */
    async convertTextToSign(translationRequest) {
        const MAX_RETRIES = API_CONFIG.MAX_RETRIES || 3;

        console.log(`텍스트-수어 변환 요청: "${translationRequest.text}"`);

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const token = this.getAuthToken();
                if (!token) throw new Error('인증 토큰이 없습니다.');

                const response = await fetch(`${this.baseURL}/api/translate/text-to-sign`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(translationRequest),
                    signal: this.controller.signal
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('텍스트-수어 변환 응답:', result);
                return result;

            } catch (error) {
                console.error(`변환 시도 ${attempt}/${MAX_RETRIES} 실패:`, error.message);

                if (attempt === MAX_RETRIES) {
                    throw error;
                }

                // 재시도 전 대기
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
}