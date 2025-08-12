// src/components/button/logoutButton.js

import { useAuth } from "../../Context/authContext";
import { useNavigate } from "react-router-dom";

// children prop을 받도록 수정합니다.
function LogoutButton({ children, className }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <button
      onClick={handleLogout}
      className={className} // className은 SideMenu에서 전달한 것을 그대로 사용
    >
      {/* SideMenu에서 전달한 자식 요소(아이콘, 텍스트 등)를 여기에 렌더링 */}
      {children}
    </button>
  );
}

export default LogoutButton;
