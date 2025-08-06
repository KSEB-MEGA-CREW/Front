import { API_CONFIG } from "../constants/videoConfig";
import { performanceLogger } from "../utils/performanceUtils";

/**
 * 백엔드 통신을 위한 중앙화된 네트워크 서비스 클래스
 */
export class NetworkService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.controller = new AbortController();
        this.requestCount = 0;
    }

    /**
     * ✅ [수정] 중앙화된 요청 및 재시도 처리기. private 메서드처럼 사용합니다.
     * @param {string} endpoint - API 엔드포인트
     * @param {object} options - fetch API에 전달될 옵션 객체
     * @param {string} token - 인증 토큰
     * @returns {Promise<any>} API 응답 데이터
     */
    async _fetchWithRetry(endpoint, options, token) {
        const requestId = `network_request_${++this.requestCount}`;
        performanceLogger.startTimer(requestId);

        for (let attempt = 1; attempt <= API_CONFIG.MAX_RETRIES + 1; attempt++) {
            try {
                if (!token) {
                    throw new Error('인증 토큰이 제공되지 않았습니다.');
                }

                const response = await fetch(`${this.baseURL}${endpoint}`, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                        'Authorization': `Bearer ${token}`,
                    },
                    signal: this.controller.signal,
                });

                if (!response.ok) {
                    // ✅ [수정] HTTP 상태 코드를 기반으로 한 커스텀 에러 생성
                    const errorData = await response.text();
                    const error = new Error(`HTTP ${response.status}: ${errorData || response.statusText}`);
                    error.status = response.status;
                    throw error;
                }

                const networkTime = performanceLogger.endTimer(requestId);
                console.log(`✅ [${new Date().toISOString().split('T')[1].slice(0, -1)}] 요청 성공 (소요 시간: ${Math.round(networkTime)}ms)`);
                performanceLogger.logPerformance('네트워크 요청 성공', networkTime, { endpoint, status: response.status });

                return await response.json();

            } catch (error) {
                const networkTime = performanceLogger.endTimer(requestId);
                console.error(`❌ [시도 ${attempt}] 네트워크 오류:`, error.message);
                performanceLogger.addMetric('networkRequestError', networkTime, { endpoint, attempt, error: error.message });

                // 마지막 시도이거나, 재시도하면 안 되는 에러인 경우, 에러를 던지고 종료
                if (attempt > API_CONFIG.MAX_RETRIES || !this._shouldRetry(error)) {
                    throw error;
                }

                const delayTime = 1000 * Math.pow(2, attempt - 1); // Exponential backoff
                console.log(`🔌 ${delayTime}ms 후 재시도... (${attempt}/${API_CONFIG.MAX_RETRIES})`);
                await this._delay(delayTime);
            }
        }
    }

    /**
     * ✅ [수정] 프레임 전송 요청. 토큰을 인자로 받습니다.
     * @param {object} frameRequest - 프레임 데이터
     * @param {string} token - 인증 토큰
     * @returns {Promise<any>} 분석 결과
     */
    async sendFrame(frameRequest, token) {
        console.log(`📡 [${new Date().toISOString().split('T')[1].slice(0, -1)}] 프레임 전송 시작 (Frame #${frameRequest.frameIndex})`);

        return this._fetchWithRetry(
            API_CONFIG.ENDPOINTS.ANALYZE_FRAME,
            {
                method: 'POST',
                body: JSON.stringify(frameRequest),
            },
            token
        );
    }

    /**
     * ✅ [추가] 일관성을 위해 세션 생성 메서드도 추가
     * @param {string} token - 인증 토큰
     * @returns {Promise<any>} 세션 생성 결과
     */
    async createSession(token) {
        return this._fetchWithRetry(
            API_CONFIG.ENDPOINTS.CREATE_SESSION, // config에 세션 엔드포인트가 있다고 가정
            { method: 'POST' },
            token
        );
    }

    /**
     * ✅ [수정] HTTP 상태코드와 에러 타입으로 재시도 여부 판단
     * @param {Error} error - 발생한 에러 객체
     * @returns {boolean} 재시도 가능 여부
     */
    _shouldRetry(error) {
        if (error.name === 'AbortError') {
            return false;
        }
        // 5xx 서버 에러는 재시도
        if (error.status && error.status >= 500 && error.status <= 599) {
            return true;
        }
        // 네트워크 연결 실패 관련 에러 (TypeError: Failed to fetch)
        if (error instanceof TypeError) {
            return true;
        }
        // 그 외 클라이언트 에러(4xx) 등은 재시도하지 않음
        return false;
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.HEALTH_CHECK}`);
            return response.ok;
        } catch {
            return false;
        }
    }

    abort() {
        this.controller.abort();
        this.controller = new AbortController();
        console.log('🛑 모든 네트워크 요청 중단');
    }
}