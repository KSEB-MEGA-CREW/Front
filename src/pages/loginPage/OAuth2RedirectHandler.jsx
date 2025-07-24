import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/authContext";

function OAuth2RedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      try {
        setIsLoading(true);

        // URL에서 토큰이나 에러 확인
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const error = params.get("error");

        if (error) {
          console.error("OAuth2 Error:", error);
          setError(getErrorMessage(error));
          setTimeout(() => navigate(`/login?error=${error}`), 2000);
          return;
        }

        if (token) {
          // OAuth2AuthenticationSuccessHandler 연결
          await handleTokenLogin(token);
        }
      } catch (e) {
        console.error("OAuth2 Redirect Error:", e);
        setError("로그인 처리 중 오류가 발생했습니다.");
        setTimeout(() => navigate("/login?error=oauth_failed"), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    const handleTokenLogin = async (token) => {
      localStorage.setItem("token", token);

      const response = await fetch("http://localhost:8080/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userResponse = await response.json();
        if (userResponse.success) {
          login({ token, user: userResponse.data });
          navigate("/", { replace: true });
        }
      } else {
        throw new Error("사용자 정보 조회 실패");
      }
    };

    const handleSessionLogin = async () => {
      // 세션 기반 OAuth2 성공 엔드포인트 호출
      const response = await fetch(
        "http://localhost:8080/api/auth/oauth2/success",
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.token) {
          const { token, userInfo } = result.data;
          localStorage.setItem("token", token);
          login({ token, user: userInfo });
          navigate("/", { replace: true });
        }
      } else {
        throw new Error("OAuth2 로그인 처리 실패");
      }
    };

    const getErrorMessage = (error) => {
      switch (error) {
        case "no_email":
          return "이메일 정보를 가져올 수 없습니다.";
        case "auth_failed":
          return "소셜 로그인에 실패했습니다.";
        case "server_error":
          return "서버 오류가 발생했습니다.";
        default:
          return "알 수 없는 오류가 발생했습니다.";
      }
    };

    handleOAuth2Redirect();
  }, [location, navigate, login]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">로그인 처리 중입니다...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-red-500 mb-4">❌</div>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-500 text-sm">
              로그인 페이지로 이동합니다...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-green-500 mb-4">✅</div>
            <p className="text-green-600">로그인 성공!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OAuth2RedirectHandler;
