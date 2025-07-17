import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/authContext";
import { authAPI } from "../../api/authApi";

function OAuth2RedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const error = params.get("error");

      if (error) {
        console.error("OAuth2 Error:", error);
        navigate(`/login?error=${error}`);
        return;
      }

      if (token) {
        try {
          const userResponse = await authAPI.getCurrentUser(token);
          console.log("소셜 로그인 사용자 정보 응답:", userResponse); // 디버깅용 로그

          if (userResponse.success) {
            login({
              token: token,
              user: userResponse.data,
            });
            console.log("user : ", userResponse.data);
            navigate("/");
          } else {
            throw new Error("사용자 정보를 가져오는데 실패했습니다.");
          }
        } catch (e) {
          console.error("OAuth2 Redirect Error:", e);
          navigate("/login?error=oauth_failed");
        }
      } else {
        navigate("/login?error=no_token");
      }
    };

    handleOAuth2Redirect();
  }, [location, navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>로그인 처리 중입니다...</p>
    </div>
  );
}

export default OAuth2RedirectHandler;
