import React from "react";
import { useAuth } from "../../Context/authContext";
import BasicLayout from "../../layouts/basicLayout";

// 아이콘을 컴포넌트 내에 SVG로 직접 추가하여 별도 라이브러리 설치가 필요 없습니다.
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-slate-500"
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
    className="h-5 w-5 mr-2"
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

const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

function MyPage() {
  const { user, isLoading } = useAuth();

  // 스피너를 사용한 세련된 로딩 상태
  if (isLoading) {
    return (
      <BasicLayout>
        <div className="flex justify-center items-center min-h-screen">
          <svg
            className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-xl font-semibold text-gray-600">
            정보를 불러오는 중...
          </span>
        </div>
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      {/* 페이지 전체 배경색을 설정하여 카드와 구분 */}
      <div className="bg-[#11151b] min-h-screen py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            {/* 프로필 아바타 영역 */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto flex items-center justify-center border-4 border-white shadow-md">
                {/* 사용자 프로필 이미지가 있다면 여기에 표시 */}
                <UserIcon />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mt-4">
                내 정보
              </h1>
              <p className="text-slate-500">
                {user?.username || "사용자"}님 환영합니다!
              </p>
            </div>

            {/* 정보 필드 */}
            <div className="space-y-6">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-indigo-600">
                  닉네임
                </span>
                <p className="text-lg text-slate-800 font-medium mt-1">
                  {user?.username || "정보 없음"}
                </p>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-indigo-600">
                  이메일
                </span>
                <p className="text-lg text-slate-800 font-medium mt-1">
                  {user?.email || "정보 없음"}
                </p>
              </div>
            </div>

            {/* 구분선 */}
            <hr className="my-8 border-slate-200" />

            {/* 액션 버튼 영역 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                <EditIcon />
                정보 수정
              </button>
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
}

export default MyPage;
