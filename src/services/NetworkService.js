import { API_CONFIG } from "../constants/videoConfig";

// 백엔드 통신

export class NetworkService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.controller = new AbortController();
        this.retryCount = 0;
    }

    // JWT 토큰 가져오기
    getAuthToken() {
        return localStorage.getItem('token');
    }

    // 프레임 전송 요청 <- 백엔드 FrameController와 연동
    async sendFrame(frameRequest) {
        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.ANALYZE_FRAME}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(frameRequest),
                    signal: this.controller.signal
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('인증이 만료되었습니다.');
                } else if (response.status === 403) {
                    throw new Error('세션 접근 권한이 없습니다.');
                } else if (response.status === 400) {
                    throw new Error('프레임 데이터가 유효하지 않습니다.');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            this.retryCount = 0; // 성공 시 재시도 카운트 리셋
            return result;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request aborted');
                return null;
            }

            // 재시도 로직
            if (this.retryCount < API_CONFIG.MAX_RETRIES &&
                this.shouldRetry(error)
            ) {
                this.retryCount++;
                console.log(`Retrying request (${this.retryCount}/${API_CONFIG.MAX_RETRIES})`);
                await this.delay(1000 * this.retryCount); // 지수 백오프
                return this.sendFrame(frameRequest);
            }

            throw error;
        }
    }

    // 재시도 가능한 에러인지 확인
    shouldRetry(error) {
        return error.message.includes('네트워크') ||
            error.message.includes('timeout') ||
            error.message.includes('서버 오류');
    }

    // 지연 함수
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 헬스체크
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.HEALTH_CHECK}`);
            return response.ok;
        } catch {
            return false;
        }
    }

    // 요청 취소
    abort() {
        this.controller.abort();
        this.controller = new AbortController();
        this.retryCount = 0;
    }
}