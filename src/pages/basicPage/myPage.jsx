import React from "react";

// 실제 컴포넌트들 임포트
import UserProfile from '../../components/userProfile';
import CalendarModel from '../../components/calendarModel';
import StasticComponent from '../../components/stasticComponent'
import BasicLayout from "../../layouts/basicLayout";

const MyPage = () => {
  return (
    <BasicLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
            <p className="text-gray-600 mt-2">개인 정보와 활동 현황을 확인하세요</p>
          </div>

          {/* 상단: 사용자 프로필 (가로 전체) */}
          <div className="mb-6">
            <UserProfile />
          </div>

          {/* 하단: 캘린더와 통계를 가로로 배치 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CalendarModel />
            <StasticComponent />
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default MyPage;

