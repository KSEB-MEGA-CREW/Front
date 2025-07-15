// ../button/SignupButton.jsx
import { useNavigate } from "react-router-dom";

function SignupButton() {
  const navigate = useNavigate();

  const handleSignup = () => {
    console.log("SignupButton - 함수");
    navigate("/signup"); // 회원가입 페이지로 이동
  };

  return (
    <button
      className="w-full mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600"
      onClick={handleSignup}
    >
      회원가입
    </button>
  );
}

export default SignupButton;
