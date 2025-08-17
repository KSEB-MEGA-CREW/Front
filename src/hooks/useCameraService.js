import { useState, useCallback } from "react";

export const useCameraService = () => {
    const [availableDevices, setAvailableDevices] = useState([]);
    const [supportedConstraints, setSupportedConstraints] = useState(null);

    const getAvailableDevices = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setAvailableDevices(videoDevices);
            return videoDevices;
        } catch (err) {
            console.error('Failed to get devices:', err);
            return [];
        }
    }, []);

    const getSupportedConstraints = useCallback(async () => {
        if (!supportedConstraints) {
            const constraints = navigator.mediaDevices.getSupportedConstraints();
            setSupportedConstraints(constraints);
            return constraints;
        }
        return supportedConstraints;
    }, [supportedConstraints]);

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

        if (preferredDeviceId) {
            constraints.video.deviceId = { exact: preferredDeviceId };
            delete constraints.video.facingMode;
        }

        return constraints;
    }, []);

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
        availableDevices,
        supportedConstraints,
        getAvailableDevices,
        getSupportedConstraints,
        createOptimalConstraints,
        getCameraInfo,
        generateErrorMessage,
        checkBrowserSupport
    };
};