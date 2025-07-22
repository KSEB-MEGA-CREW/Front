import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./protectedRoute";
import StudyRouter from "./studyRouter";
import TranslateRouter from "./translateRouter";

// Lazy Loading => 직접 import로 변경
import Main from "../pages/basicPage/mainPage";
import MyPage from "../pages/basicPage/myPage";
import Login from "../pages/loginPage/loginPage";
import SignUp from "../pages/loginPage/signupPage";
import OAuth2RedirectHandler from "../pages/loginPage/OAuth2RedirectHandler";
import AuthCallback from "../components/authCallback";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
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
  TranslateRouter(),
  StudyRouter(),
]);

export default router;
