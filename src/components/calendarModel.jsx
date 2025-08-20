import React, { useState, useEffect, useMemo } from "react";
import { quizApi } from "../api/authApi";
import { useTheme } from "../Context/themeContext";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const COLOR_THEMES = {
  green: {
    name: "초록색",
    colors: {
      "no-quiz": "bg-gray-300",
      0: "bg-gray-500",
      "1-20": "bg-green-200",
      "21-40": "bg-green-300",
      "41-60": "bg-green-400",
      "61-80": "bg-green-500",
      "81-99": "bg-green-600",
      100: "bg-green-700",
    },
  },
  blue: {
    name: "파란색",
    colors: {
      "no-quiz": "bg-gray-300",
      0: "bg-gray-500",
      "1-20": "bg-blue-200",
      "21-40": "bg-blue-300",
      "41-60": "bg-blue-400",
      "61-80": "bg-blue-500",
      "81-99": "bg-blue-600",
      100: "bg-blue-700",
    },
  },
  purple: {
    name: "보라색",
    colors: {
      "no-quiz": "bg-gray-300",
      0: "bg-gray-500",
      "1-20": "bg-purple-200",
      "21-40": "bg-purple-300",
      "41-60": "bg-purple-400",
      "61-80": "bg-purple-500",
      "81-99": "bg-purple-600",
      100: "bg-purple-700",
    },
  },
};

// 색상 및 범례 정보 생성 함수
const createAccuracyLevels = (theme) => [
  {
    range: "no-quiz",
    label: "안푼 날",
    color: COLOR_THEMES[theme].colors["no-quiz"],
  },
  { range: "0", label: "0%", color: COLOR_THEMES[theme].colors["0"] },
  { range: "1-20", label: "1-20%", color: COLOR_THEMES[theme].colors["1-20"] },
  {
    range: "21-40",
    label: "21-40%",
    color: COLOR_THEMES[theme].colors["21-40"],
  },
  {
    range: "41-60",
    label: "41-60%",
    color: COLOR_THEMES[theme].colors["41-60"],
  },
  {
    range: "61-80",
    label: "61-80%",
    color: COLOR_THEMES[theme].colors["61-80"],
  },
  {
    range: "81-99",
    label: "81-99%",
    color: COLOR_THEMES[theme].colors["81-99"],
  },
  { range: "100", label: "100%", color: COLOR_THEMES[theme].colors["100"] },
];

