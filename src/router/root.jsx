import { createBrowserRouter, RouterProvider } from "react-router";

import { lazy, Suspense } from "react";
import ProtectedRoute from "./protectedRouter";

const Loading = () => <div>Loading....</div>;

const Main = lazy(() => import("../pages/mainPage"));
const About = lazy(() => import("../pages/aboutPage"));
const Mypage = lazy(() => import("../pages/myPage"));
const Login = lazy(() => import("../pages/loginPage"));
const SignUp = lazy(() => import("../pages/signupPage"));
console.log("login");

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
    path: "/about",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <About />
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
