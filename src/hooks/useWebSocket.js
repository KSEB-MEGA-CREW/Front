import { useState, useRef, useCallback, useEffect } from 'react';
import { WebSocketService } from '../services/WebSocketService';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState('CLOSED');
    const [error, setError] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const [sessionStats, setSessionStats] = useState(null);

    const wsService = useRef(new WebSocketService());
    const stateCheckInterval = useRef(null);

    // 연결 상태 모니터링
    useEffect(() => {
        stateCheckInterval.current = setInterval(() => {
            const state = wsService.current.getConnectionState();
            setConnectionState(state);
            setIsConnected(state === 'OPEN');
        }, 1000);

        return () => {
            if (stateCheckInterval.current) {
                clearInterval(stateCheckInterval.current);
            }
        };
    }, []);

    // 토큰과 userId를 받는 connect 함수
    const connect = useCallback(async (token, userId) => { // token과 userId를 인자로 받아야 함
        if (!token) {
            const errorMsg = '인증 토큰이 없습니다.';
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        if (!userId) {
            const errorMsg = '사용자 ID가 없습니다.';
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        try {
            setError(null);
            console.log(`🔐 Connecting with token: ${token.substring(0, 10)}... and userId: ${userId}`);

            await wsService.current.connect(token);

            // 메시지 핸들러 등록
            wsService.current.onMessage('connection_established', (data) => {
                console.log('📡 Connection established:', data);
                setError(null);
            });

            wsService.current.onMessage('prediction', (data) => {
                if (data.result && data.result.prediction) {
                    setLastResult(data.result);
                }
                if (data.session_stats) {
                    setSessionStats(data.session_stats);
                }
            });

            wsService.current.onMessage('error', (data) => {
                const errorMsg = data.message || 'WebSocket 서버 에러';
                setError(errorMsg);
                console.error('WebSocket server error:', errorMsg);
            });

            console.log('✅ WebSocket 연결 및 핸들러 등록 완료');

        } catch (err) {
            const errorMsg = err.message || 'WebSocket 연결 실패';
            setError(errorMsg);
            setIsConnected(false);
            throw err;
        }
    }, []);

    const sendFrame = useCallback((keypoints, frameIndex) => {
        if (!isConnected) {
            throw new Error('WebSocket이 연결되지 않았습니다.');
        }

        return wsService.current.sendFrame(keypoints, frameIndex);
    }, [isConnected]);

    const disconnect = useCallback(() => {
        wsService.current.disconnect();
        setIsConnected(false);
        setConnectionState('CLOSED');
        setLastResult(null);
        setSessionStats(null);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isConnected,
        connectionState,
        error,
        lastResult,
        sessionStats,
        connect,      // 이제 토큰과 userId를 받음
        disconnect,
        sendFrame,
        clearError
    };
};