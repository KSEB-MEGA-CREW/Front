import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./protectedRoute";
import StudyRouter from "./studyRouter";
import TranslateRouter from "./translateRouter";
import LoginRouter from "./loginRouter";
import BasicLayout from "../layouts/basicLayout";

// Lazy Loading => 직접 import로 변경
import Main from "../pages/basicPage/mainPage";
import MyPage from "../pages/basicPage/myPage";
import OAuth2RedirectHandler from "../pages/loginPage/OAuth2RedirectHandler";
import AuthCallback from "../components/authCallback";
import AboutPage from "../pages/basicPage/aboutPage";
import PrivacyPage from "../pages/basicPage/privacyPage";
import GoodPage from "../pages/basicPage/goodPage";

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
    path: "/mypage",
    element: (
      <ProtectedRoute>
        <BasicLayout>
          <MyPage />
        </BasicLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/about",
    element: (
      <ProtectedRoute>
        <BasicLayout>
          <AboutPage />
        </BasicLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/privacy",
    element: (
      <ProtectedRoute>
        <BasicLayout>
          <PrivacyPage />
        </BasicLayout>
      </ProtectedRoute>
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
  TranslateRouter(),
  StudyRouter(),
]);

export default router;
