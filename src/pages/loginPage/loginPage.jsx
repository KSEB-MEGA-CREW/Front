import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
// 변경점: 카카오, 네이버 인증 URL을 추가로 import 합니다.
import {
  authApi,
  GOOGLE_AUTH_URL,
  KAKAO_AUTH_URL,
  NAVER_AUTH_URL,
} from "../../api/authApi";
import { useAuth } from "../../Context/authContext";
import VideoGuid from "../../components/videoGuide"; // videoGuid.jsx 파일 경로에 맞게 조정하세요

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVideoGuid, setShowVideoGuid] = useState(false); // 동영상 팝업 상태

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) {
      setError("");
    }
  };

  const handleLogin = async (e) => {
    sessionStorage.setItem("loginRedirect", window.location.pathname);
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      console.log("로그인 시도:", formData);
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
      console.error("로그인 오류:", error);
      setError(error.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 변경점: 여러 소셜 로그인을 처리할 수 있도록 수정
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

    console.log(`${provider} 소셜 로그인 시도:`, authUrl);
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleShowVideoGuid = () => setShowVideoGuid(true);
  const handleCloseVideoGuid = () => setShowVideoGuid(false);

  // --- 이하 스타일 관련 코드는 변경 없음 ---
  const backgroundStyle = {
    backgroundImage: "url('/assets/image.png')",
    backgroundSize: "cover",
    backgroundPosition: `${mousePosition.x / 8}% ${mousePosition.y / 8}%`,
    backgroundRepeat: "no-repeat",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 0,
    transition: "background-position 0.4s ease-out",
  };
  const overlayStyle = {
    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.15) 0%, rgba(120, 119, 198, 0.07) 20%, transparent 50%)`,
    transition: "background 0.4s ease",
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    pointerEvents: "none",
  };
  const starsStyle = {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: `radial-gradient(2px 2px at 20px 30px, #eee, transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 90px 40px, #fff, transparent), radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent), radial-gradient(2px 2px at 160px 30px, #ddd, transparent)`,
    backgroundRepeat: "repeat",
    backgroundSize: "200px 100px",
    animation: "twinkle 4s ease-in-out infinite alternate",
    opacity: 0.5,
    zIndex: 2,
    pointerEvents: "none",
  };
  // --- 이상 스타일 관련 코드는 변경 없음 ---

  return (
    <div style={backgroundStyle}>
      <style jsx="true">{`
        @keyframes twinkle {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            opacity: 0.6;
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>

      <div style={starsStyle}></div>
      <div style={overlayStyle}></div>

      <div className="flex w-full h-full relative z-10">
        {/* 왼쪽 소개 섹션 */}
        <div className="flex-1 flex items-center justify-center pl-24">
          <div className="text-white">
            <h1
              className="text-8xl font-thin mb-8 tracking-widest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              수담, 手談
            </h1>
            <p
              className="text-3xl font-light mb-6 tracking-wide"
              style={{ fontFamily: "Georgia, serif" }}
            >
              "소통의 장벽을 허물다."
            </p>
            <div
              className="text-xl leading-relaxed opacity-90 font-light text-left max-w-2xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <p>누구나 자유롭게 이야기하고 이해받을 수 있도록,</p>
              <p>우리는 기술로 세상의 모든 말과 귀가 되어</p>
              <p>경계 없는 소통을 완성합니다.</p>
            </div>
          </div>
        </div>

        <div className="w-px bg-white opacity-30 my-16"></div>

        {/* 오른쪽 로그인 박스 */}
        <div className="flex-1 flex items-center justify-center pr-24">
          <div
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 w-96 shadow-2xl border border-white/10 hover:shadow-3xl transition-all duration-300"
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
                  계정이 없으신가요?{" "}
                  <Link to="/signup" className="underline hover:text-white">
                    회원가입
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={handleShowVideoGuid}
                  className="underline hover:text-white text-white/80"
                >
                  설명 가이드
                </button>
              </div>
            </form>

            {/* 변경점: 소셜 로그인 버튼 섹션 수정 */}
            {/* 변경점: 소셜 로그인 버튼 섹션 수정 */}
            <div className="mt-6 border-t border-white/20 pt-6">
              {/* flex: 가로 정렬, justify-center: 중앙 배치, space-x-4: 버튼 사이 간격 */}
              <div className="flex justify-center space-x-4">
                {/* Google 로그인 버튼 */}
                <button
                  onClick={() => handleSocialLogin("google")}
                  className="transition-transform duration-200 hover:scale-105"
                >
                  <img src="/google.png" alt="구글 로그인" className="h-12" />
                </button>

                {/* Kakao 로그인 버튼 */}
                <button
                  onClick={() => handleSocialLogin("kakao")}
                  className="transition-transform duration-200 hover:scale-105"
                >
                  <img src="/kakao.png" alt="카카오 로그인" className="h-12" />
                </button>

                {/* Naver 로그인 버튼 */}
                <button
                  onClick={() => handleSocialLogin("naver")}
                  className="transition-transform duration-200 hover:scale-105"
                >
                  <img src="/naver.png" alt="네이버 로그인" className="h-12" />
                </button>
              </div>
            </div>
            {/* --- 변경 종료 --- */}

            <div className="mt-4 text-center">
              <a
                href="#"
                className="text-sm text-white/80 hover:text-white underline"
              >
                비밀번호 찾기
              </a>
            </div>
          </div>
        </div>
      </div>

      {showVideoGuid && <VideoGuid onClose={handleCloseVideoGuid} />}
    </div>
  );
}
