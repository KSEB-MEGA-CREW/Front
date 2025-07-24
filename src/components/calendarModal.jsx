import React from "react";
import Calendar from "react-calendar";

// 날짜를 'YYYY-MM-DD' 형식으로 변환하는 헬퍼 함수
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function CalendarModal({ isOpen, onClose, quizHistory }) {
  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  // 각 날짜 타일에 적용할 Tailwind CSS 클래스를 반환하는 함수
  const getTileClassName = ({ date, view }) => {
    // 월(month) 뷰에서만 클래스를 적용
    if (view === "month") {
      const dateString = formatDate(date);
      const dayData = quizHistory[dateString];

      if (dayData) {
        const percentage = (dayData.correct / dayData.total) * 100;
        // 정답률에 따라 다른 배경색 클래스를 반환
        if (percentage >= 80)
          return "!bg-green-700 !text-white hover:!bg-green-600"; // 4문제 이상
        if (percentage >= 50)
          return "!bg-yellow-600 !text-white hover:!bg-yellow-500"; // 3문제 이상
        return "!bg-red-700 !text-white hover:!bg-red-600"; // 2문제 이하
      }
    }
    return null;
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
