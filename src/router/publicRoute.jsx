import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/authContext";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 상태일 경우 로딩 화면을 표시합니다.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // 만약 사용자가 로그인 되어 있다면(isAuthenticated가 true),
  // 메인 페이지('/')로 리디렉션합니다.
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 로그인 되어 있지 않다면 자식 컴포넌트(로그인, 회원가입 페이지)를 렌더링합니다.
  return children;
};

export default PublicRoute;
