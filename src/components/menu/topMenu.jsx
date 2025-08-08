import React, { useState, useEffect } from "react";
import { Menu, X, Home, Mic, BookOpen } from "lucide-react";
import LogoutButton from "../button/logoutButton";
import { useAuth } from "../../Context/authContext";

const CustomNavLink = ({ to, children, className, onClick, isActive }) => (
  <a href={to} className={className} onClick={onClick} data-active={isActive}>
    {children}
  </a>
);

function TopMenuComponent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkPage, setIsDarkPage] = useState(true);
  const [currentPath, setCurrentPath] = useState("/");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const path = window.location.pathname || "/";
    setCurrentPath(path);
    setIsDarkPage(path === "/" || path === "/main");
  }, []);

  // 스크롤 기반 네비게이션 숨김/표시 효과
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 스크롤이 100px 이하이거나 위로 스크롤할 때는 보이게 함
      if (currentScrollY < 100 || lastScrollY > currentScrollY) {
        setIsVisible(true);
      } else {
        // 아래로 스크롤할 때는 숨김
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const menuItems = [
    { to: "/translate", label: "양방향 수어 통역", icon: <Mic size={18} /> },
    { to: "/study", label: "학습하기", icon: <BookOpen size={18} /> },
  ];

  const getNavStyles = () =>
    isDarkPage
      ? {
          nav: `sticky top-0 left-0 w-full z-50 px-4 py-3 bg-black/20 backdrop-blur-md border-b border-white/10 shadow-lg transform transition-transform duration-300 ${
            isVisible ? 'translate-y-0' : '-translate-y-full'
          }`,
          logo: "flex items-center space-x-2 text-xl font-bold text-white",
          logoIcon: "text-blue-400",
          menuItem:
            "flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-all duration-200",
          menuItemActive: "text-blue-400 bg-white/10 shadow-md",
          menuItemInactive:
            "text-white/80 hover:text-blue-300 hover:bg-white/5",
          mobileButton: "text-white",
          mobileMenu:
            "md:hidden mt-3 px-4 py-4 bg-black/80 backdrop-blur-lg rounded-b-xl shadow-xl space-y-4",
          mobileItemActive: "text-blue-400 bg-white/10",
          mobileItemInactive:
            "text-white/80 hover:text-blue-300 hover:bg-white/5",
          nickname: "ml-4 cursor-pointer text-blue-300 hover:underline",
          // [추가] 다크모드 로그아웃 버튼 스타일
          logoutButton:
            "text-sm px-4 py-2 rounded-full transition-all duration-200 text-white/80 hover:text-red-400 hover:bg-white/5",
          mobileLogoutButton:
            "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all text-white/80 hover:text-red-400 hover:bg-white/5",
        }
      : {
          nav: `sticky top-0 left-0 w-full z-50 px-4 py-3 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-lg transform transition-transform duration-300 ${
            isVisible ? 'translate-y-0' : '-translate-y-full'
          }`,
          logo: "flex items-center space-x-2 text-xl font-bold text-gray-800",
          logoIcon: "text-blue-600",
          menuItem:
            "flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-all duration-200",
          menuItemActive: "text-blue-600 bg-blue-50 shadow-md",
          menuItemInactive:
            "text-gray-700 hover:text-blue-600 hover:bg-gray-50",
          mobileButton: "text-gray-800",
          mobileMenu:
            "md:hidden mt-3 px-4 py-4 bg-white/95 backdrop-blur-lg rounded-b-xl shadow-xl space-y-4 border border-gray-200",
          mobileItemActive: "text-blue-600 bg-blue-50",
          mobileItemInactive:
            "text-gray-700 hover:text-blue-600 hover:bg-gray-50",
          nickname: "ml-4 cursor-pointer text-blue-600 hover:underline",
          // [추가] 라이트모드 로그아웃 버튼 스타일
          logoutButton:
            "text-sm px-4 py-2 rounded-full transition-all duration-200 text-gray-700 hover:text-red-600 hover:bg-gray-50",
          mobileLogoutButton:
            "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all text-gray-700 hover:text-red-600 hover:bg-gray-50",
        };

  const styles = getNavStyles();

  const handleNicknameClick = (e) => {
    e.preventDefault();
    window.location.href = "/myPage";
  };

  return (
    <nav className={styles.nav}>
      <div className="max-w-7xl mx-auto flex items-center relative">
        {/* 왼쪽: 로고 */}
        <div className="flex flex-1 min-w-0">
          <CustomNavLink
            to="/"
            className={styles.logo}
            onClick={() => setMobileOpen(false)}
          >
            <Home size={22} className={styles.logoIcon} />
            <span className="hidden sm:inline">수담</span>
          </CustomNavLink>
        </div>

        {/* 가운데: 메뉴 */}
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
                  setIsDarkPage(item.to === "/" || item.to === "/main");
                }}
              >
                {item.icon}
                {item.label}
              </CustomNavLink>
            );
          })}
        </div>

        {/* 오른쪽: 로그아웃 버튼 / 닉네임 환영 메세지 */}
        <div className="hidden md:flex flex-1 justify-end items-center">
          {/* [수정] 호버 스타일을 적용하기 위해 className 추가 */}
          <LogoutButton className={styles.logoutButton} />
          {!isLoading && user && (
            <span
              className={styles.nickname}
              onClick={handleNicknameClick}
              tabIndex={0}
              role="button"
              style={{ marginLeft: 12 }}
            >
              {user?.username || "사용자"}님 환영합니다!
            </span>
          )}
        </div>

        {/* 모바일 메뉴 버튼 (항상 오른쪽) */}
        <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2">
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
                  setIsDarkPage(item.to === "/" || item.to === "/main");
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
          {/* [수정] 모바일용 호버 스타일을 적용하기 위해 className 추가 */}
          <LogoutButton className={styles.mobileLogoutButton} />
        </div>
      )}
    </nav>
  );
}

export default TopMenuComponent;
