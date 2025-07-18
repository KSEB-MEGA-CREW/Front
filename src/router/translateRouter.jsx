import { lazy, Suspense } from "react";
import { Navigate } from "react-router";

import ProtectedRoute from "./protectedRouter";
import TranslatePage from "../pages/translatePage/translatePage";

const Loading = () => <div>Loading....</div>;

const Translatevideo = lazy(() => import("../pages/translatePage/videoPage"));
const TranslateAvatar = lazy(() => import("../pages/translatePage/avatarPage"));

function TranslateRouter() {
  return {
    path: "/translate",
    element: (
      <ProtectedRoute>
        <TranslatePage />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "video",
        element: (
          <Suspense fallback={<Loading />}>
            <Translatevideo />
          </Suspense>
        ),
      },
      {
        path: "",
        element: <Navigate to={"/translate"}></Navigate>,
      },
      {
        path: "avatar",
        element: (
          <Suspense fallback={<Loading />}>
            <TranslateAvatar />
          </Suspense>
        ),
      },
    ],
  };
}

export default TranslateRouter;
