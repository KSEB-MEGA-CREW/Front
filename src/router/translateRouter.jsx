// src/router/translateRouter.jsx
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom"; // react-router-dom에서 가져오기
import { useTheme } from "../Context/themeContext"; // 테마 컨텍스트

import ProtectedRoute from "./protectedRoute";
import TranslatePage from "../pages/translatePage/translatePage";

// 공용 로딩 UI
function Loading({ message = "로딩 중..." }) {
  const ctx = useTheme?.(); // Provider 밖에서도 안전하게
  const theme = ctx?.theme;
  const isDarkMode = ctx?.isDarkMode;

  const textColor =
    theme === "high-contrast"
      ? "text-yellow-400"
      : isDarkMode
      ? "text-gray-300"
      : "text-gray-700";

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className={`text-lg font-semibold ${textColor}`}>{message}</p>
      </div>
    </div>
  );
}

const TranslateVideo = lazy(() => import("../pages/translatePage/videoPage"));
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
          <Suspense fallback={<Loading message="동영상을 준비하고 있어요..." />}>
            <TranslateVideo />
          </Suspense>
        ),
      },
      {
        // 기본 접근 시 /translate/video 로 이동
        path: "",
        element: <Navigate to="video" replace />,
      },
      {
        path: "avatar",
        element: (
          <Suspense fallback={<Loading message="아바타를 준비하고 있어요..." />}>
            <TranslateAvatar />
          </Suspense>
        ),
      },
    ],
  };
}

export default TranslateRouter;
