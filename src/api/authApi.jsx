const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// 토큰 관리
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 공통 API 요청 함수
const apiRequest = async (url, options = {}) => {
  const { headers = {}, ...restOptions } = options;

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
        ...headers,
      },
      cache: "no-cache",
      ...restOptions,
    });

    // 401 처리 (인증 만료))
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // 현재 페이지가 로그인 페이지면 리다이렉트하지 않음 => 굳이 리다이렉트할 필요가 없으므로
      // 현재 페이지가 로그인 페이지가 아닐 때만 리다이렉트
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      throw new Error("인증이 만료되었습니다.");
    }

    // 403 처리l
    if (response.status === 403) {
      throw new Error("접근 권한이 없습니다.");
    }

    // 404 처리
    if (response.status === 404) {
      throw new Error("요청한 리소스를 찾을 수 없습니다.");
    }

    // 500 처리
    if (response.status >= 500) {
      throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("네트워크 연결을 확인해주세요.");
    }
    console.error("API 요청 오류:", error);
    throw error;
  }
};

// API 함수들
export const authApi = {
  // signup with input validation
  signup: async (signupRequest) => {
    // 입력 값 검증
    if (!signupRequest.email || !signupRequest.password) {
      throw new Error('이메일과 비밀번호는 필수입니다.');
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupRequest.email)) {
      throw new Error('유효한 이메일 형식이 아닙니다.');
    }
    
    if (signupRequest.password.length < 6) {
      throw new Error('비밀번호는 6자 이상이어야 합니다.');
    }

    try {
      const response = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(signupRequest),
      });
      return response;
    } catch (error) {
      console.error("회원가입 오류:", error);
      throw error;
    }
  },

  // login with input validation
  login: async (loginRequest) => {
    // 입력 값 검증
    if (!loginRequest.email || !loginRequest.password) {
      throw new Error('이메일과 비밀번호를 입력해주세요.');
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginRequest.email)) {
      throw new Error('유효한 이메일 형식이 아닙니다.');
    }

    try {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(loginRequest),
      });

      // token -> localStorage에 저장 (XSS 보안 고려)
      if (response.success && response.data.token) {
        // JWT 토큰 검증
        try {
          const payload = JSON.parse(atob(response.data.token.split('.')[1]));
          if (payload.exp * 1000 < Date.now()) {
            throw new Error('만료된 토큰입니다.');
          }
        } catch {
          throw new Error('유효하지 않은 토큰입니다.');
        }
        
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.userInfo));
      }
      return response;
    } catch (error) {
      console.error("로그인 오류:", error);
      throw error;
    }
  },

  // getCurrentUser 현재 로그인한 사용자 정보 조회
  getCurrentUser: async () => {
    try {
      const response = await apiRequest("/api/auth/me");
      return response;
    } catch (error) {
      console.error("사용자 정보 조회 오류:", error);
      throw error;
    }
  },

  //logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export const quizApi = {
  getQuiz: async () => {
    try {
      const response = await apiRequest("/api/quiz", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // ✅ 응답 객체 전체를 반환하도록 수정
      return response;
    } catch (error) {
      console.error("퀴즈 조회 오류:", error);
      throw error;
    }
  },
  // 퀴즈 결과 저장 API 추가
  saveQuizResult: async (resultData) => {
    try {
      const response = await apiRequest("/api/quiz/result", {
        method: "POST",
        body: JSON.stringify(resultData),
      });
      return response;
    } catch (error) {
      console.error("퀴즈 결과 저장 오류:", error);
      throw error;
    }
  },

  // quizApi.js의 getUserQuizHistory
  getUserQuizHistory: async (year, month, userId) => {
    try {
      const data = await apiRequest(
        `/api/quiz/quiz-stats/monthly/${year}/${month}/user/${userId}`,
        {
          method: "GET",
        }
      );

      const calendarData = Object.entries(data).map(([date, accuracy]) => ({
        date,
        accuracy,
      }));

      return calendarData; // 배열로 변환하여 반환
      // 또는 객체 그대로 사용/ 여기서 data에 배열이 오길 기대함
    } catch (error) {
      console.error("월 퀴즈 정보 조회:", error);
      throw error; // 에러가 발생하면 Promise.reject로 넘어감
    }
  },
};

// 구글 OAuth2 URL - 구글 로그인 url에 맞게 수정
export const GOOGLE_AUTH_URL = `${API_BASE_URL}/oauth2/authorization/google`;

// 카카오 OAuth2 URL - 카카오 로그인 url에 맞게 수정
// 현재는 구글과 동일하게 설정되어 있지만, 실제 카카오 OAuth2 URL로 변경해야 합니다.
export const KAKAO_AUTH_URL = `${API_BASE_URL}/oauth2/authorization/kakao`;

// 네이버 OAuth2 URL - 네이버 로그인 url에 맞게 수정
// 현재는 구글과 동일하게 설정되어 있지만, 실제 네이버 OAuth2 URL로 변경해야 합니다.
export const NAVER_AUTH_URL = `${API_BASE_URL}/oauth2/authorization/naver`;
// token 유효성 검사를 여기서 처리
export const validateToken = async () => {
  const token = localStorage.getItem("token");
  if (!token || token.trim() === '') {
    return false;
  }

  try {
    // JWT 단순 검증 (만료 시간 체크)
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }

    const response = await authApi.getCurrentUser();
    return response.success;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
};

// 기본 export 추가 (선택사항)
export default {
  authApi,
  quizApi,
  validateToken,
  GOOGLE_AUTH_URL,
  KAKAO_AUTH_URL,
  NAVER_AUTH_URL,
};
