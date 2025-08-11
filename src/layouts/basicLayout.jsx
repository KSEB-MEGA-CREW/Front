import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import TopMenuComponent from "../components/menu/topMenu";
import ModernLayout from "./modernLayout";
import StatsPage from "../pages/statsPage/statsPage";
import SettingsPage from "../pages/settingsPage/settingsPage";
import MyPageModal from "../components/modals/myPageModal";

function BasicLayout({ children }) {
  const location = useLocation();
  const [showMyPageModal, setShowMyPageModal] = useState(false);
  const [currentView, setCurrentView] = useState('main'); // 'main', 'stats', 'settings'
  
  const isHomePage = location.pathname === "/" || location.pathname === "/main";

  // 홈페이지는 기존 레이아웃 유지
  if (isHomePage) {
    return (
      <div className="min-h-screen">
        <TopMenuComponent />
        <div>{children}</div>
      </div>
    );
  }

  // 다른 페이지들은 새로운 모던 레이아웃 사용
  const handleShowMyPage = () => {
    setShowMyPageModal(true);
  };

  const handleShowStats = () => {
    setCurrentView('stats');
  };

  const handleShowSettings = () => {
    setCurrentView('settings');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'stats':
        return <StatsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <div className="p-6">
            {children}
          </div>
        );
    }
  };

  return (
    <>
      <ModernLayout
        showMyPage={handleShowMyPage}
        showStats={handleShowStats}
        showSettings={handleShowSettings}
      >
        {renderContent()}
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
