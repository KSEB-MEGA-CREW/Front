// WebSocket 전역 상태 관리 Context
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getGlobalWebSocketManager } from '../services/GlobalWebSocketManager';
import { useAuth } from './authContext';
import { MESSAGE_TYPES } from '../constants/videoConfig';

const WebSocketContext = createContext();

export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext는 WebSocketProvider 내부에서 사용해야 합니다');
    }
    return context;
};

export const WebSocketProvider = ({ children }) => {
    // 연결 상태
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState('CLOSED');
    const [connectionError, setConnectionError] = useState(null);

    // 번역 상태  
    const [translationState, setTranslationState] = useState('idle');
    const [currentSessionId, setCurrentSessionId] = useState(null);

    // 번역 결과 및 통계
    const [lastResult, setLastResult] = useState(null);
    const [sessionStats, setSessionStats] = useState(null);
    const [translationHistory, setTranslationHistory] = useState([]);

    const { user } = useAuth();
    const managerRef = useRef(null);
    const isInitializedRef = useRef(false);

    // GlobalWebSocketManager 초기화
    useEffect(() => {
        if (!managerRef.current) {
            managerRef.current = getGlobalWebSocketManager();
        }
    }, []);

    // 연결 상태 리스너 등록
    useEffect(() => {
        if (!managerRef.current) return;

        const unsubscribeConnection = managerRef.current.onConnectionChange((state) => {
            console.log('🔄 [WebSocketContext] 연결 상태 변경:', state);
            setIsConnected(state.isConnected);
            setConnectionState(state.connectionState);
            
            if (!state.isConnected && connectionError === null) {
                // 연결이 끊어졌지만 아직 에러가 없는 경우
                setConnectionError('서버 연결이 끊어졌습니다');
            } else if (state.isConnected) {
                // 연결이 복구된 경우
                setConnectionError(null);
            }
        });

        const unsubscribeTranslation = managerRef.current.onTranslationChange((state) => {
            console.log('🔄 [WebSocketContext] 번역 상태 변경:', state);
            console.log('🔄 [WebSocketContext] isTranslationActive will be:', state.translationState === 'active');
            setTranslationState(state.translationState);
            setCurrentSessionId(state.currentSessionId);
        });

        return () => {
            unsubscribeConnection();
            unsubscribeTranslation();
        };
    }, [connectionError]);

    // 메시지 핸들러 등록
    useEffect(() => {
        if (!managerRef.current) return;

        // 예측 결과 처리
        managerRef.current.onMessage(MESSAGE_TYPES.PREDICTION_RESULT, (data) => {
            console.log('📨 [WebSocketContext] Prediction result:', data);
            if (data.result) {
                setLastResult(data.result);
                
                // 번역 히스토리에 추가
                setTranslationHistory(prev => [
                    ...prev.slice(-9), // 최대 10개 유지
                    {
                        id: Date.now(),
                        text: data.result.label || data.result,
                        confidence: data.result.confidence || 1.0,
                        timestamp: new Date().toLocaleTimeString(),
                        type: 'prediction'
                    }
                ]);
            }
            if (data.session_stats) {
                setSessionStats(data.session_stats);
            }
        });

        // 번역 결과 처리
        managerRef.current.onMessage(MESSAGE_TYPES.TRANSLATION_RESULT, (data) => {
            console.log('📨 [WebSocketContext] Translation result:', data);
            const result = {
                label: data.sentence || data.result,
                confidence: data.confidence_avg || data.confidence || 1.0,
                type: 'sentence'
            };
            
            setLastResult(result);
            
            // 번역 히스토리에 추가
            setTranslationHistory(prev => [
                ...prev.slice(-9), // 최대 10개 유지
                {
                    id: Date.now(),
                    text: result.label,
                    confidence: result.confidence,
                    timestamp: new Date().toLocaleTimeString(),
                    type: 'translation'
                }
            ]);
        });

        // 에러 처리
        managerRef.current.onMessage(MESSAGE_TYPES.ERROR, (data) => {
            const errorMsg = data.error_message || data.message || "서버 에러가 발생했습니다";
            console.error('📨 [WebSocketContext] Server error:', errorMsg);
            setConnectionError(errorMsg);
        });

        // 상태 업데이트 처리
        managerRef.current.onMessage(MESSAGE_TYPES.TRANSLATION_STATUS, (data) => {
            console.log('📨 [WebSocketContext] Status update:', data);
            // GlobalWebSocketManager에서 이미 처리되므로 추가 작업 불필요
        });

    }, []);

    // 자동 연결 (사용자 정보가 있을 때)
    useEffect(() => {
        if (user?.id && !isInitializedRef.current && managerRef.current) {
            console.log('🚀 [WebSocketContext] 자동 연결 시작');
            connectToServer();
            isInitializedRef.current = true;
        }
    }, [user?.id]);

    // 토큰 검증 및 가져오기
    const getValidToken = useCallback(async () => {
        const token = localStorage.getItem("token") || 
                     sessionStorage.getItem("token") || 
                     localStorage.getItem("authToken");

        if (!token) {
            throw new Error("인증 토큰이 없습니다");
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            
            if (isExpired) {
                throw new Error("토큰이 만료되었습니다");
            }
            
            return token;
        } catch (decodeError) {
            throw new Error("토큰이 유효하지 않습니다");
        }
    }, []);

    // 서버 연결
    const connectToServer = useCallback(async () => {
        if (!managerRef.current) {
            console.error('🚨 [WebSocketContext] GlobalWebSocketManager가 없습니다');
            return false;
        }

        if (!user?.id) {
            setConnectionError("사용자 정보가 없습니다");
            return false;
        }

        try {
            setConnectionError(null);
            console.log('🌐 [WebSocketContext] 연결 시도 중...');
            
            const token = await getValidToken();
            await managerRef.current.connect(token, user.id);
            
            console.log('✅ [WebSocketContext] 연결 성공');
            return true;
        } catch (error) {
            const errorMsg = error.message || "연결에 실패했습니다";
            console.error('🚨 [WebSocketContext] 연결 실패:', errorMsg);
            setConnectionError(errorMsg);
            return false;
        }
    }, [user?.id, getValidToken]);

    // 번역 시작
    const startTranslation = useCallback((sessionId) => {
        if (!managerRef.current) {
            throw new Error('WebSocket 관리자가 없습니다');
        }

        if (!isConnected) {
            throw new Error('서버에 연결되지 않았습니다');
        }

        console.log('🚀 [WebSocketContext] 번역 시작 요청:', sessionId);
        managerRef.current.startTranslation(sessionId);
    }, [isConnected]);

    // 번역 종료
    const stopTranslation = useCallback(() => {
        if (!managerRef.current) {
            console.warn('⚠️ [WebSocketContext] WebSocket 관리자가 없습니다');
            return;
        }

        console.log('🛑 [WebSocketContext] 번역 종료 요청');
        managerRef.current.stopTranslation();
    }, []);

    // 키포인트 전송
    const sendKeypoints = useCallback((keypoints, frameIndex) => {
        if (!managerRef.current) {
            return false;
        }

        return managerRef.current.sendKeypoints(keypoints, frameIndex);
    }, []);

    // 에러 초기화
    const clearError = useCallback(() => {
        setConnectionError(null);
    }, []);

    // 번역 히스토리 초기화
    const clearHistory = useCallback(() => {
        setTranslationHistory([]);
        setLastResult(null);
        setSessionStats(null);
    }, []);

    // 재연결 시도
    const reconnect = useCallback(async () => {
        console.log('🔄 [WebSocketContext] 수동 재연결 시도');
        return await connectToServer();
    }, [connectToServer]);

    // 컨텍스트 값
    const contextValue = {
        // 연결 상태
        isConnected,
        connectionState,
        connectionError,

        // 번역 상태
        translationState,
        currentSessionId,
        isTranslationActive: translationState === 'active',

        // 번역 결과
        lastResult,
        sessionStats,
        translationHistory,

        // 메서드
        connectToServer,
        startTranslation,
        stopTranslation,
        sendKeypoints,
        clearError,
        clearHistory,
        reconnect,

        // 유틸리티
        getConnectionState: () => managerRef.current?.getConnectionState() || 'CLOSED',
        getTranslationState: () => managerRef.current?.getTranslationState() || 'idle',
    };

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};