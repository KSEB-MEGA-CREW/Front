import { useAuth } from "../../Context/authContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  // const { signout } = useContext(AuthContext); -> 이 부분을 수정
  const { logout } = useAuth(); // useAuth 훅에서 logout 함수를 가져옵니다.
  const navigate = useNavigate();

  const handleLogout = () => {
    // signout(); -> 함수 이름을 맞춥니다.
    logout();
    navigate("/login"); // 로그아웃 후 로그인 페이지로 이동
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
    >
      로그아웃
    </button>
  );
}

export default LogoutButton;
