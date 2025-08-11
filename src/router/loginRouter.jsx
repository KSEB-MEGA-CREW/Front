import LoginPage from "../pages/loginPage/loginPage"; // Outlet을 포함한 레이아웃 페이지
import StartPage from "../components/auth/startPage"; // 새로운 시작 페이지
import PublicRoute from "./PublicRoute";

function LoginRouter() {
  return {
    path: "/auth",
    element: (
      <PublicRoute>
        {/* 부모 경로는 항상 LoginPage(AuthLayout)를 렌더링합니다. */}
        <LoginPage />
      </PublicRoute>
    ),
    // children 배열의 요소들이 부모의 <Outlet /> 위치에 렌더링됩니다.
    children: [
      {
        // /auth 접속 시 기본으로 새로운 시작 페이지를 보여줌
        index: true,
        element: <StartPage />,
      },
    ],
  };
}

export default LoginRouter;
