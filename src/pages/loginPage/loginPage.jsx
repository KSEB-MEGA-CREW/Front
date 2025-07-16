import { useState } from "react";
import { useAuth } from "../../store/authContext";
import { authAPI, GOOGLE_AUTH_URL, KAKAO_AUTH_URL } from "../../api/authApi";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await authAPI.login(formData);
      console.log("서버로부터 받은 로그인 응답:", response); // 디버깅용 로그

      if (response.success && response.data && response.data.token) {
        login(response.data);
        navigate("/");
      } else {
        setError(response.message || "로그인에 실패했습니다. (서버 응답 오류)");
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href =
      provider === "google" ? GOOGLE_AUTH_URL : KAKAO_AUTH_URL;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">로그인</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="이메일"
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비밀번호"
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500">또는</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleSocialLogin("google")}
            className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white bg-[#4285F4] rounded-md hover:bg-opacity-90"
          >
            <span>Google로 로그인</span>
          </button>
          <button
            onClick={() => handleSocialLogin("kakao")}
            className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-black bg-[#FEE500] rounded-md hover:bg-opacity-90"
          >
            <span>카카오로 로그인</span>
          </button>
        </div>

        <p className="text-sm text-center text-gray-600">
          계정이 없으신가요?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-500 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
