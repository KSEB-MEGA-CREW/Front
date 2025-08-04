// useNavigate 이용 (react-router-dom v6+)
import { useNavigate } from "react-router-dom";
import { User } from 'lucide-react';

function AvatarButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log('AvatarButton 클릭됨'); // 디버깅용
    try {
      navigate("/translate/avatar"); // 라우터 설정에 맞는 올바른 경로
    } catch (error) {
      console.error('Navigation 오류:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-200"
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">
          <User className="w-10 h-10 text-purple-600" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            아바타 번역
          </h3>
          <p className="text-gray-600 leading-relaxed">
            3D 아바타가<br />
            수어를 표현합니다
          </p>
        </div>
      </div>
      
      {/* 호버 효과 배경 */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"></div>
    </button>
  );
}

export default AvatarButton;