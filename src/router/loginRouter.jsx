import LoginPage from "../pages/loginPage/loginPage"; // Outlet을 포함한 레이아웃 페이지
import LoginBox from "../components/login/loginBox"; // 독립적인 로그인 폼 (이전 리팩토링 결과)
import SignUpBox from "../components/login/signupBox"; // 독립적인 회원가입 폼 (이전 리팩토링 결과)
import PublicRoute from "./publicRoute";

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
        path: "login", // -> /auth/login
        element: <LoginBox />,
      },
      {
        path: "signup", // -> /auth/signup
        element: <SignUpBox />,
      },
      {
        // path: "" 대신 index: true를 사용하면 /auth 경로에 기본으로 보일 자식 라우트를 지정할 수 있습니다.
        index: true,
        element: <LoginBox />, // 예: /auth 접속 시 기본으로 로그인 박스를 보여줌
      },
    ],
  };
}

export default LoginRouter;
