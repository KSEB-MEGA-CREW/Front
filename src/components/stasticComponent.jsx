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

      {/* 차트 영역: 막대 그래프 */}
      <div className="flex justify-between items-end w-full h-64 border-b-2 border-gray-200">
        {weeklyData.map((item, index) => (
          <div
            key={index}
            className="flex-1 px-2 h-full relative flex justify-center items-end group"
          >
            {/* 막대 위에 표시될 정답률 텍스트 (마우스 호버 시 보임) */}
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {item.accuracy}%
            </span>
            {/* 실제 막대 */}
            <div
              className="w-full bg-blue-400 rounded-t-lg transition-all duration-300 ease-in-out group-hover:bg-blue"
              style={{ height: `${item.accuracy}%` }}
            ></div>
          </div>
        ))}
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

      <div className="flex justify-end mt-4">
        <p className="text-xs text-gray-400">* 최근 7일간의 데이터입니다.</p>
      </div>
    </div>
  );
};

export default GrapeComponent;
