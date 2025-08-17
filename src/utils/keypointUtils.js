import { MEDIAPIPE_CONFIG } from '../constants/videoConfig.js'; // .js 확장자 추가

export const keypointUtils = {
    /**
     * MediaPipe 결과를 194차원 키포인트 배열로 변환 (감지 순서대로 처리)
     * @param {Object} results - MediaPipe Hands 결과
     * @returns {Array<number>} 194차원 키포인트 배열
     */
    normalizeKeypoints(results) {
        const keypoints = [];

        try {
            const detectedHands = results.multiHandLandmarks || [];
            const worldLandmarks = results.multiHandWorldLandmarks || [];

            // 감지된 순서대로 최대 2개 손 처리
            for (let i = 0; i < Math.min(2, detectedHands.length); i++) {
                this.addHandKeypoints(keypoints, detectedHands[i], worldLandmarks[i]);
            }

            // 감지된 손이 2개 미만인 경우 빈 손으로 채움
            while (keypoints.length < MEDIAPIPE_CONFIG.KEYPOINT_DIMENSIONS) {
                this.addEmptyHandKeypoints(keypoints);
            }

            // 정확히 194차원 보장
            return keypoints.slice(0, MEDIAPIPE_CONFIG.KEYPOINT_DIMENSIONS);

        } catch (error) {
            console.error('Keypoint normalization error:', error);
            return new Array(MEDIAPIPE_CONFIG.KEYPOINT_DIMENSIONS).fill(0.0);
        }
    },

    /**
     * 한 손의 키포인트를 배열에 추가 (97차원)
     * @param {Array} keypoints - 대상 키포인트 배열
     * @param {Array} landmarks - 손 랜드마크 (21개 점)
     * @param {Array} worldLandmarks - 3D 월드 랜드마크 (21개 점)
     */
    addHandKeypoints(keypoints, landmarks, worldLandmarks) {
        // 1. 2D 랜드마크 추가 (21개 × 3 = 63차원)
        if (landmarks && landmarks.length >= 21) {
            for (let i = 0; i < 21; i++) {
                const point = landmarks[i];
                keypoints.push(
                    Number(point.x.toFixed(6)),
                    Number(point.y.toFixed(6)),
                    Number(point.z.toFixed(6))
                );
            }
        } else {
            // 랜드마크가 없으면 63개 0으로 채움
            for (let i = 0; i < 63; i++) {
                keypoints.push(0.0);
            }
        }

        // 2. 3D 월드 랜드마크 추가 (전체 21개 사용하여 63차원) - 수정됨
        if (worldLandmarks && worldLandmarks.length >= 21) {
            for (let i = 0; i < 21; i++) { // 전체 21개 사용
                const point = worldLandmarks[i];
                keypoints.push(
                    Number(point.x.toFixed(6)),
                    Number(point.y.toFixed(6)),
                    Number(point.z.toFixed(6))
                );
            }
        } else {
            // 월드 랜드마크가 없으면 63개 0으로 채움
            for (let i = 0; i < 63; i++) {
                keypoints.push(0.0);
            }
        }

        // 3. 추가 메타데이터 (31차원) - 수정됨
        const currentHandLength = keypoints.length;
        const expectedHandLength = Math.floor(currentHandLength / 97) * 97 + 97;
        const remainingDimensions = expectedHandLength - currentHandLength;

        for (let i = 0; i < remainingDimensions; i++) {
            keypoints.push(0.0);
        }
    },

    /**
     * 빈 손 키포인트 추가 (97개 0값)
     * @param {Array} keypoints - 대상 키포인트 배열
     */
    addEmptyHandKeypoints(keypoints) {
        for (let i = 0; i < 97; i++) {
            keypoints.push(0.0);
        }
    },

    /**
     * 키포인트 배열 유효성 검증
     * @param {Array} keypoints - 키포인트 배열
     * @returns {boolean} 유효성 여부
     */
    validateKeypoints(keypoints) {
        if (!Array.isArray(keypoints)) {
            return false;
        }

        if (keypoints.length !== MEDIAPIPE_CONFIG.KEYPOINT_DIMENSIONS) {
            return false;
        }

        return keypoints.every(point =>
            typeof point === 'number' &&
            !isNaN(point) &&
            isFinite(point)
        );
    },

    /**
     * 키포인트 배열을 정규화 (-1.0 ~ 1.0 범위로 클램핑)
     * @param {Array<number>} keypoints - 원본 키포인트
     * @returns {Array<number>} 정규화된 키포인트
     */
    normalizeRange(keypoints) {
        if (!this.validateKeypoints(keypoints)) {
            return keypoints;
        }

        return keypoints.map(point => {
            return Math.max(-1.0, Math.min(1.0, point));
        });
    },

    /**
     * 키포인트 시퀀스 검증 (10프레임)
     * @param {Array<Array<number>>} sequence - 키포인트 시퀀스
     * @returns {boolean} 유효성 여부
     */
    validateSequence(sequence) {
        if (!Array.isArray(sequence) || sequence.length !== 10) {
            return false;
        }

        return sequence.every(frame => this.validateKeypoints(frame));
    },

    /**
     * 194차원 키포인트를 첫 번째/두 번째 손으로 분리
     * @param {Array<number>} keypoints - 194차원 키포인트
     * @returns {Object} 첫 번째/두 번째 손 키포인트
     */
    separateHands(keypoints) {
        if (!this.validateKeypoints(keypoints)) {
            return { firstHand: null, secondHand: null };
        }

        return {
            firstHand: keypoints.slice(0, 97),
            secondHand: keypoints.slice(97, 194)
        };
    },

    /**
     * 손이 감지되었는지 확인 (0이 아닌 값 존재 여부)
     * @param {Array<number>} handKeypoints - 한 손의 키포인트 (97차원)
     * @returns {boolean} 손 감지 여부
     */
    isHandDetected(handKeypoints) {
        if (!handKeypoints || handKeypoints.length !== 97) {
            return false;
        }

        // 2D 랜드마크 부분 (처음 63개)만 확인
        const landmarks2D = handKeypoints.slice(0, 63);

        // 모든 값이 0이면 손이 감지되지 않은 것
        return landmarks2D.some(point => Math.abs(point) > 0.001);
    },

    /**
     * 감지된 손의 개수 반환
     * @param {Array<number>} keypoints - 194차원 키포인트
     * @returns {number} 감지된 손의 개수 (0, 1, 2)
     */
    getDetectedHandsCount(keypoints) {
        const hands = this.separateHands(keypoints);
        let count = 0;

        if (hands.firstHand && this.isHandDetected(hands.firstHand)) count++;
        if (hands.secondHand && this.isHandDetected(hands.secondHand)) count++;

        return count;
    },

    /**
     * 키포인트 품질 평가 (잡음 또는 불완전한 데이터 감지)
     * @param {Array<number>} keypoints - 194차원 키포인트
     * @returns {Object} 품질 정보
     */
    assessQuality(keypoints) {
        if (!this.validateKeypoints(keypoints)) {
            return {
                isGoodQuality: false,
                confidence: 0,
                issues: ['Invalid keypoints format']
            };
        }

        const hands = this.separateHands(keypoints);
        const detectedCount = this.getDetectedHandsCount(keypoints);
        const issues = [];

        // 손 감지 확인
        if (detectedCount === 0) {
            issues.push('No hands detected');
        }

        // 값의 범위 확인 (극단적 값 감지)
        const hasExtremeValues = keypoints.some(point =>
            Math.abs(point) > 5.0 || (Math.abs(point) < 0.001 && point !== 0)
        );

        if (hasExtremeValues) {
            issues.push('Contains extreme values');
        }

        // 연속성 확인 (급격한 변화 감지) - 개선됨
        let hasJumps = false;
        const landmarks2D = keypoints.slice(0, 63); // 첫 번째 손의 2D 랜드마크만 확인

        for (let i = 3; i < landmarks2D.length; i += 3) {
            const current = landmarks2D.slice(i, i + 3);
            const previous = landmarks2D.slice(i - 3, i);

            // 이전 점이 모두 0이면 스킵 (손이 감지되지 않은 경우)
            if (previous.every(p => Math.abs(p) < 0.001)) continue;

            const distance = Math.sqrt(
                Math.pow(current[0] - previous[0], 2) +
                Math.pow(current[1] - previous[1], 2) +
                Math.pow(current[2] - previous[2], 2)
            );

            if (distance > 0.5) { // 임계값
                hasJumps = true;
                break;
            }
        }

        if (hasJumps) {
            issues.push('Contains position jumps');
        }

        // 전체 품질 점수 계산
        let confidence = 1.0;
        confidence -= issues.length * 0.2;
        confidence = Math.max(0, Math.min(1, confidence));

        return {
            isGoodQuality: issues.length === 0 && detectedCount > 0,
            confidence: confidence,
            detectedHands: detectedCount,
            issues: issues
        };
    },

    /**
     * 디버깅용 키포인트 정보 출력
     * @param {Array<number>} keypoints - 194차원 키포인트
     * @returns {Object} 디버깅 정보
     */
    getDebugInfo(keypoints) {
        if (!this.validateKeypoints(keypoints)) {
            return { error: 'Invalid keypoints' };
        }

        const hands = this.separateHands(keypoints);
        const quality = this.assessQuality(keypoints);

        return {
            totalDimensions: keypoints.length,
            detectedHands: quality.detectedHands,
            firstHandDetected: this.isHandDetected(hands.firstHand),
            secondHandDetected: this.isHandDetected(hands.secondHand),
            quality: quality,
            samplePoints: {
                firstHand: hands.firstHand ? hands.firstHand.slice(0, 6) : null, // 처음 2개 점
                secondHand: hands.secondHand ? hands.secondHand.slice(0, 6) : null
            }
        };
    }
};