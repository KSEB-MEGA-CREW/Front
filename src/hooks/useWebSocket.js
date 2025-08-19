import { useState, useRef, useCallback, useEffect } from 'react';
import { WebSocketService } from '../services/WebSocketService';
import { MESSAGE_TYPES } from '../constants/videoConfig';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState('CLOSED');
    const [error, setError] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const [sessionStats, setSessionStats] = useState(null);
    const [translationState, setTranslationState] = useState('idle');

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

            // 🔄 수정: PREDICTION_RESULT 메시지 처리
            wsService.current.onMessage(MESSAGE_TYPES.PREDICTION_RESULT, (data) => {
                console.log('🎯 개별 예측 수신:', data);

                // 개별 예측 결과로 임시 업데이트 (문장보다 우선순위 낮음)
                setLastResult(prev => {
                    // 이미 완성된 문장이 있으면 개별 예측 무시 (3초 이내)
                    if (prev && prev.type === 'sentence' &&
                        Date.now() - new Date(prev.timestamp).getTime() < 3000) {
                        return prev;
                    }

                    return {
                        label: data.label,
                        confidence: data.confidence,
                        type: 'prediction',  // 예측 타입 명시
                        timestamp: data.timestamp,
                        sessionId: data.session_id
                    };
                });

                if (data.session_stats) {
                    setSessionStats(data.session_stats);
                }
            });

            // 🔄 수정: SENTENCE_GENERATED 메시지 처리 강화
            wsService.current.onMessage(MESSAGE_TYPES.SENTENCE_GENERATED, (data) => {
                console.log('📝 완성된 문장 수신:', data);

                // 완성된 문장으로 결과 업데이트
                setLastResult({
                    label: data.sentence,
                    confidence: 1.0,
                    type: 'sentence',  // 문장 타입 명시
                    glosses: data.glosses || [],
                    timestamp: data.timestamp,
                    sessionId: data.session_id
                });

                // 🔄 추가: 문장 완성 이벤트 발생
                setTranslationState('sentence_completed');

                // 🔄 추가: 완성 알림 (선택적)
                if (window.speechSynthesis && data.sentence) {
                    try {
                        window.speechSynthesis.cancel(); // 이전 음성 중단
                        const utterance = new SpeechSynthesisUtterance(data.sentence);
                        utterance.lang = 'ko-KR';
                        utterance.rate = 0.9;
                        utterance.volume = 0.8;
                        window.speechSynthesis.speak(utterance);
                    } catch (ttsError) {
                        console.warn('⚠️ TTS 실패:', ttsError);
                    }
                }
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