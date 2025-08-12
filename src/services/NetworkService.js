import { API_CONFIG } from "../constants/videoConfig";

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
        const frameErrorMessages = {
            401: '인증이 만료되었습니다.',
            403: '세션 접근 권한이 없습니다.',
            400: '프레임 데이터가 유효하지 않습니다.',
            429: '요청 한도를 초과했습니다.',
            500: '서버 내부 오류가 발생했습니다.',
            503: '서비스를 일시적으로 사용할 수 없습니다.'
        };

        const translationErrorMessages = {
            401: '인증이 만료되었습니다.',
            403: '번역 세션 접근 권한이 없습니다.',
            400: '번역할 텍스트가 유효하지 않습니다.',
            429: '번역 요청 한도를 초과했습니다.',
            500: 'AI 번역 서버 오류가 발생했습니다.',
            503: '번역 서비스를 일시적으로 사용할 수 없습니다.'
        };

        const errorMessages = type === 'translation' ? translationErrorMessages : frameErrorMessages;
        const message = errorMessages[error.status] || `예상치 못한 오류가 발생했습니다.`;
        return new Error(message);
    }

    // 지연 함수
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }



    // 헬스체크
    async healthCheck(service = 'frame') {
        try {
            const endpoint = service === 'translation'
                ? API_CONFIG.ENDPOINTS.TRANSLATION_HEALTH
                : API_CONFIG.ENDPOINTS.HEALTH_CHECK;

            const response = await fetch(`${this.baseURL}${endpoint}`);
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