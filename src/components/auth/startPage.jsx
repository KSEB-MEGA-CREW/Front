import React from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const StartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // URL 경로에 따라 현재 뷰를 결정
  const currentView =
    location.pathname === "/auth/login"
      ? "login"
      : location.pathname === "/auth/signup"
      ? "signup"
      : "main";

  const handleNavigate = (viewName) => {
    // react-router-dom을 통해 URL 경로를 변경합니다.
    if (viewName === "login") {
      navigate("/auth/login");
    } else if (viewName === "signup") {
      navigate("/auth/signup");
    }
  };

  // 메인 시작 화면
  if (currentView === "main") {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {/* 로그인 버튼 */}
          <button
            // onClick 핸들러를 화살표 함수로 감싸서 클릭 시에만 함수가 실행되도록 수정
            onClick={() => handleNavigate("login")}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-sm"
          >
            <LogIn size={24} />
            로그인
          </button>

          {/* 회원가입 버튼 */}
          <button
            // 여기도 동일하게 수정
            onClick={() => handleNavigate("signup")}
            className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-700 transition-colors duration-200 border border-gray-700"
          >
            <UserPlus size={24} />
            회원가입
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="text-gray-500 text-sm">또는</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* 추가 정보 */}
        <div className="text-center text-sm text-gray-500">
          <p>계속 진행하시면 서비스 이용약관 및 개인정보처리방침에</p>
          <p>동의하는 것으로 간주됩니다.</p>
        </div>
      </div>
    );
  }

  // 로그인 또는 회원가입 화면 (Outlet을 통해 자식 라우트 컴포넌트가 렌더링됨)
  // 뒤로가기 버튼을 누르면 URL도 그에 맞게 변경해주는 것이 좋습니다.
  // 여기서는 간단하게 내부 상태만 'main'으로 변경합니다.
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => {
            navigate("/auth"); // URL도 초기 상태로 되돌리기
          }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ←
        </button>
        <h3 className="text-xl font-semibold text-white">
          {currentView === "login" ? "로그인" : "회원가입"}
        </h3>
      </div>

      {/* /auth/login 또는 /auth/signup 경로의 컴포넌트가 여기에 렌더링됩니다. */}
      <Outlet />

      <div className="text-center">
        {currentView === "login" ? (
          <button
            onClick={() => handleNavigate("signup")}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            계정이 없으신가요? 회원가입하기
          </button>
        ) : (
          <button
            onClick={() => handleNavigate("login")}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            이미 계정이 있으신가요? 로그인하기
          </button>
        )}
      </div>
    </div>
  );
};

export default StartPage;
