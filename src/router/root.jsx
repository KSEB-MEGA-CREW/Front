import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./protectedRoute";
import StudyRouter from "./studyRouter";
import TranslateRouter from "./translateRouter";
import LoginRouter from "./loginRouter";
import BasicLayout from "../layouts/basicLayout";

// 직접 import
import Main from "../pages/basicPage/mainPage";
import OAuth2RedirectHandler from "../pages/loginPage/OAuth2RedirectHandler";
import AuthCallback from "../components/authCallback";
import AboutPage from "../pages/basicPage/aboutPage";
import PrivacyPage from "../pages/basicPage/privacyPage";
import GoodPage from "../pages/basicPage/goodPage";
import StatsPage from "../pages/statsPage/statsPage";
import SettingsPage from "../pages/settingsPage/settingsPage";
import ErrorPage from "../pages/errorPage/errorPage";

const router = createBrowserRouter([
  LoginRouter(),
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
        <BasicLayout>
          <Main />
        </BasicLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/about",
    element: (
      <BasicLayout>
        <AboutPage />
      </BasicLayout>
    ),
  },
  {
    path: "/privacy",
    element: (
      <BasicLayout>
        <PrivacyPage />
      </BasicLayout>
    ),
  },
  {
    path: "/good",
    element: (
      <ProtectedRoute>
        <BasicLayout>
          <GoodPage />
        </BasicLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/stats",
    element: (
      <ProtectedRoute>
        <BasicLayout>
          <StatsPage />
        </BasicLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <BasicLayout>
          <SettingsPage />
        </BasicLayout>
      </ProtectedRoute>
    ),
  },
  TranslateRouter(),
  StudyRouter(),
  // 404 에러 페이지 - 모든 라우트의 마지막에 배치
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default router;
