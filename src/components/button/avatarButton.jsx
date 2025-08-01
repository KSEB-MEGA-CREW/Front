// useNavigate 이용 (react-router-dom v6+)
import { useNavigate } from "react-router-dom";

function AvatarButton() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-8">
    <button
      onClick={() => navigate("/translate/avatar")}
      className="px-8 py-4 text-white text-xl font-medium rounded-2xl shadow-lg
                 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400
                 hover:from-sky-500 hover:to-blue-500
                 transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105
                 backdrop-blur-md bg-opacity-80 border border-white/20"
    >
      🎬 아바타 번역으로 이동
    </button>
    </div>
  );
}

export default AvatarButton;
