import React from "react";
import { useAuth } from "../../Context/authContext"; // useAuth 훅 import 추가
import UserProfile from "../../components/userProfile";
import StasticComponent from "../../components/stasticComponent";
import CalendarModel from "../../components/calendarModel";
import BasicLayout from "../../layouts/basicLayout";

const MyPage = () => {
  const { user, isLoading } = useAuth(); // useAuth 훅으로 사용자 정보 가져오기

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return (
      <BasicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-gray-600">페이지를 불러오는 중...</span>
          </div>
        </div>
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">대시보드</h1>
            <p className="text-gray-600">당신의 성취를 수담에서 확인하세요!</p>
          </div>

          {/* 메인 레이아웃 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* 왼쪽 사이드바: 사용자 프로필 */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <UserProfile />
              </div>
            </div>

            {/* 오른쪽 메인 콘텐츠 */}
            <div className="lg:col-span-3 space-y-6">
              {/* 주간 통계 */}
              <StasticComponent />

              {/* 월별 달력 */}
              <CalendarModel userId={user?.id} />
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default MyPage;
