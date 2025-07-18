import { useLocation } from "react-router-dom";
import TopMenuComponent from "../components/menu/topMenu";
import StudyMenu from "../components/menu/studyMenu";

function BasicLayout({ children }) {
  const location = useLocation();
  const isStudyRoute = location.pathname.startsWith("/study");

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: isStudyRoute ? "#11151b" : undefined }}
    >
      <TopMenuComponent />
      {isStudyRoute && <StudyMenu />}

      {isStudyRoute ? (
        // 💡 study 하위 페이지에서는 가운데 정렬
        <div className="flex items-center justify-center w-full px-4 py-10">
          {children}
        </div>
      ) : (
        // 그 외 페이지는 기본 그리드 목록
        <div className="container mx-auto py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {children}
        </div>
      )}
    </div>
  );
}

export default BasicLayout;
