import { useContext } from "react";
import { TestContext } from "../store/testContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { account, loading } = useContext(TestContext);
  if (loading) {
    console.log("protected - loading");
    return null;
  } // 또는 로딩 스피너
  if (!account.uid) {
    console.log("protected - uid 없음");
    return <Navigate to="/login" replace />;
  }
  console.log("protected - uid 있음");
  return children;
}

export default ProtectedRoute;
