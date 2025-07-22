import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./router/root";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./Context/authContext";
// import { CookiesProvider } from "react-cookie"; // 제거 (JWT 토큰 사용으로 불필요)

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    {" "}
    {/* AuthContextProvider → AuthProvider로 변경 */}
    <RouterProvider router={router} />
  </AuthProvider>
);
