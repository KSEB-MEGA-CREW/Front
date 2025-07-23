import BasicLayout from "../../layouts/basicLayout";
import StudyMenu from "../../components/menu/studyMenu";
import { Outlet } from "react-router-dom";

function StudyPage() {
  return (
    <BasicLayout>
      <div className="min-h-screen flex flex-col items-center bg-[#11151b] px-4 py-8">
        <Outlet />
      </div>
    </BasicLayout>
  );
}

export default StudyPage;
