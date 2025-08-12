import React from "react";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import CalendarModel from "../../components/calendarModel";
import StasticComponent from "../../components/stasticComponent";
import { Calendar, TrendingUp } from "lucide-react";

const StatsPage = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 페이지 헤더 */}
        <div className="text-center space-y-3">
          <h1
            className={`text-4xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            학습 통계
          </h1>
          <p
            className={`text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            당신의 수어 학습 진행 상황을 확인하세요
          </p>
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 캘린더 섹션 */}
          <div
            className={`
            p-6 rounded-2xl shadow-lg border
            ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`
                p-3 rounded-lg
                ${
                  isDarkMode
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                }
              `}
              >
                <Calendar size={24} />
              </div>
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  학습 캘린더
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  일별 학습 기록을 확인하세요
                </p>
              </div>
            </div>
            <CalendarModel userId={user?.id} />
          </div>

          {/* 통계 차트 섹션 */}
          <div
            className={`
            p-6 rounded-2xl shadow-lg border
            ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`
                p-3 rounded-lg
                ${
                  isDarkMode
                    ? "bg-green-500/20 text-green-400"
                    : "bg-green-100 text-green-600"
                }
              `}
              >
                <TrendingUp size={24} />
              </div>
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  학습 통계
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  월별 진행 상황과 성과를 분석하세요
                </p>
              </div>
            </div>
            <StasticComponent />
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div
          className={`
          p-6 rounded-2xl shadow-lg border text-center
          ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }
        `}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <h3
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              꾸준한 학습이 성공의 열쇠입니다
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              매일 조금씩이라도 꾸준히 학습하면 더 나은 수어 실력을 기를 수
              있습니다. 통계를 통해 자신의 학습 패턴을 파악하고 개선해보세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
