const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// 토큰 관리
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 공통 API 요청 함수
const apiRequest = async (url, options = {}) => {
  const { headers = {}, ...restOptions } = options;
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...headers,
      },
      ...restOptions,
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('인증이 만료되었습니다.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('네트워크 연결을 확인해주세요.');
    }
    throw error;
  }
};

// API 함수들
export const authAPI = {
  login: (loginRequest) => 
    apiRequest('/api/auth/login', {
      method: "POST",
      body: JSON.stringify(loginRequest),
    }),
    
  signup: (signupRequest) => 
    apiRequest('/api/auth/signup', {
      method: "POST",
      body: JSON.stringify(signupRequest),
    }),
    
  getCurrentUser: () => 
    apiRequest('/api/auth/me'),
    
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const quizAPI = {
  getQuiz: (quizRequest) => 
    apiRequest('/api/quiz', {
      method: "POST",
      body: JSON.stringify(quizRequest),
    }),
};

// 구글 로그인 후 리다이렉션 URI에 맞게 변경
const OAUTH2_REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI || "http://localhost:3000/auth/callback/google";

// 구글 OAuth2 URL - 백엔드 엔드포인트에 맞게 수정
export const GOOGLE_AUTH_URL = `${API_BASE_URL}/login/oauth2/code/google`;

// 카카오는 추후 수정 예정
export const KAKAO_AUTH_URL = `${API_BASE_URL}/login/oauth2/code/kakao`;