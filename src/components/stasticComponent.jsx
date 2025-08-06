import React, { useState, useEffect } from "react";
import { quizApi } from "../api/authApi"; // api 파일 경로는 실제 프로젝트 구조에 맞게 수정해주세요.

// 요일 이름을 반환하는 헬퍼 함수
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return days[date.getDay()];
};

const GrapeComponent = () => {
  // 주간 정답률 데이터, 로딩 상태, 에러 상태를 관리합니다.
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // --- 임시 목업 데이터 ---
        // 실제 API 연동 시 이 부분은 삭제하고 아래 주석 처리된 API 호출 코드를 활성화하세요.

        const response = await quizApi.getWeeklyAccuracy();
        if (response && response.data) {
          setWeeklyData(response.data);
        } else {
          throw new Error("Invalid data format from API");
        }
      } catch (err) {
        console.error("Failed to fetch weekly accuracy:", err);
        setError(
          "데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행합니다.

  // 정답률에 따른 원의 색상 결정
  const getCircleColor = (accuracy) => {
    if (accuracy >= 90) return 'bg-green-500';
    if (accuracy >= 80) return 'bg-blue-500';
    if (accuracy >= 70) return 'bg-yellow-500';
    if (accuracy >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // 정답률에 따른 원의 크기 결정
  const getCircleSize = (accuracy) => {
    const minSize = 40; // 최소 크기
    const maxSize = 80; // 최대 크기
    return minSize + (accuracy / 100) * (maxSize - minSize);
  };

  // 로딩 중일 때 표시할 UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="text-gray-500">데이터를 불러오는 중입니다...</div>
      </div>
    );
  }

  // 에러 발생 시 표시할 UI
  if (error) {
    return (
      <div className="flex justify-center items-center h-80 bg-red-50 rounded-lg">
        <div className="text-red-500 font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">주간 정답률</h2>

      {/* 원형 차트 영역 */}
      <div className="flex justify-between items-center w-full h-64 py-8">
        {weeklyData.map((item, index) => {
          const size = getCircleSize(item.accuracy);
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-center group relative"
            >
              {/* 정답률을 나타내는 원 */}
              <div
                className={`${getCircleColor(item.accuracy)} rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ease-in-out group-hover:scale-110 shadow-lg cursor-pointer`}
                style={{ 
                  width: `${size}px`, 
                  height: `${size}px`,
                  fontSize: `${Math.max(12, size * 0.25)}px`
                }}
              >
                {item.accuracy}%
              </div>

              {/* 호버 시 추가 정보 표시 */}
              <div className="absolute -top-12 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                정답률: {item.accuracy}%
              </div>
            </div>
          );
        })}
      </div>

      {/* X축 레이블 영역: 요일 및 날짜 */}
      <div className="flex justify-between w-full mt-2">
        {weeklyData.map((item, index) => (
          <div key={index} className="flex-1 px-2 text-center">
            <p className="text-sm font-medium text-gray-600">
              {getDayOfWeek(item.date)}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(item.date).getDate()}일
            </p>
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div className="flex justify-center items-center space-x-4 mt-6 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">90% 이상</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">80-89%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
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

      <div className="flex justify-end mt-4">
        <p className="text-xs text-gray-400">* 최근 7일간의 데이터입니다.</p>
      </div>
    </div>
  );
};

export default GrapeComponent;