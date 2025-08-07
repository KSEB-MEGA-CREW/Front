// src/components/LoginBox.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/authContext";
import {
  authApi,
  GOOGLE_AUTH_URL,
  KAKAO_AUTH_URL,
  NAVER_AUTH_URL,
} from "../../api/authApi";

const LoginBox = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) {
      setError("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authApi.login(formData);
      if (response.success && response.data?.token) {
        login({
          token: response.data.token,
          user: response.data.userInfo,
        });
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get("redirect") || "/";
        navigate(redirectTo, { replace: true });
      } else {
        setError(response.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      setError(error.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    let authUrl;
    switch (provider) {
      case "google":
        authUrl = GOOGLE_AUTH_URL;
        break;
      case "kakao":
        authUrl = KAKAO_AUTH_URL;
        break;
      case "naver":
        authUrl = NAVER_AUTH_URL;
        break;
      default:
        setError(`${provider} 로그인 URL이 설정되지 않았습니다.`);
        return;
    }
    if (!authUrl) {
      setError(`${provider} 로그인 URL이 설정되지 않았습니다.`);
      return;
    }
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem("loginRedirect", currentUrl);
    window.location.href = authUrl;
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMessages = {
        no_email: "이메일 정보를 가져올 수 없습니다.",
        auth_failed: "소셜 로그인에 실패했습니다.",
        oauth_failed: "로그인 처리 중 오류가 발생했습니다.",
        no_token: "토큰을 찾을 수 없습니다.",
        server_error: "서버 오류가 발생했습니다.",
      };
      setError(errorMessages[errorParam] || "알 수 없는 오류가 발생했습니다.");
    }
  }, []);

  return (
    <div
      className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 w-full max-w-sm md:w-96 shadow-2xl border border-white/10 hover:shadow-3xl transition-all duration-300"
      style={{ animation: "float 6s ease-in-out infinite" }}
    >
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <input
          name="email"
          type="email"
          placeholder="이메일"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-xl border border-white/20 text-white placeholder-white/60 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          required
        />
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-3 pr-12 rounded-xl border border-white/20 text-white placeholder-white/60 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
          >
            👁
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white font-medium rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 border border-white/20 backdrop-blur-md transform hover:scale-105 transition-all"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <div className="text-sm text-center text-white/80 space-y-2">
          <div>
            {" "}
            계정이 없으신가요?{" "}
            <Link to="/auth/signup" className="underline hover:text-white">
              회원가입
            </Link>
          </div>
          {/*
           이 버튼은 VideoGuid 팝업을 띄우는 역할을 하므로, 
           해당 팝업의 상태(showVideoGuid)와 핸들러(handleShowVideoGuid)를 
           LoginPage에서 props로 받아와야 합니다. 
           만약 이 버튼이 LoginBox와 직접적인 관련이 없다면 LoginPage로 옮기는 것이 좋습니다.
           여기서는 일단 주석 처리합니다.
          <button
            type="button"
            // onClick={handleShowVideoGuid} 
            className="underline hover:text-white text-white/80"
          >
            설명 가이드
          </button>
          */}
        </div>
      </form>

      <div className="mt-6 border-t border-white/20 pt-6">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleSocialLogin("google")}
            className="transition-transform duration-200 hover:scale-105"
          >
            <img src="/google.png" alt="구글 로그인" className="h-12" />
          </button>
          <button
            onClick={() => handleSocialLogin("kakao")}
            className="transition-transform duration-200 hover:scale-105"
          >
            <img src="/kakao.png" alt="카카오 로그인" className="h-12" />
          </button>
          <button
            onClick={() => handleSocialLogin("naver")}
            className="transition-transform duration-200 hover:scale-105"
          >
            <img src="/naver.png" alt="네이버 로그인" className="h-12" />
          </button>
        </div>
      </div>

      <div className="mt-4 text-center">
        <a
          href="#"
          className="text-sm text-white/80 hover:text-white underline"
        >
          비밀번호 찾기
        </a>
      </div>
    </div>
  );
};

export default LoginBox;
