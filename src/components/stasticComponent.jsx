import React, { useState, useEffect } from "react";
import { quizApi } from "../api/authApi";

// 요일 이름을 반환하는 헬퍼 함수
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return days[date.getDay()];
};

const StasticComponent = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 실제 API 호출 시도
        try {
          const response = await quizApi.getWeeklyAccuracy();
          if (response && response.data) {
            setWeeklyData(response.data);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn("API 호출 실패, 목업 데이터 사용:", apiError);
        }
        
        // API 실패 시 목업 데이터 사용
        const mockData = [
          { date: '2025-08-01', accuracy: 85 },
          { date: '2025-08-02', accuracy: 92 },
          { date: '2025-08-03', accuracy: 78 },
          { date: '2025-08-04', accuracy: 88 },
          { date: '2025-08-05', accuracy: 95 },
          { date: '2025-08-06', accuracy: 82 },
          { date: '2025-08-07', accuracy: 90 }
        ];
        
        // 목업 데이터 로딩 시뮬레이션
        setTimeout(() => {
          setWeeklyData(mockData);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("Failed to fetch weekly accuracy:", err);
        setError("데이터를 불러오는 데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 정답률에 따라 원의 색상을 결정 (배경색을 직접 변경)
  const getCircleColor = (accuracy) => {
    if (accuracy >= 90) return 'bg-emerald-500';
    if (accuracy >= 80) return 'bg-blue-500';
    if (accuracy >= 70) return 'bg-amber-500';
    if (accuracy >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // 정답률에 따라 원의 크기를 결정 (원래 크기로 복구)
  const getCircleSize = (accuracy) => {
    const minSize = 50;
    const maxSize = 90;
    return minSize + (accuracy / 100) * (maxSize - minSize);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">주간 학습</h2>
        <div className="flex justify-center items-center h-48">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-sm text-gray-500">데이터를 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">주간 학습</h2>
        <div className="flex justify-center items-center h-48 bg-red-50 rounded-xl">
          <div className="text-center">
            <div className="text-red-400 text-sm font-medium">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-xs text-red-600 hover:text-red-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">주간 학습</h2>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
          이번주 사용자님의 성취!
        </span>
      </div>

      {/* 주간 차트 영역 */}
      <div className="mb-8">
        <div className="flex justify-between items-end h-40 px-2">
          {weeklyData.map((item, index) => {
            const size = getCircleSize(item.accuracy);
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-end group relative"
              >
                {/* 정답률을 나타내는 원 */}
                <div
                  className={`${getCircleColor(item.accuracy)} rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ease-in-out group-hover:scale-110 shadow-lg cursor-pointer relative overflow-hidden`}
                  style={{ 
                    width: `${size}px`, 
                    height: `${size}px`,
                    fontSize: `${Math.max(10, size * 0.2)}px`
                  }}
                >
                  <span className="relative z-10">{item.accuracy}</span>
                  {/* 호버 효과 */}
                  <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-full"></div>
                </div>

                {/* 호버 툴팁 */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                  <div className="text-center">
                    <div className="font-semibold">정답률 {item.accuracy}%</div>
                    <div className="text-gray-300 text-[10px] mt-1">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                  {/* 툴팁 화살표 */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 요일 레이블 */}
        <div className="flex justify-between mt-4 px-2">
          {weeklyData.map((item, index) => (
            <div key={index} className="flex-1 text-center">
              <p className="text-sm font-medium text-gray-700">
                {getDayOfWeek(item.date)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(item.date).getDate()}
              </p>
            </div>
          ))}
        </div>
      </div>

     
      {/* 범례 */}
      <div className="flex justify-center items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-gray-600">90% 이상</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">80-89%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-gray-600">70-79%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-gray-600">60-69%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">60% 미만</span>
        </div>
      </div>
    </div>
  );
};

export default StasticComponent;