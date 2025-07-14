import { createBrowserRouter, RouterProvider } from "react-router";

import { lazy, Suspense } from "react";
import ProtectedRoute from "./protectedRouter";

const Loading = () => <div>Loading....</div>;

const Main = lazy(() => import("../pages/mainPage"));
const About = lazy(() => import("../pages/aboutPage"));
const Login = lazy(() => import("../pages/loginPage"));
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
]);

export default router;
