import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../api/authApi";

export default function SignUpPage() {
  // 기존 상태 유지
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    hearing: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 마우스 위치 상태
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const navigate = useNavigate();

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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await authAPI.signup({
        name: formData.nickname,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        hearing: formData.hearing,
      });

      if (response.success) {
        alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
        navigate("/login");
      } else {
        setError(response.message || "회원가입에 실패했습니다.");
      }
    } catch {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 배경 스타일
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
    background: `
      radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
        rgba(255, 255, 255, 0.15) 0%,
        rgba(120, 119, 198, 0.07) 20%,
        transparent 50%)
    `,
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
    background: `
      radial-gradient(2px 2px at 20px 30px, #eee, transparent),
      radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 90px 40px, #fff, transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
      radial-gradient(2px 2px at 160px 30px, #ddd, transparent)
    `,
    backgroundRepeat: "repeat",
    backgroundSize: "200px 100px",
    animation: "twinkle 4s ease-in-out infinite alternate",
    opacity: 0.5,
    zIndex: 2,
    pointerEvents: "none",
  };

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
        {/* 왼쪽 소개 */}
        <div className="flex-1 flex items-center justify-center pl-24">
          <div className="text-white">
            <h1
              className="text-8xl font-thin mb-8 tracking-widest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              수담
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
        {/* 오른쪽: 회원가입 폼 */}
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
            <h2 className="text-2xl font-bold text-center text-white mb-6">
              회원가입
            </h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <input
                name="nickname"
                type="text"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="닉네임"
                required
                className="w-full px-4 py-3 rounded-xl border border-white/20 text-white placeholder-white/60 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="이메일"
                required
                className="w-full px-4 py-3 rounded-xl border border-white/20 text-white placeholder-white/60 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              />
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호"
                required
                className="w-full px-4 py-3 rounded-xl border border-white/20 text-white placeholder-white/60 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              />
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="비밀번호 확인"
                required
                className="w-full px-4 py-3 rounded-xl border border-white/20 text-white placeholder-white/60 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              />
              {/* 성별 */}
              <div>
                <label className="block text-white/70 mb-1 font-semibold">
                  성별
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 text-white/80">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={handleInputChange}
                      required
                    />
                    <span>남성</span>
                  </label>
                  <label className="flex items-center space-x-2 text-white/80">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={handleInputChange}
                    />
                    <span>여성</span>
                  </label>
                  <label className="flex items-center space-x-2 text-white/80">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === "other"}
                      onChange={handleInputChange}
                    />
                    <span>기타</span>
                  </label>
                </div>
              </div>
              {/* 청각 */}
              <div>
                <label className="block text-white/70 mb-1 font-semibold">
                  청각상태
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 text-white/80">
                    <input
                      type="radio"
                      name="hearing"
                      value="hardtohear"
                      checked={formData.hearing === "hardtohear"}
                      onChange={handleInputChange}
                      required
                    />
                    <span>난청(60-89dB)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-white/80">
                    <input
                      type="radio"
                      name="hearing"
                      value="deaf"
                      checked={formData.hearing === "deaf"}
                      onChange={handleInputChange}
                    />
                    <span>농(90dB 이상)</span>
                  </label>
                </div>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white font-medium rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 border border-white/20 backdrop-blur-md transform hover:scale-105 transition-all"
              >
                {loading ? "가입 중..." : "회원가입"}
              </button>
            </form>
            <div className="text-sm text-center text-white/80 mt-6">
              이미 계정이 있으신가요?{" "}
              <Link to="/login" className="underline hover:text-white">
                로그인
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
