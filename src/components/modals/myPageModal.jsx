import React from 'react';
import { X, User, Mail, Calendar, Award } from 'lucide-react';
import { useAuth } from '../../Context/authContext';
import { useTheme } from '../../Context/themeContext';

const MyPageModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 콘텐츠 */}
      <div className={`
        relative w-full max-w-md mx-4 rounded-2xl shadow-2xl transform transition-all
        ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            내 계정
          </h2>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <X size={20} />
          </button>
        </div>

        {/* 사용자 정보 */}
        <div className="p-6 space-y-6">
          
          {/* 프로필 이미지 및 기본 정보 */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className={`
                w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold
                ${isDarkMode 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                  : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                }
              `}>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.username || '사용자'}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                수어 학습자
              </p>
            </div>
          </div>

          {/* 계정 정보 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}
              `}>
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  사용자명
                </p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.username || '사용자'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}
              `}>
                <Mail size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  이메일
                </p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}
              `}>
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  가입일
                </p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '2024년 1월 1일'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}
              `}>
                <Award size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  학습 레벨
                </p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  초급자
                </p>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className={`
              w-full p-3 rounded-lg font-medium transition-colors
              ${isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}>
              프로필 수정
            </button>
            <button className={`
              w-full p-3 rounded-lg font-medium transition-colors border
              ${isDarkMode 
                ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                : 'border-gray-300 hover:bg-gray-100 text-gray-700'
              }
            `}>
              학습 기록 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPageModal;