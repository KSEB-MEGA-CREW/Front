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
        //"Cache-Control": "no-cache",
        //Pragma: "no-cache",
        ...getAuthHeaders(),
        ...headers,
      },
      //credentials: "include",
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
    // debug용 console.log
    console.error("API 요청 오류:", error);
    throw error;
  }
};

// API 함수들
export const authApi = {
  // signup
  signup: async (signupRequest) => {
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

  // login
  login: async (loginRequest) => {
    try {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(loginRequest),
      });

      // token -> localStorage에 저장
      if (response.success && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.userInfo));
      }
      return response;
    } catch (error) {
      console.log("로그인 오류:", error);
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
    // api 호출 비동기 처리
    
    try{
      const reponse = await apiRequest("/api/quiz", {
        method: "POST",
        headers:{ // localStorage에서 토큰 가져와서 post
          'Authorization' : `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data; // ApiResponse 구조에 맞춰 수정
    } catch(error){
      console.error('퀴즈 조회 오류:',error);
      throw error;
    }
  },
  // 퀴즈 결과 저장 API 추가
  saveQuizResult: async (resultData) => {
    try{
      const response = await apiRequest("/api/quiz/result", {
        method: "POST",
        body: JSON.stringify(resultData)
      });
      return reponse;
    }catch(error){
      console.error('퀴즈 결과 저장 오류:', error);
      throw error;
    }
  },
  // 정답률(Accuracy) 데이터 가져오기 => 이거 아직 백엔드에 없습니다!!! 전달 및 확인 부탁!!!
  getWeeklyAccuracy: async () => {
    // API 엔드포인트는 실제 서버와 맞춰주세요!
    const response = await apiRequest("/api/accuracy/weekly", {
      method: "GET",
    });
    return response;
  },
};

// 구글 OAuth2 URL - 구글 로그인 url에 맞게 수정
export const GOOGLE_AUTH_URL = `${API_BASE_URL}/oauth2/authorization/google`;

// token 유효성 검사를 여기서 처리
export const validateToken = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }

  try {
    const response = await authApi.getCurrentUser(); // 수정: authApi 사용
    return response.success;
  } catch (error) {
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
};
