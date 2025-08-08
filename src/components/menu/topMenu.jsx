import React, { useState, useEffect } from "react";
import { Menu, X, Home, Mic, BookOpen, User, LogOut } from "lucide-react";
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

  const getNavStyles = () => ({
    // Main navigation container
    nav: `fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl transform transition-all duration-500 ease-out ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-90'
    }`,
    
    // Glassmorphism container
    container: isDarkPage 
      ? "bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20"
      : "bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl shadow-gray-900/10",
    
    // Logo styles
    logo: isDarkPage
      ? "flex items-center gap-3 px-4 py-3 text-white hover:text-blue-300 transition-colors duration-200"
      : "flex items-center gap-3 px-4 py-3 text-gray-800 hover:text-blue-600 transition-colors duration-200",
    
    logoIcon: isDarkPage ? "text-blue-400" : "text-blue-600",
    logoText: "text-lg font-bold tracking-tight",
    
    // Menu items - modern pill style
    menuItem: "relative flex items-center gap-3 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
    
    menuItemActive: isDarkPage
      ? "text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-lg backdrop-blur-sm border border-blue-400/30"
      : "text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg border border-blue-200/50",
    
    menuItemInactive: isDarkPage
      ? "text-white/70 hover:text-white hover:bg-white/10 hover:shadow-md"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 hover:shadow-md",
    
    // User section
    userSection: "flex items-center gap-3",
    
    nickname: isDarkPage
      ? "px-3 py-1.5 text-sm text-blue-300 hover:text-blue-200 cursor-pointer transition-colors duration-200"
      : "px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 cursor-pointer transition-colors duration-200",
    
    // Mobile styles
    mobileButton: isDarkPage
      ? "p-2 text-white hover:text-blue-300 hover:bg-white/10 rounded-xl transition-all duration-200"
      : "p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-all duration-200",
    
    mobileMenu: isDarkPage
      ? "absolute top-full left-0 right-0 mt-2 p-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl space-y-2"
      : "absolute top-full left-0 right-0 mt-2 p-4 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl space-y-2",
    
    mobileMenuItem: "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
    
    mobileItemActive: isDarkPage
      ? "text-white bg-blue-500/20 border border-blue-400/30"
      : "text-blue-700 bg-blue-50 border border-blue-200/50",
    
    mobileItemInactive: isDarkPage
      ? "text-white/80 hover:text-white hover:bg-white/10"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
  });

  const styles = getNavStyles();

  const handleNicknameClick = (e) => {
    e.preventDefault();
    window.location.href = "/myPage";
  };

  return (
    <nav className={styles.nav}>
      <div className={`${styles.container} relative`}>
        <div className="flex items-center justify-between px-2 py-2">
          
          {/* Logo Section */}
          <CustomNavLink
            to="/"
            className={styles.logo}
            onClick={() => setMobileOpen(false)}
          >
            <div className={`p-2 rounded-xl ${styles.logoIcon} bg-current/10`}>
              <Home size={20} />
            </div>
            <div className="flex flex-col">
              <span className={`${styles.logoText} hidden sm:block`}>수담</span>
              <span className="text-xs opacity-60 hidden lg:block">Sign Language</span>
            </div>
          </CustomNavLink>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2">
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
                  <div className="p-1.5 rounded-lg bg-current/10">
                    {item.icon}
                  </div>
                  <span className="whitespace-nowrap">{item.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 -z-10" />
                  )}
                </CustomNavLink>
              );
            })}
          </div>

          {/* Tablet Menu (md-lg) */}
          <div className="hidden md:flex lg:hidden items-center gap-2">
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
                  <div className="p-1.5 rounded-lg bg-current/10">
                    {item.icon}
                  </div>
                  <span className="text-xs">{item.label.split(' ')[0]}...</span>
                </CustomNavLink>
              );
            })}
          </div>

          {/* User Section - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoading && user && (
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${isDarkPage ? 'bg-white/10' : 'bg-gray-100'}`}>
                  <User size={16} className={isDarkPage ? 'text-blue-300' : 'text-blue-600'} />
                </div>
                <span
                  className={styles.nickname}
                  onClick={handleNicknameClick}
                  tabIndex={0}
                  role="button"
                >
                  <span className="hidden lg:inline">{user?.username || "사용자"}님</span>
                  <span className="md:inline lg:hidden">{(user?.username || "사용자").slice(0, 3)}</span>
                </span>
              </div>
            )}
            
            <LogoutButton className={`p-2 rounded-xl ${isDarkPage ? 'hover:bg-white/10 text-white/70' : 'hover:bg-gray-100 text-gray-600'} transition-all duration-200 cursor-pointer`}>
              <LogOut size={16} />
            </LogoutButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden ${styles.mobileButton}`}
            aria-label="메뉴 열기"
          >
            <div className="relative w-6 h-6">
              <span className={`absolute inset-0 transform transition-transform duration-300 ${
                mobileOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'
              }`}>
                <Menu size={24} />
              </span>
              <span className={`absolute inset-0 transform transition-transform duration-300 ${
                mobileOpen ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0'
              }`}>
                <X size={24} />
              </span>
            </div>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden transition-all duration-300 ease-out ${
          mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className={styles.mobileMenu}>
            {/* User info at top */}
            {!isLoading && user && (
              <div 
                className={`${styles.mobileMenuItem} ${styles.mobileItemInactive} border-b ${
                  isDarkPage ? 'border-white/10' : 'border-gray-200'
                } pb-3 mb-3 cursor-pointer`}
                onClick={handleNicknameClick}
              >
                <div className={`p-2 rounded-xl ${isDarkPage ? 'bg-white/10' : 'bg-gray-100'}`}>
                  <User size={18} />
                </div>
                <div>
                  <div className="font-medium">{user?.username || "사용자"}님</div>
                  <div className="text-xs opacity-60">마이페이지로 이동</div>
                </div>
              </div>
            )}

            {/* Menu items */}
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
                  className={`${styles.mobileMenuItem} ${
                    isActive ? styles.mobileItemActive : styles.mobileItemInactive
                  }`}
                >
                  <div className="p-2 rounded-xl bg-current/10">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-60">
                      {item.to === '/translate' ? '실시간 수어 번역 서비스' : '수어 학습 및 퀴즈'}
                    </div>
                  </div>
                </CustomNavLink>
              );
            })}

            {/* Logout button */}
            <LogoutButton 
              className={`${styles.mobileMenuItem} ${styles.mobileItemInactive} border-t ${
                isDarkPage ? 'border-white/10' : 'border-gray-200'
              } pt-3 mt-3 w-full text-left`}
              onClick={() => setMobileOpen(false)}
            >
              <div className={`p-2 rounded-xl ${isDarkPage ? 'bg-red-500/10' : 'bg-red-50'}`}>
                <LogOut size={18} className={isDarkPage ? 'text-red-400' : 'text-red-600'} />
              </div>
              <div>
                <div className="font-medium">로그아웃</div>
                <div className="text-xs opacity-60">계정에서 안전하게 로그아웃</div>
              </div>
            </LogoutButton>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default TopMenuComponent;
