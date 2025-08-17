import { useState, useRef, useCallback, useEffect } from 'react';
import { WebSocketService } from '../services/WebSocketService';
import { useAuth } from '../Context/authContext';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState('CLOSED');
    const [error, setError] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const [sessionStats, setSessionStats] = useState(null);

    const { user } = useAuth();
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

    const connect = useCallback(async () => {
        if (!user?.id) {
            const errorMsg = '사용자 인증이 필요합니다.';
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        const token = localStorage.getItem('token');
        if (!token) {
            const errorMsg = '인증 토큰이 없습니다.';
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        try {
            setError(null);

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
    }, [user?.id]);

    const sendFrame = useCallback((keypoints, frameIndex) => {
        if (!isConnected) {
            throw new Error('WebSocket이 연결되지 않았습니다.');
        }

        if (!Array.isArray(keypoints) || keypoints.length === 0) {
            throw new Error('유효하지 않은 키포인트 데이터입니다.');
        }

        try {
            wsService.current.sendFrame(keypoints, frameIndex);
        } catch (error) {
            setError(error.message);
            throw error;
        }
    }, [isConnected]);

    const disconnect = useCallback(() => {
        wsService.current.disconnect();
        setIsConnected(false);
        setConnectionState('CLOSED');
        setError(null);
        setLastResult(null);
        setSessionStats(null);
    }, []);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            disconnect();
            if (stateCheckInterval.current) {
                clearInterval(stateCheckInterval.current);
            }
        };
    }, [disconnect]);

    return {
        // 상태
        isConnected,
        connectionState,
        error,
        lastResult,
        sessionStats,

        // 메서드
        connect,
        sendFrame,
        disconnect,

        // 유틸리티
        clearError: useCallback(() => setError(null), [])
    };
};