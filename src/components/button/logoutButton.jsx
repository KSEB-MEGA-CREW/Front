import { useAuth } from "../../Context/authContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

function LogoutButton({ className }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 경로가 "/" 또는 "/main" 같은 메인 페이지인지 확인
  const isMainPage = location.pathname === "/" || location.pathname === "/main";

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <button
      onClick={handleLogout}
      className={
        className 
          ? `${className} flex items-center gap-2`
          : `flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-colors duration-200
        ${
          isMainPage
            ? "bg-transparent text-white hover:bg-white/10 hover:text-blue-300"
            : "bg-blue-300 text-white hover:bg-blue-400"
        }`
      }
    >
      <LogOut className="w-4 h-4" />
      로그아웃
    </button>
  );
}

export default LogoutButton;
