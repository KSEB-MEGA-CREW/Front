import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../Context/authContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const API_BASE_URL =
      import.meta.env.VITE_API_URL || "http://localhost:8080";

    const handleCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      // 에러 처리 로직
      if (error) {
        // 에러 메시지를 사용자 친화적으로 변환
        const errorMessages = {
          no_email: "이메일 정보를 가져올 수 없습니다.",
          server_error: "서버 오류가 발생했습니다.",
          OAuth2_인증_실패: "Google 인증에 실패했습니다.",
          auth_failed: "인증에 실패했습니다.",
        };

        const userFriendlyError =
          errorMessages[error] || "로그인 중 오류가 발생했습니다.";
        alert(userFriendlyError);
        navigate("/auth");
        return;
      }

      // 토큰 존재 확인
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const userResponse = await response.json();

            // 성공적인 응답 확인
            if (userResponse.success) {
              const userData = userResponse.data;

              console.log("authCallback userData:", userData);
              // authContext login 메서드 호출
              login({
                token,
                user: userData,
              });

              // redirect URL 복원
              const redirectUrl =
                sessionStorage.getItem("loginRedirect") || "/";
              sessionStorage.removeItem("loginRedirect");

              navigate(redirectUrl, { replace: true });
            } else {
              // API 응답의 success가 false인 경우
              throw new Error(userResponse.message || "사용자 정보 조회 실패");
            }
          } else {
            // HTTP 상태 코드에 따른 에러 처리
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || "사용자 정보 조회 실패");
          }
        } catch (error) {
          console.error("OAuth2 로그인 처리 오류:", error);

          alert(error.message || "로그인 중 문제가 발생했습니다.");
          navigate("/auth");
        }
      } else {
        // token이 없는 경우
        navigate("/auth");
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          로그인 처리 중...
        </h2>
        <p className="text-gray-600 mb-4">잠시만 기다려주세요.</p>
        <div className="text-xs text-gray-400 break-all">
          {window.location.href}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
