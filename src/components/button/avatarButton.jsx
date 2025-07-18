// useNavigate 이용 (react-router-dom v6+)
import { useNavigate } from "react-router-dom";

function AvatarButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/translate/avatar")}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
    >
      아바타 번역으로 이동
    </button>
  );
}

export default AvatarButton;
