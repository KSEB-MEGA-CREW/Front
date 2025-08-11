import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import LoginBox from '../login/loginBox';
import SignUpBox from '../login/signupBox';

const StartPage = () => {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'login', 'signup'

  // 메인 시작 화면
  if (currentView === 'main') {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {/* 로그인 버튼 */}
          <button
            onClick={() => setCurrentView('login')}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-sm"
          >
            <LogIn size={24} />
            로그인
          </button>

          {/* 회원가입 버튼 */}
          <button
            onClick={() => setCurrentView('signup')}
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

  // 로그인 화면
  if (currentView === 'login') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setCurrentView('main')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ←
          </button>
          <h3 className="text-xl font-semibold text-white">로그인</h3>
        </div>
        <LoginBox />
        <div className="text-center">
          <button
            onClick={() => setCurrentView('signup')}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            계정이 없으신가요? 회원가입하기
          </button>
        </div>
      </div>
    );
  }

  // 회원가입 화면
  if (currentView === 'signup') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setCurrentView('main')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ←
          </button>
          <h3 className="text-xl font-semibold text-white">회원가입</h3>
        </div>
        <SignUpBox />
        <div className="text-center">
          <button
            onClick={() => setCurrentView('login')}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            이미 계정이 있으신가요? 로그인하기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default StartPage;