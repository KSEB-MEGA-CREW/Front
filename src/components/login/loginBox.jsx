// src/components/LoginBox.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const location = useLocation();

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
        const redirectTo = searchParams.get("redirect") || "/";
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
    const currentUrl = location.pathname + location.search;
    sessionStorage.setItem("loginRedirect", currentUrl);
    // OAuth 리다이렉트는 외부 도메인으로 이동하므로 window.location.href 사용이 적절함
    window.location.href = authUrl;
  };

  useEffect(() => {
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
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="이메일"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-700 text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          required
        />
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-700 text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      {/* 구분선 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-700"></div>
        <span className="text-gray-500 text-sm">또는</span>
        <div className="flex-1 h-px bg-gray-700"></div>
      </div>

      {/* 소셜 로그인 */}
      <div className="space-y-3">
        <button
          onClick={() => handleSocialLogin("google")}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          <img src="/google.png" alt="Google" className="w-5 h-5" />
          Google로 계속하기
        </button>
        <button
          onClick={() => handleSocialLogin("kakao")}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          <img src="/kakao.png" alt="Kakao" className="w-5 h-5" />
          Kakao로 계속하기
        </button>
        <button
          onClick={() => handleSocialLogin("naver")}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          <img src="/naver.png" alt="Naver" className="w-5 h-5" />
          Naver로 계속하기
        </button>
      </div>

      {/* 하단 링크 */}
      <div className="text-center">
        <a
          href="#"
          className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
        >
          비밀번호를 잊으셨나요?
        </a>
      </div>
    </div>
  );
};

export default LoginBox;
