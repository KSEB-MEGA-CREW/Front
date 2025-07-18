import { lazy, Suspense } from "react";
import { Navigate } from "react-router";

import ProtectedRoute from "./protectedRouter";
import StudyPage from "../pages/studyPage/studyPage";

const Loading = () => <div>Loading....</div>;

const StudySentence = lazy(() => import("../pages/studyPage/studySentence"));
const StudyWord = lazy(() => import("../pages/studyPage/studyWord"));

function StudyRouter() {
  return {
    path: "/study",
    element: (
      <ProtectedRoute>
        <StudyPage />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "word",
        element: (
          <Suspense fallback={<Loading />}>
            <StudyWord />
          </Suspense>
        ),
      },
      {
        path: "",
        element: <Navigate to={"/study"}></Navigate>,
      },
      {
        path: "sentence",
        element: (
          <Suspense fallback={<Loading />}>
            <StudySentence />
          </Suspense>
        ),
      },
    ],
  };
}

export default StudyRouter;
