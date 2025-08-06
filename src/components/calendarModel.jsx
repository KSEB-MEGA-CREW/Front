import React, { useState, useEffect } from "react";
import { quizApi } from "../api/authApi";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ✅ 색상 및 범례 정보. range를 고유 식별자로 사용
const ACCURACY_LEVELS = [
  { range: "0", label: "0점", color: "bg-gray-700" },
  { range: "1-20", label: "1-20점", color: "bg-green-300" },
  { range: "21-40", label: "21-40점", color: "bg-green-400" },
  { range: "41-60", label: "41-60점", color: "bg-green-500" },
  { range: "61-80", label: "61-80점", color: "bg-green-600" },
  { range: "81-99", label: "81-99점", color: "bg-green-700" },
  { range: "100", label: "100점", color: "bg-green-900" },
];
// 모든 range 값들의 배열
const allRanges = ACCURACY_LEVELS.map((l) => l.range);

function CalendarModal({ isOpen, onClose, userId }) {
  const [activeDate, setActiveDate] = useState(new Date());
  const [quizHistory, setQuizHistory] = useState({});
  // ✅ 필터링 상태를 Set으로 관리하여 여러 범위를 동시에 선택/해제
  const [activeRanges, setActiveRanges] = useState(new Set(allRanges));

  useEffect(() => {
    if (isOpen) {
      // 컴포넌트가 열릴 때마다 모든 필터를 활성화 상태로 초기화
      setActiveRanges(new Set(allRanges));

      const fetchMonthlyData = async () => {
        // ... (데이터 로딩 로직은 이전과 동일)
        const year = activeDate.getFullYear();
        const month = activeDate.getMonth() + 1;
        try {
          const result = await quizApi.getUserQuizHistory(year, month, userId);
          const actualData = result?.data || result || [];
          if (!Array.isArray(actualData)) {
            setQuizHistory({});
            return;
          }
          const historyMap = actualData.reduce((acc, record) => {
            if (record.date) acc[record.date] = { accuracy: record.accuracy };
            return acc;
          }, {});
          console.log("퀴즈 기록 로딩 완료:", historyMap);
          setQuizHistory(historyMap);
        } catch (error) {
          console.error("퀴즈 기록 로딩 실패:", error);
          setQuizHistory({});
        }
      };
      fetchMonthlyData();
    }
  }, [activeDate, isOpen, userId]);

  if (!isOpen) return null;

  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getAccuracyRange = (accuracy) => {
    if (accuracy <= 0) return "0"; // -1과 0을 함께 처리
    if (accuracy > 0 && accuracy <= 20) return "1-20";
    if (accuracy > 20 && accuracy <= 40) return "21-40";
    if (accuracy > 40 && accuracy <= 60) return "41-60";
    if (accuracy > 60 && accuracy <= 80) return "61-80";
    if (accuracy > 80 && accuracy < 100) return "81-99";
    if (accuracy === 100) return "100";
    return null;
  };

  // ✅ 범례 클릭 시 해당 범위를 Set에서 추가하거나 제거하는 토글 핸들러
  const handleLegendToggle = (range) => {
    setActiveRanges((prevRanges) => {
      const newRanges = new Set(prevRanges);
      if (newRanges.has(range)) {
        newRanges.delete(range);
      } else {
        newRanges.add(range);
      }
      return newRanges;
    });
  };

  const renderCalendarGrid = () => {
    const tiles = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      tiles.push(
        <div key={`empty-${i}`} className="w-10 h-10 rounded-md"></div>
      );
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(new Date(year, month, day));
      const dayData = quizHistory[dateString];
      const accuracy = dayData?.accuracy ?? -1; // 데이터 없으면 -1 처리

      const currentRange = getAccuracyRange(accuracy);
      const level = ACCURACY_LEVELS.find((l) => l.range === currentRange);

      // ✅ 필터링 로직: activeRanges Set에 현재 날짜의 범위가 포함되어 있는지 확인
      const isVisible = activeRanges.has(currentRange);
      const colorClass = isVisible ? level?.color : ACCURACY_LEVELS[0].color; // 비활성화 시 0점 색상

      tiles.push(
        <div
          key={day}
          className={`w-10 h-10 rounded-md flex items-center justify-center text-xs font-semibold transition-all duration-200 ${colorClass}`}
        >
          {day}
        </div>
      );
    }
    return tiles;
  };

  const changeMonth = (offset) => {
    setActiveDate(
      new Date(activeDate.getFullYear(), activeDate.getMonth() + offset, 1)
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl p-6 mx-4 bg-gray-900 rounded-xl shadow-lg text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 부분 (이전과 동일) */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">월간 학습 기록</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 rounded-md hover:bg-gray-700 text-lg"
            >
              {" "}
              &lt;{" "}
            </button>
            <span className="font-semibold text-lg">
              {activeDate.getFullYear()}년 {activeDate.getMonth() + 1}월
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-1 rounded-md hover:bg-gray-700 text-lg"
            >
              {" "}
              &gt;{" "}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
          <span>일</span>
          <span>월</span>
          <span>화</span>
          <span>수</span>
          <span>목</span>
          <span>금</span>
          <span>토</span>
        </div>

        <div className="grid grid-cols-7 gap-2 justify-items-center">
          {renderCalendarGrid()}
        </div>

        <hr className="my-6 border-gray-700" />

        {/* ✅ 토글 기능이 적용된 범례 */}
        <div className="flex justify-center items-center flex-wrap gap-2 text-xs">
          <span className="text-gray-400 mr-2">정답률:</span>
          {ACCURACY_LEVELS.map((level) => {
            const isActive = activeRanges.has(level.range);
            return (
              <div
                key={level.range}
                onClick={() => handleLegendToggle(level.range)}
                className={`flex items-center cursor-pointer p-1 rounded-md transition-opacity ${
                  isActive ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
              >
                <div className={`w-4 h-4 rounded-sm mr-2 ${level.color}`}></div>
                <span>{level.label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={() => setActiveRanges(new Set(allRanges))}
            className="text-xs text-blue-400 hover:underline"
          >
            전체 선택
          </button>
          <button
            onClick={() => setActiveRanges(new Set())}
            className="text-xs text-blue-400 hover:underline"
          >
            전체 해제
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default CalendarModal;
