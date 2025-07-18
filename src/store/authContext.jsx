import { createContext, useState, useEffect, useContext } from "react";
import { useCookies } from "react-cookie";
import { authAPI } from "../api/authApi";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthContextProvider({ children }) {
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);

  // 1. localStorage에서 user 초기값 불러오기
  const [user, setUser] = useState(() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  });

  const [loading, setLoading] = useState(true);

  // 2. user가 바뀔 때마다 localStorage 동기화
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    const checkUserStatus = async () => {
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
    if (!authData || !authData.token || !authData.user) {
      console.error("Login failed: Invalid auth data received.");
      return;
    }
    const expires = new Date(Date.now() + 3 * 60 * 60 * 1000); //3시간 후 만료
    expires.setDate(expires.getDate() + 1);
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
