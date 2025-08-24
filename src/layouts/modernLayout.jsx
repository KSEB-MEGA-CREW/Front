import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../Context/themeContext';
import SideMenu from '../components/navigation/sideMenu';

const ModernLayout = ({ children, showMyPage }) => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(true);
  const { theme, isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    // 모바일에서는 메뉴 닫기
    if (window.innerWidth < 768) {
      setIsSideMenuOpen(false);
    }
  };

  const handleShowMyPage = () => {
    if (showMyPage) showMyPage();
    // 모바일에서는 메뉴 닫기
    if (window.innerWidth < 768) {
      setIsSideMenuOpen(false);
    }
  };

  const handleShowStats = () => {
    navigate('/stats');
    // 모바일에서는 메뉴 닫기
    if (window.innerWidth < 768) {
      setIsSideMenuOpen(false);
    }
  };

  const handleShowSettings = () => {
    navigate('/settings');
    // 모바일에서는 메뉴 닫기
    if (window.innerWidth < 768) {
      setIsSideMenuOpen(false);
    }
  };

  const handleShowQuiz = () => {
    navigate('/study');
    // 모바일에서는 메뉴 닫기
    if (window.innerWidth < 768) {
      setIsSideMenuOpen(false);
    }
  };

  const handleShowIncorrectAnswer = () => {
    navigate('/incorrect-answer');
    // 모바일에서는 메뉴 닫기
    if (window.innerWidth < 768) {
      setIsSideMenuOpen(false);
    }
  };

  return (
    <div className={`flex h-screen ${
      theme === 'dark' ? 'dark' : (theme === 'high-contrast' ? 'high-contrast' : '')
    }`}>
      {/* 사이드 메뉴 */}
      <SideMenu
        isOpen={isSideMenuOpen}
        setIsOpen={setIsSideMenuOpen}
        onNavigate={handleNavigate}
        onShowMyPage={handleShowMyPage}
        onShowStats={handleShowStats}
        onShowSettings={handleShowSettings}
        onShowQuiz={handleShowQuiz}
        onShowIncorrectAnswer={handleShowIncorrectAnswer}
      />

      {/* 메인 콘텐츠 영역 */}
      <div className={`
        flex-1 flex flex-col transition-all duration-300
        ${isSideMenuOpen ? 'md:ml-64' : 'md:ml-16'}
        ${theme === 'high-contrast' 
          ? 'bg-black' 
          : (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')
        }
      `}>
        {/* 모바일용 상단 헤더 (필요한 경우) */}
        <div className={`
          md:hidden h-16 flex items-center justify-between px-4 border-b
          ${theme === 'high-contrast'
            ? 'bg-black border-yellow-400 border-b-4'
            : (isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200')
          }
        `}>
          <button
            onClick={() => setIsSideMenuOpen(true)}
            className={`p-2 rounded-lg ${
              theme === 'high-contrast'
                ? 'hc-button'
                : (isDarkMode
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600')
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className={`font-bold text-lg ${
            theme === 'high-contrast'
              ? 'text-yellow-400'
              : (isDarkMode ? 'text-white' : 'text-gray-900')
          }`}>
            수담
          </div>
          <div className="w-8"></div> {/* 균형을 위한 스페이서 */}
        </div>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ModernLayout;