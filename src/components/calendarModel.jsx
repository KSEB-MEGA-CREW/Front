import Calendar from "react-calendar";
import React, { useState } from "react";
import 'react-calendar/dist/Calendar.css';

// 날짜를 'YYYY-MM-DD' 형식으로 변환하는 헬퍼 함수
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 한 주 날짜 배열 생성 (주 시작일 기준)
function getWeekDates(startDate) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

// 한 달의 모든 날짜 반환 (해당 월 1일~말일 Date 배열)
function getMonthDates(date) {
  const target = new Date(date);
  const year = target.getFullYear();
  const month = target.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const dates = [];
  for (let d = first; d <= last; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

function CalendarModel({ quizHistory = {} }) {
  const [view, setView] = useState("month"); // "month" 또는 "week"
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 월 단위 타일 색깔 지정
  const getTileClassName = ({ date, view: calView }) => {
    if (calView === "month") {
      const dateString = formatDate(date);
      const dayData = quizHistory[dateString];
      if (dayData) {
        const percentage = (dayData.correct / dayData.total) * 100;
        if (percentage >= 80)
          return "!bg-green-700 !text-white hover:!bg-green-600";
        if (percentage >= 50)
          return "!bg-yellow-600 !text-white hover:!bg-yellow-500";
        return "!bg-red-700 !text-white hover:!bg-red-600";
      }
    }
    return null;
  };

  // 주 단위 날짜 배열, 평균 등 계산
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0(일)~6(토)
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const startOfWeek = getStartOfWeek(selectedDate);
  const weekDates = getWeekDates(startOfWeek);

  // 주별 맞춘 문제 개수, 일요일~토요일 순서
  const weekCorrectCounts = weekDates.map((day) => {
    const key = formatDate(day);
    const data = quizHistory[key];
    return data ? data.correct : 0;
  });

  // 주별 푼 문제 개수, 일요일~토요일 순서
  const weekTotalCounts = weekDates.map((day) => {
    const key = formatDate(day);
    const data = quizHistory[key];
    return data ? data.total : 0;
  });

  // 주별 정답률 = 맞춘 수 합 / 전체 수 합 * 100
  const weekTotalCorrect = weekCorrectCounts.reduce((sum, v) => sum + v, 0);
  const weekTotalSolved = weekTotalCounts.reduce((sum, v) => sum + v, 0);
  const weekPercentage = weekTotalSolved
    ? Math.round((weekTotalCorrect / weekTotalSolved) * 100)
    : null;

  // 월별 평균 정답률
  const monthDates = getMonthDates(selectedDate);
  let monthTotalCorrect = 0,
    monthTotalSolved = 0;
  monthDates.forEach((date) => {
    const key = formatDate(date);
    const d = quizHistory[key];
    if (d) {
      monthTotalCorrect += d.correct;
      monthTotalSolved += d.total;
    }
  });
  const monthPercentage =
    monthTotalSolved > 0 ? (monthTotalCorrect / monthTotalSolved) * 100 : null;

  // 주 요일 이름
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  // y축(최대 맞춘 수) 자동 스케일
  const maxCorrect = Math.max(...weekCorrectCounts, 5);

  return (
    <div className="w-full h-full bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 h-full flex flex-col">
        <h2 className="text-xl font-bold text-white mb-3 text-center">
          퀴즈 기록
        </h2>

        {/* 월/주 전환 버튼 */}
        <div className="mb-3 flex justify-center space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded ${
              view === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-gray-300"
            }`}
            onClick={() => setView("month")}
          >
            월별
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${
              view === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-gray-300"
            }`}
            onClick={() => setView("week")}
          >
            주별
          </button>
        </div>

        {/* 월별 평균 정답률 상단 출력 (월별 뷰일 때만) */}
        {view === "month" && (
          <div className="mb-3 text-sm text-gray-300 font-semibold text-center">
            {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 평균:{" "}
            <span className="text-white font-bold">
              {monthPercentage !== null
                ? monthPercentage.toFixed(1) + "%"
                : "기록 없음"}
            </span>
          </div>
        )}

        <div className="flex-grow overflow-hidden">
          {view === "month" && (
            <div className="h-full">
              <Calendar
                locale="ko-KR"
                tileClassName={getTileClassName}
                formatDay={(locale, date) => date.getDate()}
                onClickDay={(value) => setSelectedDate(value)}
                value={selectedDate}
                view="month"
                className="w-full h-full text-white"
              />
            </div>
          )}

          {view === "week" && (
            <div className="bg-gray-700 p-3 rounded h-full">
              {/* 주별 맞춘 횟수 막대그래프 */}
              <div className="mb-2 flex justify-between px-1 text-xs text-gray-300 font-semibold">
                {weekDays.map((day) => (
                  <span key={day} className="flex-1 text-center">
                    {day}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-end h-20 px-1">
                {weekCorrectCounts.map((cnt, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    {/* 막대 */}
                    <div
                      className="w-4 bg-green-600 rounded-sm"
                      style={{
                        height:
                          maxCorrect > 0
                            ? `${Math.round((cnt / maxCorrect) * 60) || 4}px`
                            : "4px",
                      }}
                    ></div>
                    {/* 값 라벨 */}
                    <span className="mt-1 text-white text-xs">{cnt}</span>
                  </div>
                ))}
              </div>
              {/* 주별 정답률 출력 (퍼센트) */}
              <div className="text-center text-white text-sm font-semibold mt-3">
                주별 정답률:{" "}
                {weekPercentage !== null ? weekPercentage + "%" : "기록 없음"}
              </div>
            </div>
          )}
        </div>

        {/* 색상 legend */}
        <div className="mt-3 flex justify-center items-center space-x-3 text-xs text-gray-300">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-700 rounded-sm mr-1"></span>
            <span>80%+</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-600 rounded-sm mr-1"></span>
            <span>50%+</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-700 rounded-sm mr-1"></span>
            <span>50%-</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarModel;