import React from "react";
import { useAuth } from "../Context/authContext";

// 아이콘 컴포넌트들
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-blue-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
    />
  </svg>
);

const UserProfile = () => {
  const { user, isLoading } = useAuth();

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
        <div className="flex flex-col items-center justify-center h-full space-y-3">
          <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-sm text-gray-500">정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
      <div className="flex flex-col h-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <UserIcon />
            </div>
            {/* 온라인 상태 표시 */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white"></div>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mt-4">
            {user?.username || "박우인"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">@{user?.email?.split('@')[0] || "amy0408201777"}</p>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-1">학습한 퀴즈</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-1">평균평점</p>
          </div>
        </div>

        

        {/* 하단 영역 */}
        <div className="mt-auto space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">최근 학습 퀴즈</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs text-gray-600">정답률을 확인하세요</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400 mb-3">소속 인증</p>
            <button className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <EditIcon />
              <span className="ml-2">정보 수정</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;