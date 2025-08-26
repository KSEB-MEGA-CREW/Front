// websocket 수어 번역 전체 관리 (비동기 상태 오류 방지) 시스템
import { resolve } from '@react-three/fiber/dist/declarations/src/core/utils';
import { MEDIAPIPE_CONFIG, VIDEO_CONFIG, MESSAGE_TYPES } from '../constants/videoConfig';
import { keypointUtils } from '../utils/keypointUtils';
import { performanceLogger } from '../utils/performanceUtils';

// 1. system initialize
class SystemManager {
    static async initialize() {
        console.log('시스템 호환성 검증 시작...');
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error('브라우저가 웹캠을 지원하지 않습니다');
        }

        if (!window.Hands) {
            throw new Error('MediaPipe 라이브러리가 로드되지 않았습니다');
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('인증 토큰이 없습니다');
        }

        console.log('✅ 시스템 검증 완료');
        return { token, isReady: true };
    }
}

// 2. webcam stream manage
class CameraManager {
    constructor() {
        this.stream = null;
        this.videoElement = null;
    }

    async initializeCamera() {
        try {
            console.log('웹캠 스트림 요청...');

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: VIDEO_CONFIG.CANVAS_WIDTH,
                    height: VIDEO_CONFIG.CANVAS_HEIGHT,
                    facingMode: 'user',
                    frameRate: { ideal: 30 }
                }
            });

            console.log('웹캠 스트림 획득 완료');
            return this.stream;

        } catch (error) {
            console.error('웹캠 접근 실패:', error);
            throw new Error(`카메라 오류: ${error.message}`);
        }
    }


    releaseStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }

        console.log('카메라 리소스 정리 완료');
    }

    isReady() {
        // 더 엄격한 체크 조건 적용
        return this.stream !== null &&
            this.videoElement &&
            this.videoElement.videoWidth > 0 &&
            this.videoElement.videoHeight > 0 &&
            this.videoElement.readyState >= 2; // HAVE_CURRENT_DATA 이상
    }

    setupVideoElement(videoElement) {
        this.videoElement = videoElement;
        if (this.stream && this.videoElement) {
            this.videoElement.srcObject = this.stream;

            // 비디오 준비 상태 대기
            return new Promise((resolve) => {
                const checkReady = () => {
                    if (this.isReady()) {
                        console.log('카메라 준비 완료:', {
                            width: this.videoElement.videoWidth,
                            height: this.videoElement.videoHeight,
                            readyState: this.videoElement.readyState
                        });
                        resolve();
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
                checkReady();
            });
        }
        return Promise.resolve();
    }
}

// 3. mediapipe library manage
class MediaPipeManager {
    constructor() {
        this.hands = null;
        this.isInitialized = false;
        this.isProcessing = false;
    }

    async initialize() {
        try {
            console.log('🤖 MediaPipe 초기화 시작...');

            this.hands = new window.Hands({
                locateFile: (file) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            this.hands.setOptions({
                maxNumHands: MEDIAPIPE_CONFIG.MAX_NUM_HANDS,
                modelComplexity: MEDIAPIPE_CONFIG.MODEL_COMPLEXITY,
                minDetectionConfidence: MEDIAPIPE_CONFIG.MIN_DETECTION_CONFIDENCE,
                minTrackingConfidence: MEDIAPIPE_CONFIG.MIN_TRACKING_CONFIDENCE
            });

            this.isInitialized = true;
            console.log('✅ MediaPipe 초기화 완료');
            return true;

        } catch (error) {
            console.error('❌ MediaPipe 초기화 실패:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    async extractKeypoints(videoElement) {
        if (!this.isInitialized || !this.hands) {
            throw new Error('MediaPipe가 초기화되지 않았습니다');
        }

        if (this.isProcessing) {
            return null;
        }

        this.isProcessing = true;
        performanceLogger.startTimer('keypoint_extraction');

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.isProcessing = false;
                reject(new Error('MediaPipe 처리 타임아웃'));
            }, 500); // 500ms 타임아웃

            this.hands.onResults((results) => {
                try {
                    clearTimeout(timeout);

                    const keypoints = keypointUtils.normalizeKeypoints(results);
                    const extractionTime = performanceLogger.endTimer('keypoint_extraction');
                    performanceLogger.addMetric('keypointExtraction', extractionTime);

                    this.isProcessing = false;
                    resolve(keypoints);

                } catch (error) {
                    this.isProcessing = false;
                    reject(error);
                }
            });

            try {
                this.hands.send({ image: videoElement });
            } catch (error) {
                clearTimeout(timeout);
                this.isProcessing = false;
                reject(error);
            }
        });
    }

    isReady() {
        return this.isInitialized && this.hands !== null;
    }

    cleanup() {
        try {
            if (this.hands) {
                this.hands.close();
                this.hands = null;
            }
            this.isInitialized = false;
            this.isProcessing = false;
            console.log('✅ MediaPipe 정리 완료');
        } catch (error) {
            console.error('❌ MediaPipe 정리 오류:', error);
        }
    }
}

// 4. network connection and retry manage
class NetworkManager {
    constructor() {
        this.ws = null;
        this.connectionState = 'CLOSED';
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.sessionId = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.connectionTimeout = 10000; // 10s timeout
    }

    async connect(token, userId) {
        console.log('🔌 WebSocket 연결 시작...');

        const wsUrl = import.meta.env.VITE_WS_URL;
        if (!wsUrl) {
            throw new Error('VITE_WS_URL 환경변수가 설정되지 않았습니다');
        }

        return new Promise((resolve, reject) => {
            // 타임아웃 설정
            const timeout = setTimeout(() => {
                console.error('❌ WebSocket 연결 타임아웃');
                if (this.ws) {
                    this.ws.close();
                    this.ws = null;
                }
                this.connectionState = 'ERROR';
                reject(new Error('WebSocket 연결 타임아웃 (10초)'));
            }, this.connectionTimeout);

            try {
                const fullWsUrl = `${wsUrl}/ws?token=${token}`;
                console.log('연결 시도 URL:', fullWsUrl);

                this.ws = new WebSocket(fullWsUrl);

                this.ws.onopen = () => {
                    clearTimeout(timeout);
                    console.log('✅ WebSocket 연결 성공');
                    this.connectionState = 'OPEN';
                    this.reconnectAttempts = 0;
                    this.sessionId = this.generateSessionId();
                    resolve(this.ws);
                };

                this.ws.onerror = (error) => {
                    clearTimeout(timeout);
                    console.error('❌ WebSocket 연결 실패:', error);
                    this.connectionState = 'ERROR';
                    reject(new Error('WebSocket 연결 실패'));
                };

                this.ws.onclose = (event) => {
                    clearTimeout(timeout);
                    console.log('⚠️ WebSocket 연결 종료:', event.code, event.reason);
                    this.connectionState = 'CLOSED';

                    // 정상 종료가 아닌 경우에만 재연결 시도
                    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.scheduleReconnect(token, userId);
                    }
                };

            } catch (error) {
                clearTimeout(timeout);
                console.error('❌ WebSocket 생성 실패:', error);
                this.connectionState = 'ERROR';
                reject(error);
            }
        });
    }


    scheduleReconnect(token, userId) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = Math.pow(2, this.reconnectAttempts) * 1000;
            console.log(`🔄 ${delay}ms 후 재연결 시도 (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect(token, userId).catch(error => {
                    console.error('재연결 실패:', error);
                });
            }, delay);
        } else {
            console.error('❌ 최대 재연결 횟수 초과');
        }
    }

    async sendKeypoints(keypoints) {
        if (!this.isConnected()) {
            throw new Error('WebSocket이 연결되지 않았습니다');
        }

        try {
            const message = {
                type: MESSAGE_TYPES.KEYPOINTS,
                session_id: this.sessionId,
                keypoints: keypoints,
                timestamp: Date.now()
            };

            this.ws.send(JSON.stringify(message));
            this.retryCount = 0;

        } catch (error) {
            console.error('❌ 키포인트 전송 실패:', error);

            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`🔄 재시도 중... (${this.retryCount}/${this.maxRetries})`);
                setTimeout(() => this.sendKeypoints(keypoints), 1000);
            } else {
                this.handleCriticalError(error);
            }
        }
    }

    onMessage(callback) {
        if (this.ws) {
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    callback(data);
                } catch (error) {
                    console.error('❌ 메시지 파싱 오류:', error);
                }
            };
        }
    }

    handleCriticalError(error) {
        console.error('💥 치명적 오류 발생:', error);
        this.disconnect();
    }

    isConnected() {
        return this.ws && this.connectionState === 'OPEN';
    }

    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connectionState = 'CLOSED';
        this.sessionId = null;
        console.log('🔌 WebSocket 연결 해제');
    }
}

// 5. frame process loop
class FrameProcessor {
    constructor(mediaPipeManager, networkManager) {
        this.mediaPipeManager = mediaPipeManager;
        this.networkManager = networkManager;
        this.intervalId = null;
        this.isRunning = false;
    }

    startProcessing(videoElement) {
        if (this.isRunning) return;

        console.log('🎬 프레임 처리 시작 (10fps)...');
        this.isRunning = true;

        this.intervalId = setInterval(async () => {
            try {
                if (!videoElement || videoElement.videoWidth === 0) {
                    return;
                }

                const keypoints = await this.mediaPipeManager.extractKeypoints(videoElement);

                if (keypoints && this.networkManager.isConnected()) {
                    await this.networkManager.sendKeypoints(keypoints);
                }

            } catch (error) {
                console.warn('⚠️ 프레임 처리 오류 (스킵):', error);
            }
        }, VIDEO_CONFIG.FRAME_INTERVAL);
    }

    stopProcessing() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('⏹️ 프레임 처리 중지');
    }

    isProcessing() {
        return this.isRunning;
    }
}

// 6. total system manager
export class SignLanguageSystem {
    constructor() {
        this.cameraManager = new CameraManager();
        this.mediaPipeManager = new MediaPipeManager();
        this.networkManager = new NetworkManager();
        this.frameProcessor = new FrameProcessor(this.mediaPipeManager, this.networkManager);
        this.isSystemReady = false;
        this.currentUser = null; // 사용자 정보 저장
    }

    // 사용자 정보 설정 메서드 추가
    setUser(user) {
        this.currentUser = user;
    }

    async initialize() {
        try {
            console.log('통합 수어 인식 시스템 시작...');

            if (!this.currentUser?.id) {
                throw new Error('사용자 정보가 필요합니다');
            }

            // 단계별 초기화
            const systemReady = await SystemManager.initialize();
            const stream = await this.cameraManager.initializeCamera();
            await this.mediaPipeManager.initialize();
            await this.networkManager.connect(systemReady.token, this.currentUser.id);

            this.isSystemReady = true;
            console.log('모든 시스템 초기화 완료');
            return { stream, isReady: true };

        } catch (error) {
            console.log('시스템 초기화 실패:', error);
            await this.cleanup();
            throw error;
        }
    }

    setupVideo(videoElement) {
        this.cameraManager.setupVideoElement(videoElement);
    }

    async startProcessing(videoElement) {
        if (!this.isSystemReady) {
            throw new Error('시스템이 준비되지 않았습니다');
        }

        if (!this.cameraManager.isReady()) {
            throw new Error('카메라가 준비되지 않았습니다');
        }

        this.frameProcessor.startProcessing(videoElement);
    }

    stopProcessing() {
        this.frameProcessor.stopProcessing();
    }

    onMessage(callback) {
        this.networkManager.onMessage(callback);
    }

    isReady() {
        return this.isSystemReady;
    }

    isProcessing() {
        return this.frameProcessor.isProcessing();
    }

    async cleanup() {
        console.log('시스템 리소스 정리...');

        this.frameProcessor.stopProcessing();
        this.networkManager.disconnect();
        this.mediaPipeManager.cleanup();
        this.cameraManager.releaseStream();

        this.isSystemReady = false;
        console.log('시스템 정리 완료');
    }
}

// 싱글톤 인스턴스 제공
let systemInstance = null;

export const getSignLanguageSystem = () => {
    if (!systemInstance) {
        systemInstance = new SignLanguageSystem();
    }
    return systemInstance;
};

export const resetSignLanguageSystem = () => {
    if (systemInstance) {
        systemInstance.cleanup();
        systemInstance = null;
    }
};