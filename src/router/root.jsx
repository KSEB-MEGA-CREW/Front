import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./protectedRoute";
import StudyRouter from "./studyRouter";
import TranslateRouter from "./translateRouter";
import LoginRouter from "./loginRouter";
import BasicLayout from "../layouts/basicLayout";

import Main from "../pages/basicPage/mainPage";
import OAuth2RedirectHandler from "../pages/loginPage/OAuth2RedirectHandler";
import AuthCallback from "../components/authCallback";
import AboutPage from "../pages/basicPage/aboutPage";
import PrivacyPage from "../pages/basicPage/privacyPage";
import GoodPage from "../pages/basicPage/goodPage";
import StatsPage from "../pages/statsPage/statsPage";
import SettingsPage from "../pages/settingsPage/settingsPage";
import ErrorPage from "../pages/errorPage/errorPage";
import PrivacyPolicy from "../pages/legalPage/privacyPolicy";
import TermsOfService from "../pages/legalPage/termsOfService";
import CustomerSupport from "../pages/legalPage/customerSupport";
import InquiryBoard from "../pages/legalPage/inquiryBoard";
import TicketDetail from "../pages/legalPage/ticketDetail";

const router = createBrowserRouter([
  LoginRouter(),
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
  {
    path: "/privacy-policy",
    element: (
      <ProtectedRoute>
        <BasicLayout>
          <PrivacyPolicy />
        </BasicLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/terms-of-service",
    element: (
      <ProtectedRoute>
        <BasicLayout>
          <TermsOfService />
        </BasicLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/customer-support",
    element: (
      <ProtectedRoute>
        <BasicLayout>
          <CustomerSupport />
        </BasicLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/inquiry-board",
    element: (
      <ProtectedRoute>
        <BasicLayout>
          <InquiryBoard />
        </BasicLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/ticket/:ticketId",
    element: (
      <ProtectedRoute>
        <BasicLayout>
          <TicketDetail />
        </BasicLayout>
      </ProtectedRoute>
    ),
  },
  TranslateRouter(),
  ...StudyRouter(),
  // 404 에러 페이지 - 모든 라우트의 마지막에 배치
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default router;
