import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/authContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 로딩 중일 때 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{form: location}} 
        replace 
      />
    );
  }

  return children;
};

export default ProtectedRoute;
