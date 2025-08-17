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
    <div className="space-y-6">
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <input
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="사용자명 (2-20자)"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-700 text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {errors.username && (
            <p className="text-sm text-red-400 mt-1">{errors.username}</p>
          )}
        </div>

        <div>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="이메일"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-700 text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {errors.email && (
            <p className="text-sm text-red-400 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비밀번호 (8자 이상, 영문/숫자/특수문자)"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-700 text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {errors.password && (
            <p className="text-sm text-red-400 mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="비밀번호 확인"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-700 text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-400 mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* 청각상태 선택 */}
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
          <label className="block text-white font-semibold mb-2">청각상태</label>
          <p className="text-xs text-gray-400 mb-4">
            맞춤형 수어 번역 서비스 제공을 위해 수집됩니다
          </p>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 text-white cursor-pointer">
              <input
                type="radio"
                name="hearing"
                value="NORMAL"
                checked={formData.hearing === "NORMAL"}
                onChange={handleInputChange}
                required
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>청인: 청력에 이상이 없음</span>
            </label>
            <label className="flex items-center space-x-3 text-white cursor-pointer">
              <input
                type="radio"
                name="hearing"
                value="deaf"
                checked={formData.hearing === "deaf"}
                onChange={handleInputChange}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>농인: 청각에 이상이 있음</span>
            </label>
          </div>
          {errors.hearing && (
            <p className="text-sm text-red-400 mt-2">{errors.hearing}</p>
          )}
        </div>

        {errors.submit && (
          <div className="p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-300 text-sm">
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      {/* 약관 동의 텍스트 */}
      <div className="text-xs text-center text-gray-400">
        가입을 진행하시면
        <Link
          to="/about"
          className="text-blue-400 hover:text-blue-300 underline ml-1"
        >
          서비스 이용약관
        </Link>{" "}
        및
        <Link
          to="/privacy"
          className="text-blue-400 hover:text-blue-300 underline ml-1"
        >
          개인정보처리방침
        </Link>
        에 동의하는 것으로 간주됩니다.
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate("../login")}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          이미 계정이 있으신가요? 로그인하기
        </button>
      </div>
    </div>
  );
};

export default SignUpBox;
