// useNavigate 이용 (react-router-dom v6+)
import { useNavigate } from "react-router-dom";

function VideoButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/translate/video")}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
    >
      비디오 번역으로 이동
    </button>
  );
}

export default VideoButton;
