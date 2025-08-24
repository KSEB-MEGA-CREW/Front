import React from "react";
import { useLocation } from "react-router-dom";
import {
  Menu,
  ChevronLeft,
  Home,
  BarChart3,
  Settings,
  LogOut,
  MessageSquare,
  UserCircle,
  Hand,
  Brain,
  Shield,
  HelpCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "../../Context/authContext";
import { useTheme } from "../../Context/themeContext";
import LogoutButton from "../button/logoutButton";
import logoImage from "../../../public/icon.png";

const SideMenu = ({
  isOpen,
  setIsOpen,
  onNavigate,
  onShowMyPage,
  onShowStats,
  onShowSettings,
  onShowQuiz,
  onShowIncorrectAnswer,
}) => {
  const { user, isAdmin } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const location = useLocation();

  const menuItems = [
    {
      icon: <Home size={20} />,
      label: "홈",
      path: "/",
      onClick: () => onNavigate("/"),
    },
    {
      icon: <MessageSquare size={20} />,
      label: "수어 번역",
      path: "/translate/video",
      onClick: () => onNavigate("/translate/video"),
    },
    {
      icon: <Hand size={20} />,
      label: "수어 생성",
      path: "/translate/avatar",
      onClick: () => onNavigate("/translate/avatar"),
    },
    {
      icon: <Brain size={20} />,
      label: "퀴즈",
      onClick: onShowQuiz,
      id: "quiz", // 모달/해시 기반 네비게이션을 위한 ID
    },
    {
      icon: <FileText size={20} />,
      label: "오답 노트",
      path: "/incorrect-answer",
      onClick: onShowIncorrectAnswer,
    },
    {
      icon: <BarChart3 size={20} />,
      label: "통계",
      onClick: onShowStats,
      id: "stats", // 모달/해시 기반 네비게이션을 위한 ID
    },
  ];

  // 관리자 전용 메뉴 항목
  const adminMenuItems = [
    {
      icon: <Shield size={20} />,
      label: "문의 관리",
      path: "/inquiry-board",
      onClick: () => onNavigate("/inquiry-board"),
    },
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
      <div
        className={`
        fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out
        ${isOpen ? "w-64" : "w-16"}
        ${
          theme === "high-contrast"
            ? "bg-[#212121]"
            : isDarkMode
            ? "bg-gray-950"
            : "bg-[#e9ecef]"
        }
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* 헤더 영역 */}
        <div
          className={`relative flex items-center p-4 h-[65px] ${
            theme === "high-contrast"
              ? "border-b border-gray-700"
              : "border-b border-gray-400 dark:border-gray-700"
          }`}
        >
          <div
            className={`flex items-center gap-3 transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden`}
            >
              <img
                src={logoImage}
                alt="수담 로고"
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className={`font-bold text-lg whitespace-nowrap ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              수담
            </span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`absolute top-3.5 right-3 p-2 rounded-lg transition-colors ${
              theme === "high-contrast"
                ? "hover:bg-yellow-400 hover:text-black text-yellow-400"
                : isDarkMode
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-300 text-gray-600"
            }`}
          >
            {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* 메뉴 항목들 */}
        <div className="flex-1 py-4">
          <nav className="space-y-2 px-3">
            {/* 기본 메뉴 항목들 */}
            {menuItems.map((item, index) => {
              const isActive = item.path
                ? location.pathname === item.path
                : item.id
                ? location.hash === `#${item.id}`
                : false;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg transition-colors overflow-hidden font-semibold
                    ${
                      theme === "high-contrast"
                        ? "text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        : isDarkMode
                        ? "text-gray-100 hover:bg-gray-800 hover:text-white"
                        : "text-gray-800 hover:bg-gray-300 hover:text-gray-900"
                    }
                  `}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <span
                    className={`whitespace-nowrap transition-opacity duration-300 ${
                      isOpen ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* 관리자 전용 메뉴 */}
            {isAdmin() && (
              <>
                <div
                  className={`border-t my-4 ${
                    theme === "high-contrast"
                      ? "border-gray-700"
                      : isDarkMode
                      ? "border-gray-700"
                      : "border-gray-400"
                  }`}
                />
                <div
                  className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0"
                  } ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-yellow-400"
                      : "text-yellow-600"
                  }`}
                >
                  👑 관리자 메뉴
                </div>
                {adminMenuItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={`admin-${index}`}
                      onClick={item.onClick}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-lg transition-colors overflow-hidden font-semibold
                        ${
                          theme === "high-contrast"
                            ? "text-yellow-400 hover:bg-yellow-400 hover:text-black"
                            : isActive
                            ? isDarkMode
                              ? "bg-blue-800 text-white"
                              : "bg-blue-100 text-blue-700"
                            : isDarkMode
                            ? "text-gray-100 hover:bg-gray-800 hover:text-white"
                            : "text-gray-800 hover:bg-gray-300 hover:text-gray-900"
                        }
                      `}
                    >
                      <div className="flex-shrink-0">{item.icon}</div>
                      <span
                        className={`whitespace-nowrap transition-opacity duration-300 ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {/* 하단 사용자 영역 */}
        <div
          className={`p-3 space-y-2 ${
            theme === "high-contrast"
              ? "border-t border-gray-700"
              : "border-t border-gray-400 dark:border-gray-700"
          }`}
        >
          {/* 계정 버튼 */}
          <button
            onClick={onShowMyPage}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-colors overflow-hidden
              ${
                theme === "high-contrast"
                  ? "text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  : isDarkMode
                  ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                  : "hover:bg-gray-300 text-gray-700 hover:text-gray-900"
              }
            `}
          >
            <div className="flex-shrink-0">
              <UserCircle size={20} />
            </div>
            <div
              className={`
                text-left whitespace-nowrap transition-opacity duration-300
                ${isOpen ? "opacity-100" : "opacity-0"}
              `}
            >
              <div className="flex items-center gap-2">
                <div className="font-semibold">
                  {user?.username || "사용자"}
                </div>
                {isAdmin() && (
                  <span
                    className={`
                      inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border
                      ${
                        theme === "high-contrast"
                          ? "text-black bg-yellow-400 border-yellow-400"
                          : isDarkMode
                          ? "text-yellow-300 border-yellow-700"
                          : "text-yellow-600 border-yellow-600"
                      }
                    `}
                  >
                    관리자
                  </span>
                )}
              </div>
              <div className="text-xs opacity-60">계정 설정</div>
            </div>
          </button>

          {/* 고객지원 버튼 */}
          <button
            onClick={() => onNavigate("/customer-support")}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-colors overflow-hidden
              
              ${
                theme === "high-contrast"
                  ? "text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  : isDarkMode
                  ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                  : "hover:bg-gray-300 text-gray-700 hover:text-gray-900"
              }
            
            `}
          >
            <div className="flex-shrink-0">
              <HelpCircle size={20} />
            </div>
            <span
              className={`
                font-semibold whitespace-nowrap transition-opacity duration-300
                ${isOpen ? "opacity-100" : "opacity-0"}
              `}
            >
              고객지원
            </span>
          </button>

          {/* 설정 버튼 */}
          <button
            onClick={onShowSettings}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-colors overflow-hidden
              ${
                theme === "high-contrast"
                  ? "text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  : isDarkMode
                  ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                  : "hover:bg-gray-300 text-gray-700 hover:text-gray-900"
              }
            `}
          >
            <div className="flex-shrink-0">
              <Settings size={20} />
            </div>
            <span
              className={`
                font-semibold whitespace-nowrap transition-opacity duration-300
                ${isOpen ? "opacity-100" : "opacity-0"}
              `}
            >
              설정
            </span>
          </button>

          {/* 로그아웃 버튼 */}
          <LogoutButton
            isOpen={isOpen}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-colors overflow-hidden
              ${
                theme === "high-contrast"
                  ? "text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  : isDarkMode
                  ? "hover:bg-red-900/50 text-red-400 hover:text-red-300"
                  : "hover:bg-red-50 text-red-600 hover:text-red-700"
              }
            `}
          >
            <div className="flex-shrink-0">
              <LogOut size={20} />
            </div>
            <span
              className={`
                font-semibold whitespace-nowrap transition-opacity duration-300
                ${isOpen ? "opacity-100" : "opacity-0"}
              `}
            >
              로그아웃
            </span>
          </LogoutButton>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
