import ProtectedRoute from "./protectedRoute";
import StudyPage from "../pages/studyPage/studyPage";

function StudyRouter() {
  return {
    path: "/study",
    element: (
      <ProtectedRoute>
        <StudyPage />
      </ProtectedRoute>
    ),
  };
}

export default StudyRouter;
