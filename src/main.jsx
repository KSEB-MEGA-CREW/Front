import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./router/root";
import { RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "./store/authContext";
import { CookiesProvider } from "react-cookie";

createRoot(document.getElementById("root")).render(
  <CookiesProvider>
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  </CookiesProvider>
);
