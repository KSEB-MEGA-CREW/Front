import { NetworkService } from './NetworkService.js';

export class AnimationManager {
  constructor() {
    this.networkService = new NetworkService();
    
    // 자주 사용하는 구문 정의
    this.FREQUENT_PHRASES = {
      "안녕하세요": "안녕하세요",
      "감사합니다": "감사합니다", 
      "죄송합니다": "죄송합니다",
      "알겠습니다": "알겠습니다",
      "좋다": "좋다",
      "가다": "가다",
      "잘하다": "잘하다",
      "느리다": "느리다"
    };

    this.predefinedPhrases = [
      { display: "안녕하세요", filename: "안녕하세요" },
      { display: "감사합니다", filename: "감사합니다" },
      { display: "죄송합니다", filename: "죄송합니다" },
      { display: "알겠습니다", filename: "알겠습니다" },
      { display: "좋다", filename: "좋다" },
      { display: "가다", filename: "가다" },
      { display: "잘하다", filename: "잘하다" },
      { display: "느리다", filename: "느리다" },
    ];

    // 애니메이션 상태
    this.currentAnimation = null;
    this.isPlaying = false;
    this.currentMode = null; // 'glb' | 'unity'
    
    // 이벤트 리스너
    this.listeners = new Map();
  }

  /**
   * 자주 사용하는 구문인지 판별
   */
  isFrequentlyUsedPhrase(text) {
    return Object.prototype.hasOwnProperty.call(this.FREQUENT_PHRASES, text.trim());
  }

  /**
   * 애니메이션 모드 결정
   */
  determineAnimationMode(text) {
    return this.isFrequentlyUsedPhrase(text) ? 'glb' : 'unity';
  }

  /**
   * GLB 애니메이션 파일 URL 생성
   */
  getGLBAnimationUrl(text, customFilename = null) {
    let processedText = customFilename;
    
    if (!processedText) {
      const predefined = this.predefinedPhrases.find((p) => p.display === text);
      processedText = predefined 
        ? predefined.filename 
        : text.replace(/ /g, "_");
    }
    
    // 캐시 우회를 위해 타임스탬프 추가
    return `/${processedText}.glb?t=${Date.now()}`;
  }

  /**
   * GLB 파일 존재 여부 확인
   */
  async validateGLBFile(animationUrl) {
    try {
      const response = await fetch(animationUrl);
      const contentType = response.headers.get("Content-Type");

      return response.ok && 
             (contentType === "model/gltf-binary" || response.status === 304);
    } catch (error) {
      console.error("GLB 파일 검증 중 오류:", error);
      return false;
    }
  }

  /**
   * Unity용 좌표 데이터 요청
   */
  async requestUnityCoordinateData(text) {
    try {
      const result = await this.networkService.convertTextToSign({
        text: text,
        userId: this.getCurrentUserId(),
        sessionId: this.generateSessionId()
      });

      return {
        success: result.success,
        data: result.data,
        requestId: result.requestId || `unity-${Date.now()}`
      };
    } catch (error) {
      console.error("Unity 좌표 데이터 요청 실패:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 메인 애니메이션 변환 함수
   */
  async convertTextToAnimation(text, options = {}) {
    if (!text.trim()) {
      throw new Error("텍스트가 비어있습니다.");
    }

    if (this.isPlaying) {
      throw new Error("다른 애니메이션이 재생 중입니다.");
    }

    const mode = this.determineAnimationMode(text);
    this.currentMode = mode;

    this.emit('animationStart', { text, mode });

    try {
      if (mode === 'glb') {
        return await this.handleGLBAnimation(text, options);
      } else {
        return await this.handleUnityAnimation(text, options);
      }
    } catch (error) {
      this.emit('animationError', { text, mode, error });
      throw error;
    }
  }

  /**
   * GLB 애니메이션 처리
   */
  async handleGLBAnimation(text, options = {}) {
    const animationUrl = this.getGLBAnimationUrl(text, options.customFilename);
    
    // GLB 파일 검증
    const isValid = await this.validateGLBFile(animationUrl);
    
    if (!isValid) {
      throw new Error(`GLB 파일을 찾을 수 없습니다: ${animationUrl}`);
    }

    const animationData = {
      id: Date.now(),
      text,
      timestamp: new Date(),
      requestId: `glb-${Date.now()}`,
      status: "READY",
      duration: 3,
      type: "glb",
      animationUrl
    };

    this.currentAnimation = animationData;
    this.isPlaying = true;

    this.emit('glbAnimationReady', animationData);

    return animationData;
  }

  /**
   * Unity 애니메이션 처리
   */
  async handleUnityAnimation(text, options = {}) {
    // Unity 좌표 데이터 요청
    const result = await this.requestUnityCoordinateData(text);
    
    if (!result.success) {
      throw new Error(result.error || "Unity 좌표 데이터 요청 실패");
    }

    const animationData = {
      id: Date.now(),
      text,
      timestamp: new Date(),
      requestId: result.requestId,
      status: "READY",
      duration: this.estimateAnimationDuration(result.data),
      type: "unity",
      coordinateData: result.data
    };

    this.currentAnimation = animationData;
    this.isPlaying = true;

    this.emit('unityAnimationReady', animationData);

    return animationData;
  }

  /**
   * 애니메이션 정지
   */
  stopAnimation() {
    if (!this.isPlaying) return false;

    const previousAnimation = this.currentAnimation;
    
    this.isPlaying = false;
    this.currentAnimation = null;
    this.currentMode = null;

    this.emit('animationStop', previousAnimation);

    return true;
  }

  /**
   * 애니메이션 지속시간 추정
   */
  estimateAnimationDuration(coordinateData) {
    if (!coordinateData || !Array.isArray(coordinateData)) {
      return 3; // 기본값 3초
    }
    return coordinateData.length * 0.1; // 프레임당 100ms
  }

  /**
   * 현재 사용자 ID 가져오기
   */
  getCurrentUserId() {
    // 임시 구현 - 실제로는 인증 시스템에서 가져와야 함
    return localStorage.getItem('userId') || 'anonymous';
  }

  /**
   * 세션 ID 생성
   */
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 이벤트 리스너 등록
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * 이벤트 리스너 제거
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * 이벤트 발생
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`이벤트 콜백 오류 (${event}):`, error);
      }
    });
  }

  /**
   * 현재 상태 조회
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentMode: this.currentMode,
      currentAnimation: this.currentAnimation,
      frequentPhrases: this.predefinedPhrases
    };
  }

  /**
   * 정리
   */
  dispose() {
    this.stopAnimation();
    this.listeners.clear();
    
    if (this.networkService) {
      this.networkService.abort();
    }
  }
}