function CalendarModel({ userId }) {
  // isModal, isOpen, onClose props 제거
  const [activeDate, setActiveDate] = useState(new Date());
  const [quizHistory, setQuizHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [colorTheme, setColorTheme] = useState("green");
  const { isDarkMode } = useTheme();

  const ACCURACY_LEVELS = useMemo(
    () => createAccuracyLevels(colorTheme),
    [colorTheme]
  );
  const allRanges = useMemo(
    () => ACCURACY_LEVELS.map((l) => l.range),
    [ACCURACY_LEVELS]
  );

  const [activeRanges, setActiveRanges] = useState(new Set());

  useEffect(() => {
    setActiveRanges(new Set(allRanges));
  }, [allRanges]);

  useEffect(() => {
    if (!userId) {
      setQuizHistory({});
      setLoading(false);
      return;
    }

    const fetchMonthlyData = async () => {
      setLoading(true);
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
        setQuizHistory(historyMap);
      } catch (error) {
        console.error("퀴즈 기록 로딩 실패:", error);
        setQuizHistory({});
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlyData();
  }, [activeDate, userId]);

  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getAccuracyRange = (accuracy) => {
    if (accuracy === -1) return "no-quiz";
    if (accuracy === 0) return "0";
    if (accuracy > 0 && accuracy <= 20) return "1-20";
    if (accuracy > 20 && accuracy <= 40) return "21-40";
    if (accuracy > 40 && accuracy <= 60) return "41-60";
    if (accuracy > 60 && accuracy <= 80) return "61-80";
    if (accuracy > 80 && accuracy < 100) return "81-99";
    if (accuracy === 100) return "100";
    return "no-quiz";
  };

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
      const accuracy = dayData?.accuracy ?? -1;
      const currentRange = getAccuracyRange(accuracy);
      const level = ACCURACY_LEVELS.find((l) => l.range === currentRange);
      const isVisible = activeRanges.has(currentRange);
      const colorClass = isVisible ? level?.color : ACCURACY_LEVELS[0].color;

      tiles.push(
        <div
          key={day}
          className={`w-10 h-10 rounded-md flex items-center justify-center text-xs font-semibold transition-all duration-200 text-gray-600 ${colorClass}`}
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

  if (loading) {
    const LoadingContent = (
      <div className="flex justify-center items-center h-80">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-sm text-gray-500">달력을 불러오는 중...</span>
        </div>
      </div>
    );
    // 로딩 화면 단순화
    return (
      <div
        className={`rounded-2xl shadow-sm border p-6 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        }`}
      >
        <h2
          className={`text-lg font-bold mb-6 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          연간 학습
        </h2>
        {LoadingContent}
      </div>
    );
  }

  // 메인 달력 컨텐츠
  const CalendarContent = (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2
          className={`text-lg font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          연간 학습
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => changeMonth(-1)}
            className={`p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span
            className={`text-lg font-semibold min-w-[100px] text-center ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {activeDate.getFullYear()}년 {activeDate.getMonth() + 1}월
          </span>
          <button
            onClick={() => changeMonth(1)}
            className={`p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-sm mb-4 text-gray-500">
        <span>일</span>
        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>
        <span>토</span>
      </div>

      <div className="grid grid-cols-7 gap-2 justify-items-center mb-6">
        {renderCalendarGrid()}
      </div>

      <hr
        className={`my-6 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
      />

      <div
        className={`text-center text-xs mb-3 ${
          isDarkMode ? "text-gray-300" : "text-gray-800"
        }`}
      >
        💡 아래 정답률 박스를 클릭하면 해당하는 날짜만 달력에서 확인할 수
        있어요!
      </div>

      <div className="flex justify-center items-center flex-wrap gap-2 text-xs mb-4">
        <span
          className={`mr-2 ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}
        >
          정답률:
        </span>
        {ACCURACY_LEVELS.map((level) => {
          const isActive = activeRanges.has(level.range);
          return (
            <div
              key={level.range}
              onClick={() => handleLegendToggle(level.range)}
              className={`flex items-center cursor-pointer p-2 rounded-md transition-opacity ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-300"
              } ${isActive ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
            >
              <div className={`w-3 h-3 rounded-sm mr-2 ${level.color}`}></div>
              <span
                className={`${isDarkMode ? "text-gray-300" : "text-gray-800"}`}
              >
                {level.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setActiveRanges(new Set(allRanges))}
          className="text-xs hover:underline text-blue-400 hover:text-blue-700"
        >
          전체 선택
        </button>
        <button
          onClick={() => setActiveRanges(new Set())}
          className="text-xs hover:underline text-blue-400 hover:text-blue-700"
        >
          전체 해제
        </button>
      </div>

      <div className="flex justify-center items-center gap-2 mb-4">
        <span
          className={`text-xs ${
            isDarkMode ? "text-gray-300" : "text-gray-800"
          }`}
        >
          색상 테마:
        </span>
        {Object.entries(COLOR_THEMES).map(([themeKey, theme]) => (
          <button
            key={themeKey}
            onClick={() => setColorTheme(themeKey)}
            className={`text-xs px-2 py-1 rounded-md transition-all ${
              colorTheme === themeKey
                ? isDarkMode
                  ? " bg-gray-600 text-gray-300"
                  : "text-gray-800 bg-gray-300"
                : isDarkMode
                ? "text-gray-300 hover:bg-gray-600"
                : "text-gray-800 hover:bg-gray-300"
            }`}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div
      className={`
        rounded-2xl shadow-sm border p-6 
        ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        }
      `}
    >
      {CalendarContent}
    </div>
  );
}

export default CalendarModel;
