import { createContext, useState, useEffect } from "react";
import { getCookie, setCookie, removeCookie } from "../components/cookie";
import axios from "axios";

export const TestContext = createContext();

function TestContextWrapper({ children }) {
  const [account, setAccount] = useState({ uid: "", nickname: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie("accessToken");
    if (token) {
      console.log("testContext - 토큰 있음");
      axios
        .get("http://localhost:3000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("testContext - 그 토큰이 유효함");
          setAccount({ uid: res.data.uid, nickname: res.data.nickname });
          console.log("uid는 ", res.data.uid);
        })
        .catch(() => {
          console.log("testContext - 그 토큰이 유효하지 않음");
          setAccount({ uid: "", nickname: "" });
          removeCookie("accessToken", { path: "/" });
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signin = (uid, nickname, token) => {
    setAccount({ uid, nickname });
    console.log("testContext - signin");
    setCookie("accessToken", token, {
      path: "/",
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 60 * 3, // 3시간
    });
  };

  const signout = () => {
    setAccount({ uid: "", nickname: "" });
    removeCookie("accessToken", { path: "/" });
  };

  if (loading) return null;

  console.log("testContextWrapper - return앞");
  return (
    <TestContext.Provider value={{ account, signin, signout }}>
      {children}
    </TestContext.Provider>
  );
}

export default TestContextWrapper;
