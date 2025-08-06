import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { quizApi } from "../api/authApi"; // api 폴더 위치에 따라 경로 조정

// 날짜 포맷팅 함수는 그대로
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function CalendarModal({ isOpen, onClose, userId }) {
  const [activeDate, setActiveDate] = useState(new Date());
  const [quizHistory, setQuizHistory] = useState({});

  useEffect(() => {
    if (isOpen) {
      const fetchMonthlyData = async () => {
        const year = activeDate.getFullYear();
        const month = activeDate.getMonth() + 1;

        try {
          const result = await quizApi.getUserQuizHistory(year, month, userId);
          // result가 undefined면 조기 반환
          if (!result) {
            console.error("API 응답이 비정상적입니다:", result);
            setQuizHistory({});
            return;
          }
          // 서버 응답 구조에 따라 result 또는 result.data로 처리
          const actualData = result.data || result;

          if (!Array.isArray(actualData)) {
            throw new Error(
              "서버 응답이 배열이 아닙니다: " + JSON.stringify(result)
            );
          }
          const historyMap = actualData.reduce((acc, record) => {
            const recordDate = record.date || record.data;
            if (recordDate) {
              acc[recordDate] = { accuracy: record.accuracy };
            }
            return acc;
          }, {});
          setQuizHistory(historyMap);
        } catch (error) {
          console.error(
            "퀴즈 기록을 불러오는 데 실패했습니다.",
            error,
            error.response
          );
          setQuizHistory({});
        }
      };

      fetchMonthlyData();
    }
  }, [activeDate, isOpen, userId]);

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  // 각 날짜 타일에 적용할 Tailwind CSS 클래스를 반환하는 함수 (수정됨)
  const getTileClassName = ({ date, view }) => {
    // 월(month) 뷰에서만 클래스를 적용
    if (view === "month") {
      const dateString = formatDate(date);
      const dayData = quizHistory[dateString];

      if (dayData && dayData.accuracy > 0) {
        // 데이터가 있고, 정답률이 0보다 클 때만 색상 표시
        const percentage = dayData.accuracy;
        // 정답률에 따라 다른 배경색 클래스를 반환
        if (percentage >= 80)
          return "!bg-green-700 !text-white hover:!bg-green-600 rounded-lg";
        if (percentage >= 50)
          return "!bg-yellow-600 !text-white hover:!bg-yellow-500 rounded-lg";
        return "!bg-red-700 !text-white hover:!bg-red-600 rounded-lg";
      }
    }
    return null; // 데이터가 없으면 기본 스타일 적용
  };

  return (
    // 모달 오버레이
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity"
      onClick={onClose} // 배경 클릭 시 모달 닫기
    >
      {/* 모달 컨텐츠 */}
      <div
        className="relative w-full max-w-lg p-6 mx-4 bg-gray-800 rounded-xl shadow-lg"
        onClick={(e) => e.stopPropagation()} // 컨텐츠 클릭 시 닫기 방지
      >
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          퀴즈 기록
        </h2>
        <Calendar
          locale="ko-KR" // 한국어 설정
          tileClassName={getTileClassName} // 날짜별 동적 클래스 적용
          formatDay={(locale, date) => date.getDate()} // 날짜에서 '일' 제거
          // 사용자가 월을 변경할 때 activeDate 상태를 업데이트
          onActiveStartDateChange={({ activeStartDate }) =>
            setActiveDate(activeStartDate)
          }
        />
        <div className="mt-6 flex justify-center items-center space-x-6 text-sm text-gray-300">
          <div className="flex items-center">
            <span className="w-4 h-4 bg-green-700 rounded-sm mr-2"></span>
            <span>정답률 80% 이상</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-yellow-600 rounded-sm mr-2"></span>
            <span>정답률 50% 이상</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-red-700 rounded-sm mr-2"></span>
            <span>정답률 50% 미만</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default CalendarModal;
