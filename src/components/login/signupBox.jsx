import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../../api/authApi";

const SignUpBox = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    hearing: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "사용자명을 입력해주세요.";
    } else if (formData.username.length < 2 || formData.username.length > 20) {
      newErrors.username = "사용자명은 2자 이상 20자 이하여야 합니다.";
    }

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    if (!formData.hearing) {
      newErrors.hearing = "청각상태를 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        hearing: formData.hearing,
      };
      const response = await authApi.signup(signupData);
      if (response.success) {
        navigate("/auth/login");
      } else {
        setErrors({ submit: response.message || "회원가입에 실패했습니다." });
      }
    } catch (error) {
      if (error.message.includes("이미 존재하는 이메일")) {
        setErrors({ email: "이미 존재하는 이메일입니다." });
      } else if (error.message.includes("이미 존재하는 닉네임")) {
        setErrors({ username: "이미 존재하는 사용자명입니다." });
      } else {
        setErrors({
          submit: error.message || "회원가입 중 오류가 발생했습니다.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

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
      <h2 className="text-2xl font-bold text-center text-white mb-6">
        회원가입
      </h2>
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          name="username"
          type="text"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="사용자명 (2-20자)"
          required
          className="w-full px-4 py-3 rounded-xl border border-white/20 text-white placeholder-white/60 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
        />
        {errors.username && (
          <p className="text-sm text-red-400 mt-1">{errors.username}</p>
        )}
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="이메일"
          required
          className="w-full px-4 py-3 rounded-xl border border-white/20 text-white placeholder-white/60 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
        />
        {errors.email && (
          <p className="text-sm text-red-400 mt-1">{errors.email}</p>
        )}
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="비밀번호 (8자 이상, 영문/숫자/특수문자)"
          required
          className="w-full px-4 py-3 rounded-xl border border-white/20 text-white placeholder-white/60 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
        />
        {errors.password && (
          <p className="text-sm text-red-400 mt-1">{errors.password}</p>
        )}
        <input
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="비밀번호 확인"
          required
          className="w-full px-4 py-3 rounded-xl border border-white/20 text-white placeholder-white/60 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>
        )}
        <div>
          <label className="block text-white/70 mb-1 font-semibold">
            청각상태
          </label>
          <div className="flex flex-col space-y-3">
            {" "}
            {/* 위아래 줄거리 3단위 */}
            <label className="flex items-center space-x-2 text-white/80 pb-1">
              {" "}
              {/* 위쪽 청인 */}
              <input
                type="radio"
                name="hearing"
                value="hardtohear"
                checked={formData.hearing === "hardtohear"}
                onChange={handleInputChange}
                required
              />
              <span>청인: 소리를 듣는 데 어려움이 없는 사람</span>
            </label>
            <label className="flex items-center space-x-2 text-white/80 pt-1">
              {" "}
              {/* 아래쪽 농인 */}
              <input
                type="radio"
                name="hearing"
                value="deaf"
                checked={formData.hearing === "deaf"}
                onChange={handleInputChange}
              />
              <span>농인: 소리를 듣는 데 어려움을 겪는 사람</span>
            </label>
          </div>
        </div>
        {errors.hearing && (
          <p className="text-sm text-red-400">{errors.hearing}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white font-medium rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 border border-white/20 backdrop-blur-md transform hover:scale-105 transition-all"
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
        {errors.submit && (
          <p className="text-sm text-red-400 text-center mt-2">
            {errors.submit}
          </p>
        )}
      </form>
      <div className="text-sm text-center text-white/80 mt-6">
        이미 계정이 있으신가요?{" "}
        <Link to="/auth/login" className="underline hover:text-white">
          로그인
        </Link>
      </div>
    </div>
  );
};

export default SignUpBox;
