import React, { useState, useEffect } from "react";
import { Menu, X, Home, Mic, BookOpen, User } from "lucide-react";

// 별도 파일에서 import하는 LogoutButton (실제로는 import LogoutButton from "../button/logoutButton";)
const LogoutButton = () => {
  const handleLogout = () => {
    // 확인 메시지
    const confirmed = window.confirm('로그아웃하시겠습니까?');
    if (!confirmed) return;

    try {
      // 로컬 스토리지 클리어
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('refreshToken');
      
      // 세션 스토리지 클리어
      sessionStorage.clear();
      
      // 로그아웃 성공 메시지
      alert('로그아웃되었습니다.');
      
      // 로그인 페이지로 이동
      window.location.href = '/login';
      
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
    >
      로그아웃
    </button>
  );
};

// NavLink 대신 간단한 링크 컴포넌트 (실제로는 import { NavLink } from "react-router-dom";)
const CustomNavLink = ({ to, children, className, onClick, isActive }) => (
  <a 
    href={to} 
    className={className} 
    onClick={onClick}
    data-active={isActive}
  >
    {children}
  </a>
);

function TopMenuComponent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkPage, setIsDarkPage] = useState(true); // 현재 페이지가 어두운 배경인지
  const [currentPath, setCurrentPath] = useState('/');

  // 페이지 배경 감지 (실제로는 라우터에서 받아올 수 있음)
  useEffect(() => {
    // 현재 경로 감지 (실제 구현에서는 useLocation 사용)
    const path = window.location.pathname || '/';
    setCurrentPath(path);
    
    // 메인 페이지는 어두운 배경, 나머지는 밝은 배경으로 가정
    setIsDarkPage(path === '/' || path === '/main');
  }, []);

  const menuItems = [
    { to: "/translate", label: "양방향 수어 통역", icon: <Mic size={18} /> },
    { to: "/study", label: "학습하기", icon: <BookOpen size={18} /> },
    { to: "/myPage", label: "마이페이지", icon: <User size={18} /> },
  ];

  // 페이지별 스타일 설정
  const getNavStyles = () => {
    if (isDarkPage) {
      return {
        nav: "fixed top-0 left-0 w-full z-50 px-4 py-3 bg-black/20 backdrop-blur-md border-b border-white/10 shadow-lg",
        logo: "flex items-center space-x-2 text-xl font-bold text-white",
        logoIcon: "text-blue-400",
        menuItem: "flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-all duration-200",
        menuItemActive: "text-blue-400 bg-white/10 shadow-md",
        menuItemInactive: "text-white/80 hover:text-blue-300 hover:bg-white/5",
        mobileButton: "text-white",
        mobileMenu: "md:hidden mt-3 px-4 py-4 bg-black/80 backdrop-blur-lg rounded-b-xl shadow-xl space-y-4",
        mobileItemActive: "text-blue-400 bg-white/10",
        mobileItemInactive: "text-white/80 hover:text-blue-300 hover:bg-white/5"
      };
    } else {
      return {
        nav: "fixed top-0 left-0 w-full z-50 px-4 py-3 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-lg",
        logo: "flex items-center space-x-2 text-xl font-bold text-gray-800",
        logoIcon: "text-blue-600",
        menuItem: "flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-all duration-200",
        menuItemActive: "text-blue-600 bg-blue-50 shadow-md",
        menuItemInactive: "text-gray-700 hover:text-blue-600 hover:bg-gray-50",
        mobileButton: "text-gray-800",
        mobileMenu: "md:hidden mt-3 px-4 py-4 bg-white/95 backdrop-blur-lg rounded-b-xl shadow-xl space-y-4 border border-gray-200",
        mobileItemActive: "text-blue-600 bg-blue-50",
        mobileItemInactive: "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
      };
    }
  };

  const styles = getNavStyles();

  return (
    <nav className={styles.nav}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* 로고 */}
        <CustomNavLink
          to="/"
          className={styles.logo}
          onClick={() => setMobileOpen(false)}
        >
          <Home size={22} className={styles.logoIcon} />
          <span className="hidden sm:inline">수담</span>
        </CustomNavLink>

        {/* 데스크탑 메뉴 */}
        <div className="hidden md:flex flex-1 justify-center gap-8">
          {menuItems.map((item) => {
            const isActive = currentPath === item.to;
            return (
              <CustomNavLink
                key={item.to}
                to={item.to}
                className={`${styles.menuItem} ${
                  isActive ? styles.menuItemActive : styles.menuItemInactive
                }`}
                onClick={() => {
                  setCurrentPath(item.to);
                  // 페이지 이동 시 배경 타입 변경
                  setIsDarkPage(item.to === '/' || item.to === '/main');
                }}
              >
                {item.icon}
                {item.label}
              </CustomNavLink>
            );
          })}
        </div>

        {/* 로그아웃 버튼 */}
        <div className="hidden md:block">
          <LogoutButton />
        </div>

        {/* 모바일 메뉴 버튼 */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={styles.mobileButton}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {menuItems.map((item) => {
            const isActive = currentPath === item.to;
            return (
              <CustomNavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  setMobileOpen(false);
                  setCurrentPath(item.to);
                  setIsDarkPage(item.to === '/' || item.to === '/main');
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive ? styles.mobileItemActive : styles.mobileItemInactive
                }`}
              >
                {item.icon}
                {item.label}
              </CustomNavLink>
            );
          })}
          <LogoutButton />
        </div>
      )}
    </nav>
  );
}

export default TopMenuComponent;