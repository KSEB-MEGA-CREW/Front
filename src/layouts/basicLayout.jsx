import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authContext";
import { useTheme } from "../Context/themeContext";
import ModernLayout from "./modernLayout";
import MyPageModal from "../components/modals/myPageModal";

function BasicLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [showMyPageModal, setShowMyPageModal] = useState(false);
  
  const isHomePage = location.pathname === "/" || location.pathname === "/main";
  const isPublicPage = ["/about", "/privacy"].includes(location.pathname);

  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
      if (!location.pathname.includes("/auth")) {
        navigate("/auth", { replace: true });
      }
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, [logout, navigate, location.pathname]);

  const handleShowMyPage = () => {
    setShowMyPageModal(true);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div>로딩 중...</div>
      </div>
    );
  }

  // 로그인하지 않은 상태에서 공개 페이지(약관, 개인정보처리방침)에 접근하는 경우
  if (!user && isPublicPage) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className={`min-h-screen ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          {children}
        </div>
      </div>
    );
  }

  // 로그인한 상태이거나 홈페이지인 경우 ModernLayout 사용
  return (
    <>
      <ModernLayout
        showMyPage={handleShowMyPage}
      >
        {/* 홈페이지는 패딩 없이, 다른 페이지는 패딩 있게 */}
        {isHomePage ? (
          <div>{children}</div>
        ) : (
          <div className="p-6">{children}</div>
        )}
      </ModernLayout>
      
      {/* 마이페이지 모달 */}
      <MyPageModal 
        isOpen={showMyPageModal} 
        onClose={() => setShowMyPageModal(false)} 
      />
    </>
  );
}

export default BasicLayout;
