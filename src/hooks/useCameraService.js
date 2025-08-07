import { useState, useCallback } from "react";
// 카메라 설정/제어

export const useCameraService = () => {
    const [availableDevices, setAvailableDevices] = useState([]);
    const [supportedConstraints, setSupportedConstraints] = useState(null);

    // 사용 가능한 카메라 디바이스 목록
    const getAvailableDevices = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setAvailableDevices(videoDevices);
            return videoDevices;
        } catch {
            return [];
        }
    }, []);

    // 지원되는 제약 조건 확인
    const getSupportedConstraints = useCallback(async () => {
        if (!supportedConstraints) {
            const constraints = navigator.mediaDevices.getSupportedConstraints();
            setSupportedConstraints(constraints);
            return constraints;
        }
        return supportedConstraints;
    }, [supportedConstraints]);

    // 최적의 카메라 제약조건 생성
    const createOptimalConstraints = useCallback((options = {}) => {
        const {
            preferredDeviceId,
            preferredResolution = 'hd',
            preferredFrameRate = 30,
            facingMode = 'user'
        } = options;

        const resolutions = {
            'qvga': { width: 320, height: 240 },
            'vga': { width: 640, height: 480 },
            'hd': { width: 1280, height: 720 },
            'fhd': { width: 1920, height: 1080 }
        };

        const selectedResolution = resolutions[preferredResolution] || resolutions.hd;

        const constraints = {
            video: {
                width: { ideal: selectedResolution.width, min: 640 },
                height: { ideal: selectedResolution.height, min: 480 },
                frameRate: { ideal: preferredFrameRate, min: 10 },
                facingMode: facingMode
            },
            audio: false
        };

        // 특정 디바이스 ID가 지정된 경우
        if (preferredDeviceId) {
            constraints.video.deviceId = { exact: preferredDeviceId };
            delete constraints.video.facingMode;
        }

        return constraints;
    }, []);

    // 카메라 정보 수집
    const getCameraInfo = useCallback(async (stream) => {
        if (!stream) return null;

        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) return null;

        const settings = videoTrack.getSettings();

        return {
            label: videoTrack.label,
            deviceId: settings.deviceId,
            width: settings.width,
            height: settings.height,
            frameRate: settings.frameRate,
            facingMode: settings.facingMode,
            readyState: videoTrack.readyState,
            enabled: videoTrack.enabled
        };
    }, []);

    // 에러 메시지 생성
    const generateErrorMessage = useCallback((error) => {
        const errorMessages = {
            'NotAllowedError': '카메라 사용 권한이 거부되었습니다.',
            'NotFoundError': '사용 가능한 카메라를 찾을 수 없습니다.',
            'NotReadableError': '카메라가 다른 애플리케이션에서 사용 중입니다.',
            'OverconstrainedError': '요청한 카메라 설정을 지원하지 않습니다.',
            'SecurityError': '보안상의 이유로 카메라에 접근할 수 없습니다.',
            'AbortError': '카메라 요청이 중단되었습니다.'
        };

        return errorMessages[error.name] || '카메라 접근 중 오류가 발생했습니다.';
    }, []);

    // 브라우저 호환성 확인
    const checkBrowserSupport = useCallback(() => {
        const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        const hasEnumerateDevices = !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);

        return {
            isSupported: hasGetUserMedia && hasEnumerateDevices,
            hasGetUserMedia,
            hasEnumerateDevices
        };
    }, []);

    return {
        // 상태
        availableDevices,
        supportedConstraints,

        // 메서드
        getAvailableDevices,
        getSupportedConstraints,
        createOptimalConstraints,
        getCameraInfo,
        generateErrorMessage,
        checkBrowserSupport
    };
};