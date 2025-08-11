import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* 왼쪽 섹션 - 진한 네이비색 배경 */}
      <div className="flex-1 bg-slate-900 flex items-center justify-center p-12 text-white relative">
        {/* 배경 그라데이션 효과 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
        
        {/* 장식용 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* 콘텐츠 */}
        <div className="relative z-10 max-w-lg text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            수담
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            수어로 세상과 소통하는 새로운 방법
          </p>
          <div className="text-lg text-slate-400 space-y-2">
            <p>AI 기반 수어 인식과 번역으로</p>
            <p>모든 사람이 자유롭게 소통할 수 있는</p>
            <p>포용적인 디지털 세상을 만듭니다</p>
          </div>
        </div>
      </div>

      {/* 오른쪽 섹션 - 검은색 배경 */}
      <div className="flex-1 bg-black flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-white mb-2">시작하기</h2>
            <p className="text-gray-400">계정으로 로그인하거나 새로운 계정을 만드세요</p>
          </div>
          
          {/* Outlet에서 로그인/회원가입 버튼들이 렌더링됩니다 */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
