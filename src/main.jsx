import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./router/root";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./Context/authContext";
import { ThemeProvider } from "./Context/themeContext";

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </ThemeProvider>
);
