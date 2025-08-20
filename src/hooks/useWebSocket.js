import { useState, useRef, useCallback, useEffect } from 'react';
import { WebSocketService } from '../services/WebSocketService';
import { MESSAGE_TYPES } from '../constants/videoConfig';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState('CLOSED');
    const [error, setError] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const [sessionStats, setSessionStats] = useState(null);
    const [translationState, setTranslationState] = useState('idle'); // 🔄 추가: 번역 상태

    const wsService = useRef(new WebSocketService());
    const stateCheckInterval = useRef(null);

    // 연결 상태 업데이트 함수
    const updateConnectionState = useCallback(() => {
        const state = wsService.current.getConnectionState();
        const connected = state === 'OPEN';
        setConnectionState(state);
        setIsConnected(connected);

        console.log(`🔄 연결 상태 업데이트: ${state}, isConnected: ${connected}`);
        return connected;
    }, []);

    // getConnectionState 함수
    const getConnectionState = useCallback(() => {
        const state = wsService.current.getConnectionState();
        console.log(`🔍 getConnectionState 호출: ${state}`);
        return state;
    }, []);

    // 연결 상태 모니터링 (간격 조정: 500ms → 2초)
    useEffect(() => {
        updateConnectionState();

        stateCheckInterval.current = setInterval(() => {
            updateConnectionState();
        }, 2000);

        return () => {
            if (stateCheckInterval.current) {
                clearInterval(stateCheckInterval.current);
            }
        };
    }, [updateConnectionState]);

    // 토큰과 userId를 받는 connect 함수
    const connect = useCallback(async (token, userId) => {
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

            await wsService.current.connect(token);

            // 연결 후 즉시 상태 업데이트
            setTimeout(() => {
                const connected = updateConnectionState();
                console.log(`🎯 연결 완료 후 상태 확인: isConnected=${connected}`);
            }, 100);

            // 🔄 수정: 메시지 타입별 핸들러 등록
            wsService.current.onMessage(MESSAGE_TYPES.PREDICTION_RESULT, (data) => {
                console.log('📡 Prediction result:', data);
                if (data.result) {
                    setLastResult(data.result);
                }
                if (data.session_stats) {
                    setSessionStats(data.session_stats);
                }
            });

            wsService.current.onMessage(MESSAGE_TYPES.SENTENCE_GENERATED, (data) => {
                console.log('📝 Sentence generated:', data);
                setLastResult({
                    label: data.sentence,
                    confidence: 1.0,
                    type: 'sentence'
                });
            });

            wsService.current.onMessage(MESSAGE_TYPES.STATUS, (data) => {
                console.log('📊 Status update:', data);
                if (data.status) {
                    setTranslationState(data.status);
                }
            });

            wsService.current.onMessage(MESSAGE_TYPES.ERROR, (data) => {
                const errorMsg = data.error_message || 'WebSocket 서버 에러';
                setError(errorMsg);
                console.error('WebSocket server error:', errorMsg);
            });


        } catch (err) {
            const errorMsg = err.message || 'WebSocket 연결 실패';
            setError(errorMsg);
            setIsConnected(false);
            throw err;
        }
    }, [updateConnectionState]);

    // 🔄 추가: 번역 시작 함수
    const startTranslation = useCallback((sessionId) => {
        const currentState = wsService.current.getConnectionState();
        const realTimeConnected = currentState === 'OPEN';

        console.log(`🚀 startTranslation 호출: connected=${realTimeConnected}, sessionId=${sessionId}`);

        if (!realTimeConnected) {
            updateConnectionState();
            throw new Error('WebSocket이 연결되지 않았습니다.');
        }

        try {
            wsService.current.sendTranslationStart(sessionId);
            setTranslationState('active');
            console.log('✅ Translation session started');
        } catch (error) {
            console.error('❌ Translation start failed:', error);
            throw error;
        }
    }, [updateConnectionState]);

    // 🔄 추가: 번역 종료 함수
    const stopTranslation = useCallback((sessionId) => {
        console.log(`🛑 stopTranslation 호출: sessionId=${sessionId}`);

        try {
            wsService.current.sendTranslationStop(sessionId);
            setTranslationState('idle');
            console.log('✅ Translation session stopped');
        } catch (error) {
            console.error('❌ Translation stop failed:', error);
        }
    }, []);

    // 🔄 수정: sendFrame에 세션 ID 추가
    const sendFrame = useCallback((keypoints, frameIndex, sessionId) => {
        const currentState = wsService.current.getConnectionState();
        const realTimeConnected = currentState === 'OPEN';

        console.log(`📤 sendFrame 호출: stored=${isConnected}, realTime=${realTimeConnected}, state=${currentState}`);

        if (!realTimeConnected) {
            updateConnectionState();
            throw new Error('WebSocket이 연결되지 않았습니다.');
        }

        if (!sessionId) {
            throw new Error('Session ID가 필요합니다.');
        }

        return wsService.current.sendFrame(keypoints, frameIndex, sessionId);
    }, [isConnected, updateConnectionState]);

    const disconnect = useCallback(() => {
        wsService.current.disconnect();
        setIsConnected(false);
        setConnectionState('CLOSED');
        setLastResult(null);
        setSessionStats(null);
        setTranslationState('idle');
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
        translationState, // 🔄 추가: 번역 상태
        connect,
        disconnect,
        startTranslation, // 🔄 추가: 번역 시작
        stopTranslation, // 🔄 추가: 번역 종료
        sendFrame,
        clearError,
        updateConnectionState,
        getConnectionState
    };
};