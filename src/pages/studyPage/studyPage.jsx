import BasicLayout from "../../layouts/basicLayout";
import { Outlet } from "react-router-dom";

function StudyPage() {
  return (
    <BasicLayout>
      <div className="min-h-screen bg-[#11151b]">
        <Outlet />
      </div>
    </BasicLayout>
  );
}

export default StudyPage;
