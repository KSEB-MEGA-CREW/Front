import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./protectedRouter";
import StudyRouter from "./studyRouter";
import TranslateRouter from "./translateRouter";

// 페이지 컴포넌트 Lazy Loading
const Main = lazy(() => import("../pages/basicPage/mainPage"));
const Translate = lazy(() => import("../pages/translatePage/translatePage"));
const Study = lazy(() => import("../pages/studyPage/studyPage"));
const Mypage = lazy(() => import("../pages/basicPage/myPage"));

const Login = lazy(() => import("../pages/loginPage/loginPage"));
const SignUp = lazy(() => import("../pages/loginPage/signupPage"));
const OAuth2RedirectHandler = lazy(() =>
  import("../pages/loginPage/OAuth2RedirectHandler")
);

// AuthCallback 컴포넌트 추가 (또는 OAuth2RedirectHandler를 재사용)
const AuthCallback = lazy(() => 
  import("../components/authCallback")
);

const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
      <div>Loading....</div>
    </div>
  </div>
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
  // 기존 OAuth2 리다이렉트 핸들러 (호환성 유지)
  {
    path: "/oauth2/redirect",
    element: (
      <Suspense fallback={<Loading />}>
        <OAuth2RedirectHandler />
      </Suspense>
    ),
  },
  // 백엔드 SuccessHandler가 리다이렉트하는 경로
  {
    path: "/auth/callback",
    element: (
      <Suspense fallback={<Loading />}>
        <AuthCallback />
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
    path: "/mypage",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <Mypage />
        </Suspense>
      </ProtectedRoute>
    ),
  },

  TranslateRouter(),
  StudyRouter(),
]);

export default router;