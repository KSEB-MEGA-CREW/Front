import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./router/root";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./Context/authContext";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
