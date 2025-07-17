import { createContext, useState, useEffect, useContext } from "react";
import { useCookies } from "react-cookie";
import { authAPI } from "../api/authApi";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthContextProvider({ children }) {
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      // user 상태가 이미 있으면(로그인 직후) 불필요한 API 호출을 건너뜁니다.
      if (user) {
        setLoading(false);
        return;
      }

      const token = cookies.accessToken;
      if (token) {
        try {
          const response = await authAPI.getCurrentUser(token);
          if (response.success) {
            setUser(response.data);
          } else {
            removeCookie("accessToken", { path: "/" });
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          removeCookie("accessToken", { path: "/" });
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUserStatus();
  }, [cookies.accessToken, removeCookie]);

  const login = (authData) => {
    console.log("df");
    if (!authData || !authData.token || !authData.user) {
      console.error("Login failed: Invalid auth data received.");
      return;
    }

    const expires = new Date();
    expires.setDate(expires.getDate() + 1); // 1일 후 만료
    console.log("토큰", authData.token);
    setCookie("accessToken", authData.token, {
      path: "/",
      expires,
      sameSite: "strict",
    });
    setUser(authData.user);
  };

  const logout = () => {
    removeCookie("accessToken", { path: "/" });
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading: loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
