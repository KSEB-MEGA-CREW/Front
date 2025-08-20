// WebSocket 통신 서비스
import { API_CONFIG, MESSAGE_TYPES } from "../constants/videoConfig.js";
import { performanceLogger } from "../utils/performanceUtils.js";

export class WebSocketService {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.messageHandlers = new Map();
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.pingInterval = null;
        this.connectionPromise = null;
        this.currentSessionId = null;
    }

    connect(token) {
        // 중복 연결 방지
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this._connect(token);
        return this.connectionPromise;
    }

    _connect(token) {
        return new Promise((resolve, reject) => {
            try {
                const wsUrl = `${API_CONFIG.WEBSOCKET_URL}?token=${encodeURIComponent(token)}`;

                this.ws = new WebSocket(wsUrl);

                // 연결 타임아웃
                const connectTimeout = setTimeout(() => {
                    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
                        this.ws.close();
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, 10000); // 10초 타임아웃

                this.ws.onopen = () => {
                    clearTimeout(connectTimeout);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.connectionPromise = null;


                    // Ping 간격 설정 (30초마다)
                    this.startPing();

                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('WebSocket message parsing error:', error);
                    }
                };

                this.ws.onclose = (event) => {
                    clearTimeout(connectTimeout);
                    this.isConnected = false;
                    this.connectionPromise = null;
                    this.stopPing();


                    // 정상 종료가 아닌 경우 재연결 시도
                    if (event.code !== 1000 && event.code !== 1001) {
                        this.attemptReconnect(token);
                    }
                };

                this.ws.onerror = (error) => {
                    clearTimeout(connectTimeout);
                    console.error('WebSocket error:', error);

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

    // 🔄 추가: 번역 시작 메시지
    sendTranslationStart(sessionId) {
        if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }

        this.currentSessionId = sessionId;

        const message = {
            type: MESSAGE_TYPES.START_TRANSLATION,
            session_id: sessionId,
            timestamp: Date.now()
        };

        try {
            this.ws.send(JSON.stringify(message));
            console.log('🚀 Translation session started:', sessionId);
        } catch (error) {
            console.error('Translation start send error:', error);
            throw error;
        }
    }

    // 🔄 추가: 번역 종료 메시지
    sendTranslationStop(sessionId) {
        if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not connected for stop message');
            return;
        }

        const message = {
            type: MESSAGE_TYPES.STOP_TRANSLATION,
            session_id: sessionId,
            timestamp: Date.now()
        };

        try {
            this.ws.send(JSON.stringify(message));
            console.log('🛑 Translation session stopped:', sessionId);
            this.currentSessionId = null;
        } catch (error) {
            console.error('Translation stop send error:', error);
        }
    }

    // 🔄 수정: 키포인트 전송에 메시지 타입과 세션 ID 추가
    sendFrame(keypoints, frameIndex, sessionId) {
        if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }

        if (!sessionId) {
            throw new Error('Session ID is required');
        }

        performanceLogger.startTimer('websocket_send');

        const message = {
            type: MESSAGE_TYPES.KEYPOINTS,
            session_id: sessionId,
            frame_index: frameIndex,
            keypoints: keypoints,
            timestamp: Date.now()
        };

        try {
            this.ws.send(JSON.stringify(message));

            const sendTime = performanceLogger.endTimer('websocket_send');
            performanceLogger.addMetric('websocketSend', sendTime, {
                frameIndex,
                sessionId,
                messageSize: JSON.stringify(message).length
            });

        } catch (error) {
            console.error('WebSocket send error:', error);
            throw error;
        }
    }

    onMessage(type, handler) {
        this.messageHandlers.set(type, handler);
    }

    handleMessage(data) {
        const { type } = data;

        if (type === 'pong') {
            // Ping/Pong 응답 처리
            return;
        }

        const handler = this.messageHandlers.get(type);
        if (handler) {
            try {
                handler(data);
            } catch (error) {
                console.error(`Message handler error for type '${type}':`, error);
            }
        } else {
            console.warn(`No handler for message type: ${type}`);
        }
    }

    startPing() {
        this.pingInterval = setInterval(() => {
            if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
                try {
                    this.ws.send(JSON.stringify({ type: 'ping' }));
                } catch (error) {
                    console.error('Ping send error:', error);
                }
            }
        }, 30000); // 30초마다
    }

    stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    attemptReconnect(token) {
        if (this.reconnectAttempts >= API_CONFIG.MAX_RECONNECT_ATTEMPTS) {
            console.error('Max reconnection attempts reached');
            return;
        }

        if (this.reconnectTimer) {
            return; // 이미 재연결 시도 중
        }

        this.reconnectAttempts++;
        const delay = API_CONFIG.RECONNECT_INTERVAL * this.reconnectAttempts;


        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect(token).catch(error => {
                console.error('Reconnection failed:', error);
            });
        }, delay);
    }

    disconnect() {
        // 번역 세션이 활성화되어 있으면 종료 메시지 전송
        if (this.currentSessionId) {
            this.sendTranslationStop(this.currentSessionId);
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
        this.connectionPromise = null;
        this.reconnectAttempts = 0;
        this.currentSessionId = null;

    }

    getConnectionState() {
        if (!this.ws) return 'CLOSED';

        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return 'CONNECTING';
            case WebSocket.OPEN: return 'OPEN';
            case WebSocket.CLOSING: return 'CLOSING';
            case WebSocket.CLOSED: return 'CLOSED';
            default: return 'UNKNOWN';
        }
    }
}