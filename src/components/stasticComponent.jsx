import React, { useState, useEffect } from "react";
import { quizApi } from "../api/authApi";
import { useTheme } from "../Context/themeContext";

// 요일 이름을 반환하는 헬퍼 함수
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return days[date.getDay()];
};

// 최근 7일 날짜 배열 생성
const getRecentSevenDays = () => {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date.toISOString().split("T")[0]); // YYYY-MM-DD 형식
  }

  return days;
};

const StasticComponent = () => {
  const { isDarkMode } = useTheme();
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // localStorage에서 사용자 정보 가져오기
        const userInfo = JSON.parse(localStorage.getItem("user"));
        if (!userInfo || !userInfo.id) {
          throw new Error("사용자 정보를 찾을 수 없습니다.");
        }

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1

        // API 호출로 월별 데이터 가져오기
        const monthlyData = await quizApi.getUserQuizHistory(
          year,
          month,
          userInfo.id
        );

        // 최근 7일 날짜 배열 생성
        const recentDays = getRecentSevenDays();

        // 월별 데이터에서 최근 7일 데이터만 필터링 및 매핑
        const weeklyQuizData = recentDays.map((date) => {
          const dayData = monthlyData.find((item) => item.date === date);
          let accuracy = -1; // 기본값을 -1로 설정 (기록 없음)

          if (dayData) {
            accuracy = dayData.accuracy; // 실제 데이터값 사용 (-1, 0, 또는 양수)
          }

          return {
            date: date,
            accuracy: accuracy,
          };
        });

        setWeeklyData(weeklyQuizData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch weekly accuracy:", err);
        setError(err.message || "데이터를 불러오는 데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 정답률에 따라 원의 색상과 텍스트 색상을 결정
  const getCircleStyle = (accuracy) => {
    if (accuracy === -1)
      return {
        bg: "bg-gray-300",
        text: "text-gray-600",
        shadow: "shadow-lg",
      }; // 기록이 없는 날
    if (accuracy >= 90)
      return {
        bg: "bg-emerald-500",
        text: "text-white",
        shadow: "shadow-emerald-200",
      };
    if (accuracy >= 80)
      return {
        bg: "bg-blue-500",
        text: "text-white",
        shadow: "shadow-blue-200",
      };
    if (accuracy >= 70)
      return {
        bg: "bg-amber-500",
        text: "text-white",
        shadow: "shadow-amber-200",
      };
    if (accuracy >= 60)
      return {
        bg: "bg-orange-500",
        text: "text-white",
        shadow: "shadow-orange-200",
      };
    return {
      bg: "bg-red-500",
      text: "text-white",
      shadow: "shadow-red-200",
    }; // 0%~59% (0% 포함)
  };

  // 정답률에 따라 원의 크기를 결정 (레이아웃 안전성을 고려한 크기 시스템)
  const getCircleSize = (accuracy) => {
    if (accuracy === -1) return 30; // 기록이 없는 날은 작은 크기

    // 컨테이너 안에서 안전한 크기 범위로 조정
    const minSize = 35;
    const maxSize = 60; // 최대 크기를 줄여서 오버플로우 방지

    // 정답률에 따른 단계별 크기 조정
    if (accuracy >= 90) return maxSize;
    if (accuracy >= 80) return maxSize - 8;
    if (accuracy >= 70) return maxSize - 12;
    if (accuracy >= 60) return maxSize - 16;
    if (accuracy >= 40) return maxSize - 20;
    if (accuracy >= 20) return maxSize - 22;
    return minSize; // 0-19%
  };

  // 로딩 상태
  if (loading) {
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
          주간 학습
        </h2>
        <div className="flex justify-center items-center h-48">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              데이터를 불러오는 중...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
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
          주간 학습
        </h2>
        <div
          className={`flex justify-center items-center h-48 rounded-xl ${
            isDarkMode ? "bg-red-900/20" : "bg-red-50"
          }`}
        >
          <div className="text-center">
            <div className="text-red-400 text-sm font-semibold">{error}</div>
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
    <div
      className={`rounded-2xl shadow-sm border p-6 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
      }`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className={`text-xl font-bold flex items-center gap-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            📊 주간 학습 성취도
          </h2>
          <p
            className={`text-sm mt-1 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            최근 7일간의 학습 기록을 확인해보세요
          </p>
        </div>
        <div className="text-right">
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
              isDarkMode
                ? "text-blue-300 bg-blue-900/30 border-blue-700"
                : "text-blue-600 bg-blue-50 border-blue-100"
            }`}
          >
            이번주 성취 리포트
          </span>
        </div>
      </div>

      {/* 주간 차트 영역 */}
      <div className="mb-10">
        <div
          className={`rounded-2xl p-6 mb-6 ${
            isDarkMode
              ? "bg-gradient-to-b from-gray-700/30 to-transparent"
              : "bg-gradient-to-b from-gray-50/50 to-transparent"
          }`}
        >
          <div className="flex justify-between items-end h-36 px-2">
            {weeklyData.map((item, index) => {
              const size = getCircleSize(item.accuracy);
              const circleStyle = getCircleStyle(item.accuracy);
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center justify-end group relative"
                >
                  {/* 정답률을 나타내는 원 */}
                  <div
                    className={`${circleStyle.bg} ${circleStyle.shadow} rounded-full flex items-center justify-center font-bold transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 cursor-pointer relative overflow-hidden transform group-hover:-translate-y-1`}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      fontSize: `${Math.max(9, size * 0.28)}px`,
                      minWidth: `${size}px`,
                      minHeight: `${size}px`,
                    }}
                  >
                    <span
                      className={`relative z-10 ${circleStyle.text} drop-shadow-sm font-extrabold`}
                    >
                      {item.accuracy === -1 ? "―" : `${item.accuracy}%`}
                    </span>
                    {/* 호버 효과 - 빛나는 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full transform rotate-45"></div>
                    {/* 펄스 효과 */}
                    <div className="absolute inset-0 rounded-full animate-pulse opacity-0 group-hover:opacity-20 bg-white transition-all duration-300"></div>
                  </div>

                  {/* 호버 툴팁 */}
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 py-3 rounded-xl text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105 whitespace-nowrap z-30 shadow-2xl border border-gray-600/50 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="font-bold text-base mb-1">
                        {item.accuracy === -1 ? (
                          <span className="text-gray-300 flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            학습 기록 없음
                          </span>
                        ) : (
                          <span
                            className={`flex items-center gap-2 ${
                              item.accuracy >= 80
                                ? "text-green-300"
                                : item.accuracy >= 60
                                ? "text-yellow-300"
                                : "text-red-300"
                            }`}
                          >
                            <span
                              className={`text-2xl ${
                                item.accuracy >= 80
                                  ? "🎉"
                                  : item.accuracy >= 60
                                  ? "👍"
                                  : item.accuracy > 0
                                  ? "💪"
                                  : "😔"
                              }`}
                            ></span>
                            정답률 {item.accuracy}%
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs font-semibold bg-gray-700/50 px-2 py-1 rounded-full">
                        {new Date(item.date).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          weekday: "short",
                        })}
                      </div>
                    </div>
                    {/* 툴팁 화살표 - 개선된 디자인 */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-800"></div>
                      <div className="w-0 h-0 border-l-5 border-r-5 border-t-5 border-transparent border-t-gray-700 absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 요일 레이블 */}
          <div className="flex justify-between mt-6 px-2">
            {weeklyData.map((item, index) => {
              const isToday =
                new Date(item.date).toDateString() ===
                new Date().toDateString();
              return (
                <div key={index} className="flex-1 text-center">
                  <p
                    className={`text-sm font-semibold ${
                      isToday
                        ? "text-blue-600"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    {getDayOfWeek(item.date)}
                  </p>
                  <p
                    className={`text-xs mt-1 px-2 py-1 rounded-full ${
                      isToday
                        ? isDarkMode
                          ? "text-blue-300 bg-blue-900/30 border border-blue-700"
                          : "text-blue-600 bg-blue-50 border border-blue-200"
                        : isDarkMode
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    {new Date(item.date).getDate()}일
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 범례 - 개선된 디자인 */}
      <div
        className={`rounded-xl p-4 ${
          isDarkMode ? "bg-gray-700/30" : "bg-gray-50"
        }`}
      >
        <h3
          className={`text-sm font-semibold text-center mb-3 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          성취도 가이드
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div
            className={`flex items-center space-x-2 p-2 rounded-lg shadow-sm ${
              isDarkMode ? "bg-gray-700" : "bg-white"
            }`}
          >
            <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-sm"></div>
            <span
              className={`font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              90% 이상
            </span>
          </div>
          <div
            className={`flex items-center space-x-2 p-2 rounded-lg shadow-sm ${
              isDarkMode ? "bg-gray-700" : "bg-white"
            }`}
          >
            <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
            <span
              className={`font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              80-89%
            </span>
          </div>
          <div
            className={`flex items-center space-x-2 p-2 rounded-lg shadow-sm ${
              isDarkMode ? "bg-gray-700" : "bg-white"
            }`}
          >
            <div className="w-4 h-4 bg-amber-500 rounded-full shadow-sm"></div>
            <span
              className={`font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              70-79%
            </span>
          </div>
          <div
            className={`flex items-center space-x-2 p-2 rounded-lg shadow-sm ${
              isDarkMode ? "bg-gray-700" : "bg-white"
            }`}
          >
            <div className="w-4 h-4 bg-orange-500 rounded-full shadow-sm"></div>
            <span
              className={`font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              60-69%
            </span>
          </div>
          <div
            className={`flex items-center space-x-2 p-2 rounded-lg shadow-sm ${
              isDarkMode ? "bg-gray-700" : "bg-white"
            }`}
          >
            <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
            <span
              className={`font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              60% 미만
            </span>
          </div>
          <div
            className={`flex items-center space-x-2 p-2 rounded-lg shadow-sm ${
              isDarkMode ? "bg-gray-700" : "bg-white"
            }`}
          >
            <div className="w-4 h-4 bg-gray-300 rounded-full shadow-sm"></div>
            <span
              className={`font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              기록 없음
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StasticComponent;
