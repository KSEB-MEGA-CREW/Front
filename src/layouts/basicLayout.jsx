import { useLocation } from "react-router-dom";
import TopMenuComponent from "../components/menu/topMenu";
import StudyMenu from "../components/menu/studyMenu";

function BasicLayout({ children }) {
  const location = useLocation();
  const isStudyRoute = location.pathname.startsWith("/study");

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-white">
      <TopMenuComponent />
      {isStudyRoute && <StudyMenu />}

      {/* TopMenu가 fixed일 경우를 고려해 위쪽 padding */}
      <div className="">{children}</div>
    </div>
  );
}

export default BasicLayout;
