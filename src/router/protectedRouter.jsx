import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/authContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{form: location}} replace />;
  }

  return children;
};

export default ProtectedRoute;
