import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./router/root";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./Context/authContext";
import { ThemeProvider } from "./Context/themeContext";
import { WebSocketProvider } from "./Context/WebSocketContext";
import ErrorBoundary from "./components/ErrorBoundary";

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>
          <RouterProvider router={router} />
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
