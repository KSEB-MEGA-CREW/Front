import ProtectedRoute from "./protectedRoute";
import StudyPage from "../pages/studyPage/studyPage";
import IncorrectAnswerPage from "../pages/studyPage/incorrectAnswerPage";

function StudyRouter() {
  return [
    {
      path: "/study",
      element: (
        <ProtectedRoute>
          <StudyPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/incorrect-answer",
      element: (
        <ProtectedRoute>
          <IncorrectAnswerPage />
        </ProtectedRoute>
      ),
    },
  ];
}

export default StudyRouter;
