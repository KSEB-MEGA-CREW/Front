import React from 'react';
import { 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  Settings, 
  LogOut,
  MessageSquare,
  UserCircle,
  Bot,
  Brain
} from 'lucide-react';
import { useAuth } from '../../Context/authContext';
import { useTheme } from '../../Context/themeContext';
import LogoutButton from '../button/logoutButton';

const SideMenu = ({ isOpen, setIsOpen, onNavigate, onShowMyPage, onShowStats, onShowSettings, onShowQuiz }) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  // 메뉴 항목 정의
  const menuItems = [
    {
      icon: <Home size={20} />,
      label: "홈",
      path: "/",
      onClick: () => onNavigate("/")
    },
    {
      icon: <MessageSquare size={20} />,
      label: "수어 → 텍스트",
      path: "/translate/video",
      onClick: () => onNavigate("/translate/video")
    },
    {
      icon: <Bot size={20} />,
      label: "텍스트 → 아바타", 
      path: "/translate/avatar",
      onClick: () => onNavigate("/translate/avatar")
    },
    {
      icon: <Brain size={20} />,
      label: "퀴즈",
      onClick: onShowQuiz
    },
    {
      icon: <BarChart3 size={20} />,
      label: "통계",
      onClick: onShowStats
    }
  ];

  return (
    <>
      {/* 모바일용 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 사이드 메뉴 */}
      <div className={`
        fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-16'}
        ${isDarkMode 
          ? 'bg-gray-900 border-r border-gray-800' 
          : 'bg-white border-r border-gray-200'
        }
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {isOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">수</span>
              </div>
              <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                수담
              </span>
            </div>
          )}
          
          {/* 토글 버튼 */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* 메뉴 항목들 */}
        <div className="flex-1 py-4">
          <nav className="space-y-2 px-3">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                  ${isDarkMode
                    ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                {isOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* 하단 사용자 영역 */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2">
          {/* 계정 버튼 */}
          <button
            onClick={onShowMyPage}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-colors
              ${isDarkMode
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }
            `}
          >
            <div className="flex-shrink-0">
              <UserCircle size={20} />
            </div>
            {isOpen && (
              <div className="text-left">
                <div className="font-medium">{user?.username || '사용자'}</div>
                <div className="text-xs opacity-60">계정 설정</div>
              </div>
            )}
          </button>

          {/* 설정 버튼 */}
          <button
            onClick={onShowSettings}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-colors
              ${isDarkMode
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }
            `}
          >
            <div className="flex-shrink-0">
              <Settings size={20} />
            </div>
            {isOpen && (
              <span className="font-medium">설정</span>
            )}
          </button>

          {/* 로그아웃 버튼 */}
          <LogoutButton
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-colors
              ${isDarkMode
                ? 'hover:bg-red-900/50 text-red-400 hover:text-red-300'
                : 'hover:bg-red-50 text-red-600 hover:text-red-700'
              }
            `}
          >
            <div className="flex-shrink-0">
              <LogOut size={20} />
            </div>
            {isOpen && (
              <span className="font-medium">로그아웃</span>
            )}
          </LogoutButton>
        </div>
      </div>
    </>
  );
};

export default SideMenu;