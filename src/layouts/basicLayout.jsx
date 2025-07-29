import { useLocation } from "react-router-dom";
import TopMenuComponent from "../components/menu/topMenu";
import StudyMenu from "../components/menu/studyMenu";

function BasicLayout({ children }) {
  const location = useLocation();
  const isStudyRoute = location.pathname.startsWith("/study");
  const isMainRoute = location.pathname === "/" || location.pathname === "/main";

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-white">
      <TopMenuComponent />
      {isStudyRoute && <StudyMenu />}
      
      {/* 메인 페이지는 패딩 없이, 다른 페이지는 TopMenu를 고려한 패딩 적용 */}
      <div className={isMainRoute ? "" : "pt-20"}>
        <main className={isMainRoute ? "" : "flex-1 w-full px-4 py-6"}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default BasicLayout;