// 전역 WebSocket 연결 관리자 - 지속적 연결과 번역 세션 분리
import { API_CONFIG, MESSAGE_TYPES } from "../constants/videoConfig.js";
import { performanceLogger } from "../utils/performanceUtils.js";

export class GlobalWebSocketManager {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.connectionState = 'CLOSED';
        this.translationState = 'idle';
        this.currentSessionId = null;
        this.userId = null;
        
        // 재연결 관리
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.pingInterval = null;
        this.connectionPromise = null;
        
        // 이벤트 리스너들
        this.connectionListeners = new Set();
        this.translationListeners = new Set();
        this.messageHandlers = new Map();
        
        // 키포인트 전송 최적화
        this.frameQueue = [];
        this.isProcessingQueue = false;
        this.maxQueueSize = 10;
    }

    // === 연결 관리 ===
    async connect(token, userId) {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.userId = userId;
        this.connectionPromise = this._connect(token);
        return this.connectionPromise;
    }

    _connect(token) {
        return new Promise((resolve, reject) => {
            try {
                const wsUrl = `${API_CONFIG.WEBSOCKET_URL}?token=${encodeURIComponent(token)}`;
                this.ws = new WebSocket(wsUrl);

                const connectTimeout = setTimeout(() => {
                    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
                        this.ws.close();
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, 10000);

                this.ws.onopen = () => {
                    clearTimeout(connectTimeout);
                    this.isConnected = true;
                    this.connectionState = 'OPEN';
                    this.reconnectAttempts = 0;
                    this.connectionPromise = null;

                    this.startPing();
                    this.notifyConnectionListeners();
                    console.log('🌐 [GlobalWebSocketManager] 연결 성공');
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        let messageData = event.data;
                        
                        // Echo 메시지 및 디버그 메시지 필터링
                        if (typeof messageData === 'string') {
                            if (messageData.startsWith('Echo:')) {
                                console.log('📢 [GlobalWebSocketManager] 서버 Echo 메시지 무시:', messageData);
                                return;
                            }
                            
                            // JSON 형태가 아닌 일반 텍스트 메시지 필터링
                            const trimmed = messageData.trim();
                            if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
                                console.warn('⚠️ [GlobalWebSocketManager] 비정상 메시지 형태 무시:', messageData);
                                return;
                            }
                        }
                        
                        // JSON 파싱 시도
                        const data = JSON.parse(messageData);
                        this.handleMessage(data);
                        
                    } catch (error) {
                        console.error('🚨 [GlobalWebSocketManager] 메시지 파싱 오류:', error);
                        console.error('🚨 [GlobalWebSocketManager] 원본 메시지:', event.data);
                        console.error('🚨 [GlobalWebSocketManager] 메시지 타입:', typeof event.data);
                    }
                };

                this.ws.onclose = (event) => {
                    clearTimeout(connectTimeout);
                    this.isConnected = false;
                    this.connectionState = 'CLOSED';
                    this.connectionPromise = null;
                    this.stopPing();
                    
                    console.log(`🔌 [GlobalWebSocketManager] 연결 종료 (code: ${event.code})`);
                    this.notifyConnectionListeners();

                    // 정상 종료가 아닌 경우 재연결 시도
                    if (event.code !== 1000 && event.code !== 1001) {
                        this.attemptReconnect();
                    }
                };

                this.ws.onerror = (error) => {
                    clearTimeout(connectTimeout);
                    console.error('🚨 [GlobalWebSocketManager] 연결 오류:', error);

                    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
                        reject(new Error('WebSocket connection failed'));
                    }
                };

            } catch (error) {
                this.connectionPromise = null;
                reject(error);
            }
        });
    }

    // === 번역 세션 관리 ===
    startTranslation(sessionId) {
        if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }

        if (!this.userId) {
            throw new Error('User ID not set');
        }

        this.currentSessionId = sessionId;
        this.translationState = 'starting';
        
        console.log('🔍 [GlobalWebSocketManager] MESSAGE_TYPES.START_TRANSLATION:', MESSAGE_TYPES.START_TRANSLATION);
        console.log('🔍 [GlobalWebSocketManager] MESSAGE_TYPES:', MESSAGE_TYPES);
        
        const message = {
            type: MESSAGE_TYPES.TRANSLATION_START,
            session_id: sessionId,
            user_id: parseInt(this.userId)
        };

        try {
            console.log('📤 [GlobalWebSocketManager] 전송할 메시지:', JSON.stringify(message, null, 2));
            this.ws.send(JSON.stringify(message));
            console.log('🚀 [GlobalWebSocketManager] 번역 세션 시작:', sessionId);
            
            // 서버에서 translation_status 메시지를 보내지 않는 경우를 대비해 
            // 메시지 전송 후 잠시 후 active 상태로 변경
            setTimeout(() => {
                if (this.translationState === 'starting') {
                    this.translationState = 'active';
                    console.log('✅ [GlobalWebSocketManager] 번역 상태를 수동으로 active로 변경');
                    this.notifyTranslationListeners();
                }
            }, 1000); // 1초 후 자동 활성화
            
            this.notifyTranslationListeners();
        } catch (error) {
            console.error('🚨 [GlobalWebSocketManager] 번역 시작 오류:', error);
            this.translationState = 'error';
            this.notifyTranslationListeners();
            throw error;
        }
    }

    stopTranslation() {
        if (!this.currentSessionId) {
            console.warn('⚠️ [GlobalWebSocketManager] 활성 번역 세션이 없음');
            return;
        }

        if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('⚠️ [GlobalWebSocketManager] WebSocket 연결 없음 - 종료 메시지 건너뜀');
            this.translationState = 'idle';
            this.currentSessionId = null;
            this.notifyTranslationListeners();
            return;
        }

        const message = {
            type: MESSAGE_TYPES.TRANSLATION_END,
            session_id: this.currentSessionId,
            user_id: parseInt(this.userId)
        };

        try {
            console.log('📤 [GlobalWebSocketManager] 전송할 종료 메시지:', JSON.stringify(message, null, 2));
            this.ws.send(JSON.stringify(message));
            console.log('🛑 [GlobalWebSocketManager] 번역 세션 종료:', this.currentSessionId);
            this.translationState = 'stopping';
            this.notifyTranslationListeners();
            
            // 2초 후 상태를 idle로 변경
            setTimeout(() => {
                this.translationState = 'idle';
                this.currentSessionId = null;
                this.notifyTranslationListeners();
            }, 2000);
        } catch (error) {
            console.error('🚨 [GlobalWebSocketManager] 번역 종료 오류:', error);
            this.translationState = 'idle';
            this.currentSessionId = null;
            this.notifyTranslationListeners();
        }
    }

    // === 키포인트 전송 (최적화된) ===
    sendKeypoints(keypoints, frameIndex) {
        if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('⚠️ [GlobalWebSocketManager] 키포인트 전송 실패 - 연결 없음');
            return false;
        }

        if (!this.currentSessionId) {
            console.warn('⚠️ [GlobalWebSocketManager] 키포인트 전송 실패 - 세션 없음');
            return false;
        }

        if (this.translationState !== 'active') {
            console.warn('⚠️ [GlobalWebSocketManager] 키포인트 전송 실패 - 번역 비활성');
            return false;
        }

        // 키포인트 데이터 구조 확인
        console.log('🔍 [GlobalWebSocketManager] 키포인트 데이터 구조:', {
            type: typeof keypoints,
            isArray: Array.isArray(keypoints),
            length: keypoints?.length,
            sample: Array.isArray(keypoints) ? keypoints.slice(0, 3) : keypoints
        });

        const message = {
            type: MESSAGE_TYPES.KEYPOINTS,
            session_id: this.currentSessionId,
            frame_index: frameIndex,
            keypoints: keypoints,
            user_id: parseInt(this.userId),
            timestamp: Date.now()
        };

        // 큐가 가득 찬 경우 오래된 프레임 삭제
        if (this.frameQueue.length >= this.maxQueueSize) {
            this.frameQueue.shift();
        }

        this.frameQueue.push(message);
        this.processFrameQueue();
        return true;
    }

    // 프레임 배치 전송 (새로 추가)
    sendFrameBatch(batchData) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('⚠️ [GlobalWebSocketManager] 프레임 배치 전송 실패 - 연결 없음');
            return false;
        }

        if (!this.currentSessionId) {
            console.warn('⚠️ [GlobalWebSocketManager] 프레임 배치 전송 실패 - 세션 없음');
            return false;
        }

        if (this.translationState !== 'active') {
            console.warn('⚠️ [GlobalWebSocketManager] 프레임 배치 전송 실패 - 번역 비활성');
            return false;
        }

        try {
            const message = {
                type: "frame_batch",
                session_id: this.currentSessionId,
                batch_index: batchData.batchIndex,
                frame_count: batchData.frameCount,
                frames: batchData.frames.map(frame => ({
                    frame_index: frame.frameIndex,
                    image_data: frame.imageData,
                    timestamp: frame.timestamp,
                    dimensions: frame.dimensions
                })),
                timestamp: batchData.timestamp,
                is_final: batchData.isFinal || false,
                user_id: parseInt(this.userId)
            };

            console.log("📤 [GlobalWebSocketManager] 프레임 배치 전송:", {
                batchIndex: message.batch_index,
                frameCount: message.frame_count,
                isFinal: message.is_final,
                dataSize: JSON.stringify(message).length
            });

            this.ws.send(JSON.stringify(message));
            
            performanceLogger.addMetric('websocketSendBatch', 0, {
                batchIndex: message.batch_index,
                frameCount: message.frame_count,
                sessionId: message.session_id,
                messageSize: JSON.stringify(message).length
            });

            return true;

        } catch (error) {
            console.error("🚨 [GlobalWebSocketManager] 프레임 배치 전송 오류:", error);
            return false;
        }
    }

    async processFrameQueue() {
        if (this.isProcessingQueue || this.frameQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        try {
            while (this.frameQueue.length > 0) {
                const message = this.frameQueue.shift();
                
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify(message));
                    
                    performanceLogger.addMetric('websocketSend', 0, {
                        frameIndex: message.frame_index,
                        sessionId: message.session_id,
                        messageSize: JSON.stringify(message).length
                    });
                } else {
                    console.warn('⚠️ [GlobalWebSocketManager] 큐 처리 중 연결 끊김');
                    break;
                }
            }
        } catch (error) {
            console.error('🚨 [GlobalWebSocketManager] 큐 처리 오류:', error);
        } finally {
            this.isProcessingQueue = false;
        }
    }

    // === 메시지 처리 ===
    handleMessage(data) {
        if (!data.type) {
            console.warn('⚠️ [GlobalWebSocketManager] type 필드가 없는 메시지:', data);
            return;
        }

        // 번역 상태 업데이트
        if (data.type === MESSAGE_TYPES.TRANSLATION_STATUS) {
            if (data.status === 'active') {
                this.translationState = 'active';
                console.log('✅ [GlobalWebSocketManager] 번역 세션 활성화됨');
            } else if (data.status === 'stopped') {
                this.translationState = 'idle';
                this.currentSessionId = null;
                console.log('✅ [GlobalWebSocketManager] 번역 세션 종료됨');
            }
            this.notifyTranslationListeners();
        }

        // Ping/Pong 처리
        if (data.type === 'pong') {
            return;
        }

        // 등록된 핸들러 호출
        const handler = this.messageHandlers.get(data.type);
        if (handler) {
            try {
                handler(data);
            } catch (error) {
                console.error(`🚨 [GlobalWebSocketManager] 핸들러 오류 (${data.type}):`, error);
            }
        } else {
            console.log(`📨 [GlobalWebSocketManager] 핸들러 없음: ${data.type}`);
        }
    }

    onMessage(type, handler) {
        this.messageHandlers.set(type, handler);
    }

    // === 상태 알림 ===
    onConnectionChange(listener) {
        this.connectionListeners.add(listener);
        return () => this.connectionListeners.delete(listener);
    }

    onTranslationChange(listener) {
        this.translationListeners.add(listener);
        return () => this.translationListeners.delete(listener);
    }

    notifyConnectionListeners() {
        const state = {
            isConnected: this.isConnected,
            connectionState: this.connectionState
        };
        this.connectionListeners.forEach(listener => {
            try {
                listener(state);
            } catch (error) {
                console.error('🚨 [GlobalWebSocketManager] 연결 리스너 오류:', error);
            }
        });
    }

    notifyTranslationListeners() {
        const state = {
            translationState: this.translationState,
            currentSessionId: this.currentSessionId
        };
        this.translationListeners.forEach(listener => {
            try {
                listener(state);
            } catch (error) {
                console.error('🚨 [GlobalWebSocketManager] 번역 리스너 오류:', error);
            }
        });
    }

    // === 유틸리티 ===
    startPing() {
        this.pingInterval = setInterval(() => {
            if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
                try {
                    this.ws.send(JSON.stringify({ type: 'ping' }));
                } catch (error) {
                    console.error('🚨 [GlobalWebSocketManager] Ping 전송 오류:', error);
                }
            }
        }, 30000);
    }

    stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= (API_CONFIG.MAX_RECONNECT_ATTEMPTS || 3)) {
            console.error('🚨 [GlobalWebSocketManager] 최대 재연결 시도 초과');
            return;
        }

        if (this.reconnectTimer) {
            return;
        }

        this.reconnectAttempts++;
        const delay = (API_CONFIG.RECONNECT_INTERVAL || 1000) * this.reconnectAttempts;

        console.log(`🔄 [GlobalWebSocketManager] 재연결 시도 ${this.reconnectAttempts}/${API_CONFIG.MAX_RECONNECT_ATTEMPTS || 3} (${delay}ms 후)`);

        this.reconnectTimer = setTimeout(async () => {
            this.reconnectTimer = null;
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                if (token && this.userId) {
                    await this.connect(token, this.userId);
                }
            } catch (error) {
                console.error('🚨 [GlobalWebSocketManager] 재연결 실패:', error);
            }
        }, delay);
    }

    disconnect() {
        console.log('🔌 [GlobalWebSocketManager] 연결 종료 시작');

        // 활성 번역 세션 종료
        if (this.currentSessionId) {
            this.stopTranslation();
        }

        // 재연결 타이머 정리
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        this.stopPing();

        if (this.ws) {
            this.ws.close(1000, 'Normal closure');
            this.ws = null;
        }

        this.isConnected = false;
        this.connectionState = 'CLOSED';
        this.translationState = 'idle';
        this.connectionPromise = null;
        this.reconnectAttempts = 0;
        this.currentSessionId = null;
        this.frameQueue = [];

        this.notifyConnectionListeners();
        this.notifyTranslationListeners();
        
        console.log('✅ [GlobalWebSocketManager] 연결 종료 완료');
    }

    // === 상태 조회 ===
    getConnectionState() {
        return this.connectionState;
    }

    getTranslationState() {
        return this.translationState;
    }

    isTranslationActive() {
        return this.translationState === 'active';
    }

    getCurrentSessionId() {
        return this.currentSessionId;
    }
}

// 싱글톤 인스턴스
let globalWebSocketManager = null;

export const getGlobalWebSocketManager = () => {
    if (!globalWebSocketManager) {
        globalWebSocketManager = new GlobalWebSocketManager();
    }
    return globalWebSocketManager;
};