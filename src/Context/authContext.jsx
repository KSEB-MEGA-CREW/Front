import React, { createContext, useState, useEffect, useContext } from "react";
import { authApi, validateToken } from "../api/authApi";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // 초기 로딩 상태

  // 초기화 시 토큰 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          // 토큰 유효성 검증

          const isValid = await validateToken();
          if (isValid) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // 토큰이 유효하지 않으면 로컬스토리지 정리
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Auth 초기화 오류:", error);
        // 에러 발생 시 로컬 스토리지 정리
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = ({ token, user }) => {
    console.log("🔐 AuthContext login 시작:", {
      tokenExists: !!token,
      userExists: !!user,
      userDetails: user,
    });

    if (!token || !user) {
      const errorMsg = "Login failed: Invalid auth data";
      console.error("❌", errorMsg, { token, user });

      // 에러를 상위 컴포넌트로 전파하기 위해 throw
      throw new Error(!token ? "토큰이 없습니다" : "사용자 정보가 없습니다");
    }

    try {
      // 상태 업데이트
      setToken(token);
      setUser(user);

      // localStorage 저장
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 성공 로그
      console.log("✅ AuthContext login 성공:", {
        tokenStored: !!localStorage.getItem("token"),
        userStored: !!localStorage.getItem("user"),
        userRole: user.role,
        username: user.username,
      });

      // 관리자 권한 즉시 확인
      const adminCheck = user?.role === "admin";
      console.log("👑 관리자 권한 확인:", adminCheck);

      return { success: true };
    } catch (error) {
      console.error("❌ localStorage 저장 실패:", error);

      // 실패 시 상태 롤백
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      throw new Error("로그인 정보 저장에 실패했습니다");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    authApi.logout();
  };

  // ***** 추가된 부분 시작 *****
  /**
   * 사용자 프로필 정보를 서버에 업데이트하고 로컬 상태도 동기화하는 함수.
   * MyPageModal 등에서 사용됩니다.
   * @param {object} updatedData - 업데이트할 사용자 정보 필드 (예: { username: "새이름", hearingStatus: "hearing" })
   * @returns {Promise} - 성공/실패 결과
   */
  const updateUser = async (updatedData) => {
    try {
      // 1. 서버에 사용자 정보 업데이트 요청
      const response = await authApi.updateUserProfile(updatedData);

      if (response.success) {
        // 2. 서버에서 반환된 최신 데이터로 로컬 상태 업데이트
        const updatedUser = { ...user, ...response.data };

        // 3. localStorage 업데이트
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // 4. React 상태 업데이트
        setUser(updatedUser);

        return { success: true, data: updatedUser };
      } else {
        throw new Error(response.message || "프로필 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("사용자 정보 업데이트 오류:", error);
      throw error;
    }
  };

  // 관리자 권한 확인 함수
  const isAdmin = () => {
    return user?.role === "admin";
  };

  // ***** 추가된 부분 끝 *****
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAdmin,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
