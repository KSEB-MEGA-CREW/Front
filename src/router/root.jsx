import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./protectedRouter";

// 페이지 컴포넌트 Lazy Loading
const Main = lazy(() => import("../pages/basicPage/mainPage"));
const Translate = lazy(() => import("../pages/basicPage/translatePage"));
const Study = lazy(() => import("../pages/basicPage/studyPage"));
const Mypage = lazy(() => import("../pages/basicPage/myPage"));

const Login = lazy(() => import("../pages/loginPage/loginPage"));
const SignUp = lazy(() => import("../pages/loginPage/signupPage"));
const OAuth2RedirectHandler = lazy(() =>
  import("../pages/loginPage/OAuth2RedirectHandler")
);

const Loading = () => (
  <div className="flex justify-center items-center h-screen">Loading....</div>
);

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<Loading />}>
        <SignUp />
      </Suspense>
    ),
  },
  {
    path: "/oauth2/redirect",
    element: (
      <Suspense fallback={<Loading />}>
        <OAuth2RedirectHandler />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <Main />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/translate",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <Translate />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/study",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <Study />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/mypage",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <Mypage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
]);

export default router;
