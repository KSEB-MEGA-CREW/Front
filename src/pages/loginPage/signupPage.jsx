import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../api/authApi";

function SignUpPage() {
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
  const navigate = useNavigate();

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
        console.log(formData);
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">회원가입</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            name="nickname"
            type="text"
            value={formData.nickname}
            onChange={handleInputChange}
            placeholder="닉네임"
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="이메일"
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비밀번호"
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="비밀번호 확인"
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === "male"}
                onChange={handleInputChange}
                required
              />
              <span>남성 </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === "female"}
                onChange={handleInputChange}
              />
              <span>여성 </span>
            </label>
            <label className="flex items-center space-x-2">
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
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="hearing"
                value="hardtohear"
                checked={formData.hearing === "hardtohear"}
                onChange={handleInputChange}
                required
              />
              <span>난청(60-89dB) </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="hearing"
                value="deaf"
                checked={formData.hearing === "deaf"}
                onChange={handleInputChange}
              />
              <span>농(90dB 이상) </span>
            </label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-500 hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
