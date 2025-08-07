// useNavigate 이용 (react-router-dom v6+)
import { useNavigate } from "react-router-dom";
import { Video } from 'lucide-react';

// TranslatePage에 Outlet 추가해서 자식 컴포넌트가 렌더링되도록

function VideoButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log('VideoButton 클릭됨'); // 디버깅용
    try {
      navigate("/translate/video"); // 라우터 설정에 맞는 올바른 경로
    } catch (error) {
      console.error('Navigation 오류:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-200"
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
          <Video className="w-10 h-10 text-blue-600" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            비디오 번역
          </h3>
          <p className="text-gray-600 leading-relaxed">
            실시간 비디오로<br />
            수어를 번역합니다
          </p>
        </div>
      </div>
      
      {/* 호버 효과 배경 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"></div>
    </button>
  );
}

export default VideoButton;