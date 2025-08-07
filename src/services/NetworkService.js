import { API_CONFIG } from "../constants/videoConfig";
import { performanceLogger } from "../utils/performanceUtils";

/**
 * 백엔드 통신을 위한 중앙화된 네트워크 서비스 클래스
 */
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

        const MAX_RETRIES = API_CONFIG.MAX_RETRIES || 3; // 설정 파일에서 가져오거나 기본값 설정

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const token = this.getAuthToken();
                if (!token) throw new Error('인증 토큰이 없습니다.');

                const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.ANALYZE_FRAME}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(frameRequest),
                    signal: this.controller.signal
                });

                if (response.ok) {
                    return await response.json(); // 성공 시 즉시 결과 반환
                }

                // 실패 시, 재시도 여부를 결정하기 위해 에러를 발생시킴
                const error = new Error();
                error.status = response.status; // 에러 객체에 상태 코드 포함
                throw error;

            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Request aborted');
                    return null;
                }

                // 마지막 시도이거나, 재시도 불가능한 에러인 경우
                if (attempt === MAX_RETRIES || !this.shouldRetry(error)) {
                    // 최종적으로 처리할 에러 메시지 생성 및 throw
                    const finalError = this.createFinalError(error);
                    throw finalError;
                }

                // 재시도 전 지연
                console.log(`Retrying request (${attempt}/${MAX_RETRIES})`);
                const delayTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                await this.delay(delayTime);
            }
        }

    }



    // 재시도 가능한 에러인지 확인

    shouldRetry(error) {

        // 5xx 서버 에러, 429(요청 한도 초과), 네트워크 에러 등 재시도
        const retryableStatusCodes = [429, 500, 502, 503, 504];

        // error.status가 없으면 네트워크 에러로 간주하여 재시도
        if (!error.status) return true;

        return retryableStatusCodes.includes(error.status);
    }

    // 최종적으로 던질 에러 객체를 생성하는 헬퍼 함수
    createFinalError(error) {
        const errorMessages = {
            401: '인증이 만료되었습니다.',
            403: '세션 접근 권한이 없습니다.',
            400: '프레임 데이터가 유효하지 않습니다.',
            429: '요청 한도를 초과했습니다.',
            500: '서버 내부 오류가 발생했습니다.',
            503: '서비스를 일시적으로 사용할 수 없습니다.'
        };
        const message = errorMessages[error.status] || `An unexpected error occurred.`;
        return new Error(message);
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