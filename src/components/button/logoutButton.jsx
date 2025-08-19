import { useAuth } from "../../Context/authContext";
import { useNavigate } from "react-router-dom";

function LogoutButton({ children, className }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <button
      onClick={handleLogout}
      className={className}
    >
      {children}
    </button>
  );
}

export default LogoutButton;
