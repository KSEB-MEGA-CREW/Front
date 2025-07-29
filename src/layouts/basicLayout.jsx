import { useLocation } from "react-router-dom";
import TopMenuComponent from "../components/menu/topMenu";
import StudyMenu from "../components/menu/studyMenu";

function BasicLayout({ children }) {
  const location = useLocation();
  const isStudyRoute = location.pathname.startsWith("/study");
  const isMainRoute = location.pathname === "/" || location.pathname === "/main";

  // 패딩 계산: 메인 페이지는 0, 학습 페이지는 TopMenu + StudyMenu 높이, 일반 페이지는 TopMenu만
  const getTopPadding = () => {
    if (isMainRoute) return "";
    if (isStudyRoute) return "pt-32"; // TopMenu(약 16) + StudyMenu(약 16) = 32
    return "pt-16"; // TopMenu만
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-white">
      <TopMenuComponent />
      {isStudyRoute && <StudyMenu />}
      
      {/* 메인 페이지는 패딩 없이, 다른 페이지는 메뉴 높이를 고려한 패딩 적용 */}
      <div className={getTopPadding()}>
        {isMainRoute ? (
          children
        ) : (
          <main className="flex-1 w-full px-4 py-6">
            {children}
          </main>
        )}
      </div>
    </div>
  );
}

export default BasicLayout;