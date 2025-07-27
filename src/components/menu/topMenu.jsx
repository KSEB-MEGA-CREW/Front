import { useState } from "react";
import { NavLink } from "react-router-dom";
import LogoutButton from "../button/logoutButton";
import { Menu, X, Home, Mic, BookOpen, User } from "lucide-react";

function TopMenuComponent() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { to: "/translate", label: "양방향 수어 통역", icon: <Mic size={18} /> },
    { to: "/study", label: "학습하기", icon: <BookOpen size={18} /> },
    { to: "/myPage", label: "마이페이지", icon: <User size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 py-3 bg-gray-900/70 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* 로고 */}
        <NavLink
          to="/"
          className="flex items-center space-x-2 text-xl font-bold text-white drop-shadow-neon"
          onClick={() => setMobileOpen(false)}
        >
          <Home size={22} className="text-pink-400" />
          <span className="hidden sm:inline">수담, 手談</span>
        </NavLink>

        {/* 데스크탑 메뉴 */}
        <div className="hidden md:flex flex-1 justify-center gap-8">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? "text-pink-400 bg-white/10 shadow-pink-500/30 shadow-md drop-shadow-md"
                    : "text-white/80 hover:text-cyan-400 hover:bg-white/5"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* 로그아웃 버튼 */}
        <div className="hidden md:block">
          <LogoutButton />
        </div>

        {/* 모바일 메뉴 버튼 */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white"
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        <div className="md:hidden mt-3 px-4 py-4 bg-gray-900/90 backdrop-blur-lg rounded-b-xl shadow-xl space-y-4 transition-all">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-pink-400 bg-white/10 shadow-pink-500/30 shadow-inner"
                    : "text-white/80 hover:text-cyan-300 hover:bg-white/5"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          <LogoutButton />
        </div>
      )}
    </nav>
  );
}

export default TopMenuComponent;
