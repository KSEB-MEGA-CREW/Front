import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Edit, Check, Clock, Trophy, Target } from 'lucide-react';

export default function MyPageDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)); // 2025년 8월
  
  // 학습 데이터 (예시)
  const studyData = {
    '2025-8-5': 3,
    '2025-8-6': 2,
    '2025-8-7': 5,
    '2025-8-8': 1,
    '2025-8-12': 4,
    '2025-8-13': 2,
    '2025-8-14': 3,
    '2025-8-19': 6,
    '2025-8-20': 4,
    '2025-8-21': 2,
    '2025-8-26': 5,
    '2025-8-27': 3,
  };

  const weeklyData = [
    { week: '1주', study: 8, quiz: 3, note: 2, review: 1 },
    { week: '2주', study: 12, quiz: 5, note: 4, review: 3 },
    { week: '3주', study: 15, quiz: 8, note: 6, review: 2 },
    { week: '4주', study: 10, quiz: 4, note: 3, review: 5 },
  ];

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days = [];
    
    // 이전 달의 빈 칸들
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getStudyIntensity = (day) => {
    const key = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
    const count = studyData[key] || 0;
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-blue-200';
    if (count <= 4) return 'bg-blue-400';
    if (count <= 6) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const formatMonthYear = () => {
    return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
  };

  const getCurrentWeek = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const dayOfMonth = today.getDate();
    const weekNumber = Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7);
    return `${weekNumber}주차`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="text-xl font-bold text-green-600">SinfLearn</div>
            <nav className="flex space-x-6 text-gray-600">
              <a href="#" className="hover:text-gray-900">강의</a>
              <a href="#" className="hover:text-gray-900">로드맵</a>
              <a href="#" className="hover:text-gray-900">멘토링</a>
              <a href="#" className="hover:text-gray-900">커뮤니티</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">한국어</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">대시보드</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 왼쪽 - 프로필 및 학습 정보 */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 프로필 카드 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center relative">
                  <User size={32} className="text-gray-400" />
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                    <Edit size={12} className="text-white" />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">박우빈</h2>
                  <p className="text-gray-500">@amy0408201777</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">수강명 작성수</p>
                  <p className="text-lg font-semibold">-</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">평균평점</p>
                  <p className="text-lg font-semibold">-</p>
                </div>
              </div>
            </div>

            {/* 네비게이션 메뉴 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <nav className="p-4 space-y-2">
                <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
                  <span>홈</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-md font-medium">
                  <span>대시보드</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
                  <span>로드맵</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
                  <span>게시글</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
                  <span>블로그</span>
                </a>
              </nav>
            </div>

            {/* 최근 학습 강의 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">최근 학습 강의</h3>
              <div className="flex items-center space-x-3">
                <div className="text-gray-500">강의 둘러보기</div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>

            {/* 소속 인증 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">소속 인증</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={24} className="text-white" />
                </div>
                <p className="text-gray-600 mb-2">간편하게 인증하고</p>
                <p className="text-gray-600">커리어 향상에 활용!</p>
              </div>
            </div>
          </div>

          {/* 오른쪽 - 대시보드 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 대시보드 헤더 */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                대시보드 <span className="text-lg font-normal text-gray-500">일프런과 오늘벤 성장 중!</span>
              </h1>
            </div>

            {/* 주간 학습 현황 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">주간 학습</h2>
                <span className="text-sm text-gray-500">{getCurrentWeek()} 달성 성취</span>
              </div>
              
              <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-500 mb-2">
                <div>월</div>
                <div>화</div>
                <div>수</div>
                <div>목</div>
                <div>금</div>
                <div>토</div>
                <div>일</div>
              </div>
              
              <div className="grid grid-cols-7 gap-2 mb-4">
                {[1, 0, 0, 2, 1, 0, 3].map((count, index) => (
                  <div key={index} className="aspect-square rounded-full border-2 border-gray-200 flex items-center justify-center text-sm font-medium">
                    {count > 0 ? (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        count === 1 ? 'bg-blue-300' : count === 2 ? 'bg-blue-500' : 'bg-blue-700'
                      }`}>
                        {count}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>0</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy size={16} className="text-gray-400" />
                  <span>0분</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target size={16} className="text-gray-400" />
                  <span>0</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-gray-400" />
                  <span>0</span>
                </div>
              </div>
            </div>

            {/* 월별 학습 캘린더 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">연간 학습</h2>
                <div className="flex items-center space-x-2">
                  <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <span className="font-medium text-gray-900 min-w-[100px] text-center">
                    {formatMonthYear()}
                  </span>
                  <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-100 rounded">
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* 달력 날짜들 */}
              <div className="grid grid-cols-7 gap-2">
                {getCalendarDays().map((day, index) => (
                  <div key={index} className="aspect-square flex items-center justify-center">
                    {day && (
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-sm ${getStudyIntensity(day)} ${
                        getStudyIntensity(day) === 'bg-gray-100' ? 'text-gray-400' : 'text-white font-medium'
                      }`}>
                        {day}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* 범례 */}
              <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
                <span>일일 수업 수</span>
                <div className="flex items-center space-x-2">
                  <span>0</span>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                    <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                    <div className="w-3 h-3 bg-blue-800 rounded-sm"></div>
                  </div>
                  <span>20 초과</span>
                </div>
              </div>
            </div>

            {/* 주간별 학습량 차트 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">주간별 학습 통계</h2>
              
              <div className="space-y-4">
                {weeklyData.map((week, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium text-gray-600">{week.week}</div>
                    
                    <div className="flex-1 flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} className="text-blue-500" />
                        <span className="text-sm text-gray-600">학습</span>
                        <span className="text-sm font-medium">{week.study}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Trophy size={14} className="text-green-500" />
                        <span className="text-sm text-gray-600">퀴즈</span>
                        <span className="text-sm font-medium">{week.quiz}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Target size={14} className="text-yellow-500" />
                        <span className="text-sm text-gray-600">노트</span>
                        <span className="text-sm font-medium">{week.note}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Check size={14} className="text-purple-500" />
                        <span className="text-sm text-gray-600">복습</span>
                        <span className="text-sm font-medium">{week.review}</span>
                      </div>
                    </div>
                    
                    {/* 진행률 바 */}
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((week.study / 20) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}