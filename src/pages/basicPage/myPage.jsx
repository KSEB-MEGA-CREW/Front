import React from 'react';
import UserProfile from '../../components/userProfile';
import CalendarModel from '../../components/calendarModel';
import StatisticComponent from '../../components/stasticComponent';
import BasicLayout from '../../layouts/basicLayout'; // ✅ 여기 중요!

export default function MyPage() {
  return (
    <BasicLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 왼쪽 - 프로필 섹션 */}
          <UserProfile />

          {/* 오른쪽 - 대시보드 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 대시보드 헤더 */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                대시보드 <span className="text-lg font-normal text-gray-500">수담과 성장 중!</span>
              </h1>
            </div>

            {/* 통계 컴포넌트 */}
            <StatisticComponent />

            {/* 월별 캘린더 */}
            <CalendarModel />
          </div>
        </div>
      </div>
    </BasicLayout>
  );
}
