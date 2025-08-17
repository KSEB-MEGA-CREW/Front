import React from "react";
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
  Users,
  HelpCircle,
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
}) => {
  const { user, isAdmin } = useAuth();
  const { isDarkMode } = useTheme();

  // 기본 메뉴 항목 정의
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
    },
    {
      icon: <BarChart3 size={20} />,
      label: "통계",
      onClick: onShowStats,
    },
  ];

  // 관리자 전용 메뉴 항목
  const adminMenuItems = [
    {
      icon: <Shield size={20} />,
      label: "문의 관리",
      path: "/inquiry",
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
          isDarkMode
            ? "bg-gray-900 border-r border-gray-800"
            : "bg-[#e9ecef] border-r border-gray-200"
        }
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {isOpen && (
            <div className="flex items-center gap-3">
              <div
                className={` w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden`}
              >
                {/* overflow-hidden 추가하여 이미지가 div 크기에 맞춰지도록 */}
                <img
                  src={logoImage}
                  alt="수담 로고"
                  className="w-full h-full object-cover"
                />
                {/* object-cover를 사용하여 비율 유지하며 채우기 */}
              </div>
              <span
                className={`font-bold text-lg  ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                수담
              </span>
            </div>
          )}

          {/* 토글 버튼 */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
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
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                  ${
                    isDarkMode
                      ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                      : "hover:bg-gray-300 text-gray-700 hover:text-gray-900"
                  }
                `}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {isOpen && <span className="font-semibold">{item.label}</span>}
              </button>
            ))}

            {/* 관리자 전용 메뉴 */}
            {isAdmin() && (
              <>
                {/* 구분선 */}
                <div
                  className={`border-t my-4 ${
                    // my-4를 추가해 위아래 여백을 줍니다.
                    isDarkMode ? "border-gray-700" : "border-gray-400" // 오타를 수정했습니다.
                  }`}
                />

                {/* 관리자 섹션 제목 */}
                {isOpen && (
                  <div
                    className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? "text-yellow-400" : "text-yellow-600"
                    }`}
                  >
                    👑 관리자 메뉴
                  </div>
                )}

                {/* 관리자 메뉴 항목들 */}
                {adminMenuItems.map((item, index) => (
                  <button
                    key={`admin-${index}`}
                    onClick={item.onClick}
                    className={`
                     w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                     ${
                       /* 👈 이 부분을 일반 메뉴와 동일하게 수정했습니다 */
                       isDarkMode
                         ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                         : "hover:bg-gray-300 text-gray-700 hover:text-gray-900"
                     }
                  `}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {isOpen && (
                      <span className="font-semibold">{item.label}</span>
                    )}
                  </button>
                ))}
              </>
            )}
          </nav>
        </div>

        {/* 하단 사용자 영역 */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2">
          {/* 계정 버튼 */}
          <button
            onClick={onShowMyPage}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-colors
              ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                  : "hover:bg-gray-300 text-gray-700 hover:text-gray-900"
              }
            `}
          >
            <div className="flex-shrink-0">
              <UserCircle size={20} />
            </div>
            {isOpen && (
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">
                    {user?.username || "사용자"}
                  </div>
                  {isAdmin() && (
                    <span
                      className={`
                          inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border
                         ${
                           // isDarkMode에 따라 다른 스타일을 적용합니다.
                           isDarkMode
                             ? " text-yellow-300 border-yellow-700" // 다크 모드 스타일
                             : " text-yellow-800 border-yellow-300" // 라이트 모드 스타일
                         }
                        `}
                    >
                      관리자
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-60">계정 설정</div>
              </div>
            )}
          </button>

          {/* 고객지원 버튼 */}
          <button
            onClick={() => onNavigate("/customer-support")}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-colors
              ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                  : "hover:bg-gray-300 text-gray-700 hover:text-gray-900"
              }
            `}
          >
            <div className="flex-shrink-0">
              <HelpCircle size={20} />
            </div>
            {isOpen && <span className="font-semibold">고객지원</span>}
          </button>

          {/* 설정 버튼 */}
          <button
            onClick={onShowSettings}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-colors
              ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                  : "hover:bg-gray-300 text-gray-700 hover:text-gray-900"
              }
            `}
          >
            <div className="flex-shrink-0">
              <Settings size={20} />
            </div>
            {isOpen && <span className="font-semibold">설정</span>}
          </button>

          {/* 로그아웃 버튼 */}
          <LogoutButton
            isOpen={isOpen} // isOpen prop 전달
            className={`
               w-full flex items-center gap-3 p-3 rounded-lg transition-colors
               ${
                 isDarkMode
                   ? "hover:bg-red-900/50 text-red-400 hover:text-red-300"
                   : "hover:bg-red-50 text-red-600 hover:text-red-700"
               }
            `}
          >
            <div className="flex-shrink-0">
              <LogOut size={20} />
            </div>
            {isOpen && ( // isOpen이 true일 때만 텍스트 렌더링
              <span className="font-semibold">로그아웃</span>
            )}
          </LogoutButton>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
