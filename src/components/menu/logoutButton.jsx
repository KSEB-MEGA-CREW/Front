import { useContext } from "react";
import { TestContext } from "../../store/testContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const { signout } = useContext(TestContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    signout();
    navigate("/login"); // 로그아웃 후 로그인 페이지로 이동
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      로그아웃
    </button>
  );
}

export default LogoutButton;
