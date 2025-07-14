import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./router/root";
import { RouterProvider } from "react-router";
import TestContextWrapper from "./store/testContext";

console.log("main");
createRoot(document.getElementById("root")).render(
  <TestContextWrapper>
    <RouterProvider router={router} />,
  </TestContextWrapper>
);
