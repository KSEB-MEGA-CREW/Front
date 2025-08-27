const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/auth")) {
        window.dispatchEvent(new CustomEvent("auth-expired"));
      }
      throw new Error("인증이 만료되었습니다.");
    }

    if (response.status === 403) {
      throw new Error("접근 권한이 없습니다.");
    }

    if (response.status === 404) {
      throw new Error("요청한 리소스를 찾을 수 없습니다.");
    }

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

  // updateUserProfile 사용자 정보 수정
  updateUserProfile: async (updateData) => {
    try {
      const response = await apiRequest("/api/auth/update-profile", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      // 수정 성공 시 localStorage의 사용자 정보도 업데이트
      if (response.success && response.data) {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return response;
    } catch (error) {
      console.error("프로필 수정 오류:", error);
      throw error;
    }
  },

  // deleteAccount 계정 삭제
  deleteAccount: async () => {
    try {
      const response = await apiRequest("/api/auth/delete-account", {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      console.error("계정 삭제 오류:", error);
      throw error;
    }
  },

  // submitSupportTicket 고객 지원 문의 제출
  submitSupportTicket: async (supportData) => {
    try {
      const response = await apiRequest("/api/support/ticket", {
        method: "POST",
        body: JSON.stringify(supportData),
      });
      return response;
    } catch (error) {
      console.error("지원 문의 제출 오류:", error);
      throw error;
    }
  },

  // getSupportTickets 문의 목록 조회 (개인) - 페이징 지원
  getSupportTickets: async (page = 1, size = 5) => {
    try {
      const response = await apiRequest(
        `/api/support/my-tickets?page=${page}&size=${size}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("내 문의 목록 조회 오류:", error);
      throw error;
    }
  },

  // getPublicSupportTickets 공개 문의 목록 조회 - 페이징 지원
  getPublicSupportTickets: async (page = 1, size = 5) => {
    try {
      const response = await apiRequest(
        `/api/support/public?page=${page}&size=${size}`,
        {
          method: "GET",
        }
      );

      return response;
    } catch (error) {
      console.error("공개 문의 목록 조회 오류:", error);
      throw error;
    }
  },

  // getAllSupportTickets 전체 문의 목록 조회 (관리자용) - 페이징 지원
  getAllSupportTickets: async (page = 1, size = 5) => {
    try {
      const response = await apiRequest(
        `/api/support/admin/tickets?page=${page}&size=${size}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("전체 문의 목록 조회 오류:", error);
      throw error;
    }
  },

  // getSupportTicketByAdminId 관리자 특정 문의 상세 조회
  getSupportTicketByAdminId: async (ticketId) => {
    try {
      const response = await apiRequest(
        `/api/support/admin/tickets/${ticketId}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("문의 상세 조회 오류:", error);
      throw error;
    }
  },

  // getSupportTicketById 특정 문의 상세 조회
  getSupportTicketById: async (ticketId) => {
    try {
      const response = await apiRequest(`/api/support/tickets/${ticketId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("문의 상세 조회 오류:", error);
      throw error;
    }
  },

  // submitSupportReply 관리자 답변 작성
  // 게시글 수정
  updateSupportTicket: async (ticketId, ticketData) => {
    try {
      const response = await apiRequest(`/api/support/tickets/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify(ticketData),
      });
      return response;
    } catch (error) {
      console.error("게시글 수정 오류:", error);
      throw error;
    }
  },

  // 게시글 삭제 (일반 사용자)
  deleteSupportTicket: async (ticketId) => {
    try {
      const response = await apiRequest(`/api/support/tickets/${ticketId}`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      console.error("게시글 삭제 오류:", error);
      throw error;
    }
  },

  // 게시글 삭제 (관리자)
  deleteSupportTicketByAdmin: async (ticketId) => {
    try {
      const response = await apiRequest(
        `/api/support/admin/tickets/${ticketId}`,
        {
          method: "DELETE",
        }
      );
      return response;
    } catch (error) {
      console.error("관리자 게시글 삭제 오류:", error);
      throw error;
    }
  },

  submitSupportReply: async (ticketId, replyData) => {
    try {
      const response = await apiRequest(
        `/api/support/tickets/${ticketId}/reply`,
        {
          method: "POST",
          body: JSON.stringify(replyData),
        }
      );
      return response;
    } catch (error) {
      console.error("답변 작성 오류:", error);
      throw error;
    }
  },

  // postTransHistory 번역 기록에 대한 평가 전송
  postTransHistory: async (historyId, feedback, translatedText, translatedTime) => {
    try {
      const response = await apiRequest("/api/translation-histories/feedback", {
        method: "POST",
        body: JSON.stringify({
          historyId,
          feedback, // 'good' 또는 'bad'
          translatedText, // 번역된 문장
          translatedTime, // 번역된 시간 (ISO string)
        }),
      });
      return response;
    } catch (error) {
      console.error("번역 기록 평가 오류:", error);
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

      return calendarData;
    } catch (error) {
      console.error("월 퀴즈 정보 조회:", error);
      throw error; // 에러가 발생하면 Promise.reject로 넘어감
    }
  },

  // 사용자 오답 조회
  getUserIncorrectAnswers: async (userId) => {
    try {
      const response = await apiRequest(
        `/api/quiz/incorrect-answers/user/${userId}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("오답 조회 오류:", error);
      throw error;
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
  if (!token) {
    return false;
  }

  try {
    const response = await authApi.getCurrentUser(); // 수정: authApi 사용
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
