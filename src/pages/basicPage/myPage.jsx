import React from 'react';

// 실제 컴포넌트들 임포트
import UserProfile from '../../components/userProfile';
import CalendarModel from '../../components/calendarModel';
import StasticComponent from '../../components/stasticComponent'
import BasicLayout from "../../layouts/basicLayout";

const MyPage = () => {
  return (
    <BasicLayout>
      <div className="w-full min-h-screen p-4 bg-gray-100">
        <div className="w-full" style={{ height: 'calc(100vh - 2rem)' }}>
          <div className="h-full grid grid-cols-2 gap-4">
            {/* 왼쪽 열 */}
            <div className="flex flex-col gap-16 h-full">
              {/* UserProfile - 위쪽 */}
              <div style={{ height: '30%' }}>
                <UserProfile />
              </div>
              
              {/* CalendarModel - 아래쪽 */}
              <div style={{ height: 'calc(70% - 1rem)' }}>
                <CalendarModel />
              </div>
            </div>
            
            {/* 오른쪽 열 - StatisticComponent */}
            <div className="h-full">
              <StasticComponent />
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default MyPage;