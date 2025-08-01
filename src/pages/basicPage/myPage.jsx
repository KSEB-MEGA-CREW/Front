import React from 'react';

// 실제 컴포넌트들 임포트
import UserProfile from '../../components/userProfile';
import CalendarModel from '../../components/calendarModel';
import StasticComponent from '../../components/stasticComponent';

const MyPage = () => {
  return (
    <div className="w-full h-screen p-4 bg-gray-100">
      <div className="w-full h-full grid grid-cols-2 gap-4">
        {/* 왼쪽 열 */}
        <div className="flex flex-col gap-4">
          {/* UserProfile - 위쪽 */}
          <div className="h-1/3">
            <UserProfile />
          </div>
          
          {/* CalendarModel - 아래쪽 */}
          <div className="flex-1">
            <CalendarModel />
          </div>
        </div>
        
        {/* 오른쪽 열 - StatisticComponent */}
        <div className="h-full">
          <StasticComponent/>
          
        </div>
      </div>
    </div>
  );
};

export default MyPage;