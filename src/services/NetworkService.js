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
                const errorMessages = {
                    401: '인증이 만료되었습니다.',
                    403: '세션 접근 권한이 없습니다.',
                    400: '프레임 데이터가 유효하지 않습니다.',
                    429: '요청 한도를 초과했습니다.',
                    500: '서버 내부 오류가 발생했습니다.',
                    503: '서비스를 일시적으로 사용할 수 없습니다.'
                };
                
                const errorMessage = errorMessages[response.status] || `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
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
                await this.delay(Math.min(1000 * Math.pow(2, this.retryCount - 1), 10000)); // 지수 백오프 with 언한
                return this.sendFrame(frameRequest);
            }

            throw error;
        }
    }

    // 재시도 가능한 에러인지 확인
    shouldRetry(error) {
        const retryableErrors = [
            '네트워크',
            'timeout',
            '서버 오류',
            '서버 내부 오류',
            '서비스를 일시적으로'
        ];
        
        return retryableErrors.some(errorType => 
            error.message.includes(errorType)
        ) && !error.message.includes('인증'); // 인증 에러는 재시도하지 않음
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