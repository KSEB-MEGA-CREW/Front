import { useLocation } from "react-router-dom";
import TopMenuComponent from "../components/menu/topMenu";
import StudyMenu from "../components/menu/studyMenu";

function BasicLayout({ children }) {
  const location = useLocation();
  const isStudyRoute = location.pathname.startsWith("/study");

  return (
    <div>
      <TopMenuComponent />
      {isStudyRoute && <StudyMenu />}
      <div>{children}</div>
    </div>
  );
}

export default BasicLayout;
