import BasicLayout from "../../layouts/basicLayout";
import { Outlet } from "react-router-dom";

function StudyPage() {
  return (
    <BasicLayout>
      <div className="w-full">
        <Outlet />
      </div>
    </BasicLayout>
  );
}

export default StudyPage;
