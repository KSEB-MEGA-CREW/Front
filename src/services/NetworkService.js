import { API_CONFIG } from "../constants/videoConfig";
import { performanceLogger } from "../utils/performanceUtils";
// 백엔드 통신

export class NetworkService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.controller = new AbortController();
        this.retryCount = 0;
        this.requestCount = 0;
    }

    getAuthToken() {
        return localStorage.getItem('token');
    }


    // 프레임 전송 요청 <- 백엔드 FrameController와 연동
    async sendFrame(frameRequest) {
        const requestId = `network_request_${++this.requestCount}`;
        performanceLogger.startTimer(requestId);

        const requestStartTime = Date.now();

        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            // 요청 시작 로그
            console.log(`📡 [${new Date().toISOString().split('T')[1].slice(0, -1)}] 프레임 전송 시작 (Frame #${frameRequest.frameIndex})`);

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

            const networkTime = performanceLogger.endTimer(requestId);
            const responseTime = Date.now() - requestStartTime;

            if (!response.ok) {
                this.logError(response.status, frameRequest.frameIndex, networkTime);

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


            // 성공 로그
            performanceLogger.logPerformance(
                '✅ 네트워크 요청',
                networkTime,
                {
                    frameIndex: frameRequest.frameIndex,
                    status: response.status,
                    responseTime
                }
            );

            performanceLogger.addMetric('networkRequest', networkTime, {
                frameIndex: frameRequest.frameIndex,
                status: response.status,
                responseTime,
                success: true
            });

            return result;
        } catch (error) {
            const networkTime = performanceLogger.endTimer(requestId);


            if (error.name === 'AbortError') {
                console.log('Request aborted');
                return null;
            }

            // 에러 로그
            console.error(`❌ 네트워크 오류 (Frame #${frameRequest.frameIndex}):`, error.message);

            performanceLogger.addMetric('networkRequest', networkTime, {
                frameIndex: frameRequest.frameIndex,
                error: error.message,
                success: false
            });

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

    logError(status, frameIndex, duration) {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
        console.error(`❌ [${timestamp}] HTTP ${status} 오류 (Frame #${frameIndex}) - ${Math.round(duration)}ms`);
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
        console.log('🛑 모든 네트워크 요청 중단');
    }
}