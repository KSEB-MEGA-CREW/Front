import React from "react";
import {
  X,
  Clock,
  MessageSquare,
  RotateCcw,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "../../Context/themeContext";

const TransHistoryModal = ({ 
  isOpen, 
  onClose, 
  translationHistory, 
  onClearHistory, 
  onReplayTranslation 
}) => {
  const { theme, isDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        style={{ backdropFilter: "blur(4px)" }}
      />

      {/* 모달 콘텐츠 */}
      <div
        className={`
        relative w-full max-w-2xl mx-4 rounded-2xl shadow-2xl transform transition-all max-h-[80vh] overflow-hidden
        ${
          theme === "high-contrast"
            ? "bg-black border-yellow-400 border-4"
            : isDarkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }
      `}
      >
        {/* 헤더 */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            theme === "high-contrast"
              ? "border-yellow-400 border-b-4"
              : isDarkMode
              ? "border-gray-700"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
              p-2 rounded-lg
              ${
                theme === "high-contrast"
                  ? "bg-black border-2 border-yellow-400 text-yellow-400"
                  : isDarkMode
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }
            `}
            >
              <Clock size={20} />
            </div>
            <h2
              className={`text-2xl font-bold ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              변환 기록
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {translationHistory.length > 0 && (
              <button
                onClick={onClearHistory}
                className={`
                  p-2 rounded-lg transition-colors
                  ${
                    theme === "high-contrast"
                      ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                      : isDarkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  }
                `}
                title="전체 기록 삭제"
              >
                <RotateCcw size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition-colors
                ${
                  theme === "high-contrast"
                    ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                    : isDarkMode
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }
              `}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 변환 기록 내용 */}
        <div className="p-6">
          {translationHistory.length === 0 ? (
            <div className="text-center py-12">
              <div
                className={`
                w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center
                ${
                  theme === "high-contrast"
                    ? "bg-black border-2 border-yellow-400"
                    : isDarkMode
                    ? "bg-gray-700"
                    : "bg-gray-100"
                }
              `}
              >
                <MessageSquare size={32} className={`${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-gray-400" : "text-gray-500"
                }`} />
              </div>
              <h3
                className={`text-xl font-semibold mb-4 ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                아직 변환 기록이 없습니다
              </h3>
              <p
                className={`mb-6 ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                텍스트를 수어로 변환하면 기록이 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              <div
                className={`text-sm mb-4 flex items-center gap-2 ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <Calendar size={16} />
                <span>총 {translationHistory.length}개의 변환 기록</span>
              </div>
              
              {translationHistory.map((item, index) => (
                <div
                  key={item.id}
                  className={`
                    rounded-lg p-4 border transition-all duration-200 cursor-pointer hover:shadow-md
                    ${
                      theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                        : isDarkMode
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }
                  `}
                  onClick={() => onReplayTranslation && onReplayTranslation(item.text)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${
                          theme === "high-contrast"
                            ? "bg-black border-1 border-yellow-400 text-yellow-400"
                            : isDarkMode
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-blue-100 text-blue-600"
                        }
                      `}
                      >
                        #{translationHistory.length - index}
                      </span>
                      {item.status === "COMPLETED" && (
                        <CheckCircle 
                          size={14} 
                          className={
                            theme === "high-contrast"
                              ? "text-yellow-400"
                              : "text-green-500"
                          } 
                        />
                      )}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        theme === "high-contrast"
                          ? "text-yellow-400"
                          : isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <Clock size={12} />
                      <span>{item.timestamp.toLocaleDateString("ko-KR")}</span>
                      <span>{item.timestamp.toLocaleTimeString("ko-KR", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}</span>
                    </div>
                  </div>

                  <p
                    className={`text-sm leading-relaxed mb-2 ${
                      theme === "high-contrast" 
                        ? "text-yellow-400" 
                        : isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {item.text}
                  </p>

                  {item.duration && (
                    <div
                      className={`text-xs ${
                        theme === "high-contrast"
                          ? "text-yellow-400"
                          : isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      재생 시간: {item.duration}초
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 - 기록이 있을 때만 표시 */}
        {translationHistory.length > 0 && (
          <div
            className={`
            p-4 border-t text-center
            ${
              theme === "high-contrast"
                ? "border-yellow-400 border-t-4 bg-black"
                : isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            }
          `}
          >
            <p
              className={`text-sm ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              기록을 클릭하면 해당 텍스트를 다시 변환할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransHistoryModal;