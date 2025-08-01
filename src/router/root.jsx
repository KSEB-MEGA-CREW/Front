import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./protectedRoute";
import StudyRouter from "./studyRouter";
import TranslateRouter from "./translateRouter";
import PublicRoute from "./publicRoute";

// Lazy Loading => 직접 import로 변경
import Main from "../pages/basicPage/mainPage";
import MyPage from "../pages/basicPage/myPage";
import Login from "../pages/loginPage/loginPage";
import SignUp from "../pages/loginPage/signupPage";
import OAuth2RedirectHandler from "../pages/loginPage/OAuth2RedirectHandler";
import AuthCallback from "../components/authCallback";
import AboutPage from "../pages/basicPage/aboutPage";
import PrivacyPage from "../pages/basicPage/privacyPage";
import GoodPage from "../pages/basicPage/goodPage";

<p></p>;

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <SignUp />
      </PublicRoute>
    ),
  },
  // 기존 OAuth2 리다이렉트 핸들러 (호환성 유지)
  {
    path: "/oauth2/redirect",
    element: <OAuth2RedirectHandler />,
  },
  // 백엔드 SuccessHandler가 리다이렉트하는 경로
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Main />
      </ProtectedRoute>
    ),
  },
  {
    path: "/mypage",
    element: (
      <ProtectedRoute>
        <MyPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/about",
    element: (
      <ProtectedRoute>
        <AboutPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/privacy",
    element: (
      <ProtectedRoute>
        <PrivacyPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/good",
    element: (
      <ProtectedRoute>
        <GoodPage />
      </ProtectedRoute>
    ),
  },
  TranslateRouter(),
  StudyRouter(),
]);

export default router;
