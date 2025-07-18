import { useLocation } from "react-router-dom";
import TopMenuComponent from "../components/menu/topMenu";
import StudyMenu from "../components/menu/studyMenu";

function BasicLayout({ children }) {
  const location = useLocation();
  const isStudyRoute = location.pathname.startsWith("/study");

  return (
    <>
      <TopMenuComponent />
      {isStudyRoute && <StudyMenu />}{" "}
      {/* ✅ study 메뉴 경로에만 서브 메뉴 출력 */}
      <div className="container mx-auto py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </>
  );
}

export default BasicLayout;
