import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { authApi, validateToken } from "../api/authApi";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  // console.log("useAuth context:", context); // 디버깅용 로그
  console.trace("useAuth가 호출되었습니다.");
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
        console.log("Auth 초기화 오류:", error);
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
    if (!token || !user) {
      console.error("Login failed: Invalid auth data");
      return;
    }

    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    authApi.logout();
  };

  // ✅ value 객체를 useMemo로 감싸줍니다.
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!token && !!user,
    }),
    [user, token, loading]
  ); // 의존성 배열에 관련 상태를 넣어줍니다.

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// import { createContext, useState, useEffect, useContext } from "react";
// import { useCookies } from "react-cookie";
// import { authAPI } from "../api/authApi";

// export const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// export function AuthContextProvider({ children }) {
//   const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);

//   // 1. localStorage에서 user 초기값 불러오기
//   const [user, setUser] = useState(() => {
//     const data = localStorage.getItem("user");
//     return data ? JSON.parse(data) : null;
//   });

//   const [loading, setLoading] = useState(true);

//   // 2. user가 바뀔 때마다 localStorage 동기화
//   useEffect(() => {
//     if (user) {
//       localStorage.setItem("user", JSON.stringify(user));
//     } else {
//       localStorage.removeItem("user");
//     }
//   }, [user]);

//   useEffect(() => {
//     const checkUserStatus = async () => {
//       if (user) {
//         setLoading(false);
//         return;
//       }
//       const token = cookies.accessToken;
//       if (token) {
//         try {
//           const response = await authAPI.getCurrentUser(token);
//           if (response.success) {
//             setUser(response.data);
//           } else {
//             removeCookie("accessToken", { path: "/" });
//             setUser(null);
//           }
//         } catch (error) {
//           console.error("Failed to fetch user:", error);
//           removeCookie("accessToken", { path: "/" });
//           setUser(null);
//         }
//       }
//       setLoading(false);
//     };
//     checkUserStatus();
//   }, [cookies.accessToken, removeCookie]);

//   const login = (authData) => {
//     if (!authData || !authData.token || !authData.user) {
//       console.error("Login failed: Invalid auth data received.");
//       return;
//     }
//     const expires = new Date(Date.now() + 3 * 60 * 60 * 1000); //3시간 후 만료
//     expires.setDate(expires.getDate() + 1);
//     setCookie("accessToken", authData.token, {
//       path: "/",
//       expires,
//       sameSite: "strict",
//     });
//     setUser(authData.user);
//   };

//   const logout = () => {
//     removeCookie("accessToken", { path: "/" });
//     setUser(null);
//   };

//   const value = {
//     user,
//     isAuthenticated: !!user,
//     login,
//     logout,
//     isLoading: loading,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// }
