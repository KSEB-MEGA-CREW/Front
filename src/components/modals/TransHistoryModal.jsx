import React, { useState } from "react";
import {
  X,
  Clock,
  MessageSquare,
  RotateCcw,
  Calendar,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Play,
} from "lucide-react";
import { useTheme } from "../../Context/themeContext";
import { authApi } from "../../api/authApi";

const TransHistoryModal = ({
  isOpen,
  onClose,
  translationHistory,
  onClearHistory,
  onReplayTranslation,
  onUpdateHistory,
}) => {
  const { theme, isDarkMode } = useTheme();
  const [feedbackLoading, setFeedbackLoading] = useState({});

  // 좋아요/싫어요 처리 함수
  const handleFeedback = async (item, feedback) => {
    try {
      setFeedbackLoading((prev) => ({ ...prev, [item.id]: true }));

      // 번역된 시간을 ISO string으로 변환
      const translatedTime = item.timestamp.toISOString();

      await authApi.postTransHistory(
        item.id,
        feedback,
        item.text, // 번역된 문장
        translatedTime // 번역된 시간
      );

      // 부모 컴포넌트에 상태 업데이트 알림
      if (onUpdateHistory) {
        onUpdateHistory(item.id, { status: true, feedback });
      }
    } catch (error) {
      console.error("피드백 전송 실패:", error);
      alert("피드백 전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setFeedbackLoading((prev) => ({ ...prev, [item.id]: false }));
    }
  };

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
                <MessageSquare
                  size={32}
                  className={`${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                />
              </div>
              <h3
                className={`text-xl font-semibold mb-4 ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                아직 변환 기록이 없습니다
              </h3>
              <p
                className={`mb-6 ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-gray-300"
                    : "text-gray-600"
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
                    : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                <Calendar size={16} />
                <span>총 {translationHistory.length}개의 변환 기록</span>
              </div>

              {translationHistory.map((item, index) => (
                <div
                  key={item.id}
                  className={`
                    rounded-lg p-4 border transition-all duration-200
                    ${
                      theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400"
                        : isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-200"
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <span
                        className={`
                        text-sm font-semibold
                        ${
                          theme === "high-contrast"
                            ? "text-yellow-400"
                            : isDarkMode
                            ? "text-gray-300"
                            : "text-gray-800"
                        }
                      `}
                      >
                        {index + 1}. {item.text}
                      </span>
                      {item.status && (
                        <CheckCircle
                          size={16}
                          className={`${
                            theme === "high-contrast"
                              ? "text-yellow-400"
                              : "text-green-500"
                          }`}
                        />
                      )}
                    </div>

                    {/* 피드백 버튼들 */}
                    <div className="flex items-center gap-2">
                      {!item.status ? (
                        <>
                          <button
                            onClick={() => handleFeedback(item, "good")}
                            disabled={feedbackLoading[item.id]}
                            className={`
                              p-2 rounded-lg transition-all duration-200 hover:scale-105
                              ${
                                theme === "high-contrast"
                                  ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border border-yellow-400"
                                  : isDarkMode
                                  ? "text-green-400 hover:bg-green-400 hover:text-gray-900 border border-green-400"
                                  : "text-green-600 hover:bg-green-100 border border-green-300"
                              }
                              ${
                                feedbackLoading[item.id]
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            `}
                            title="좋아요"
                          >
                            <ThumbsUp size={16} />
                          </button>
                          <button
                            onClick={() => handleFeedback(item, "bad")}
                            disabled={feedbackLoading[item.id]}
                            className={`
                              p-2 rounded-lg transition-all duration-200 hover:scale-105
                              ${
                                theme === "high-contrast"
                                  ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border border-yellow-400"
                                  : isDarkMode
                                  ? "text-red-400 hover:bg-red-400 hover:text-gray-900 border border-red-400"
                                  : "text-red-600 hover:bg-red-100 border border-red-300"
                              }
                              ${
                                feedbackLoading[item.id]
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            `}
                            title="싫어요"
                          >
                            <ThumbsDown size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-opacity-20">
                          {item.feedback === "good" ? (
                            <>
                              <ThumbsUp size={14} className="text-green-500" />
                              <span
                                className={`text-xs ${
                                  theme === "high-contrast"
                                    ? "text-yellow-400"
                                    : "text-green-500"
                                }`}
                              >
                                평가 완료
                              </span>
                            </>
                          ) : (
                            <>
                              <ThumbsDown size={14} className="text-red-500" />
                              <span
                                className={`text-xs ${
                                  theme === "high-contrast"
                                    ? "text-yellow-400"
                                    : "text-red-500"
                                }`}
                              >
                                평가 완료
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 타임스탬프와 번역 재생 버튼 */}
                  <div className="flex items-center justify-between">
                    {/* 왼쪽: 타임스탬프와 재생 시간 */}
                    <div className="flex-1">
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          theme === "high-contrast"
                            ? "text-yellow-400"
                            : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        <Clock size={12} />
                        <span>
                          {item.timestamp.toLocaleDateString("ko-KR")}
                        </span>
                        <span>
                          {item.timestamp.toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {item.duration && (
                        <div
                          className={`text-xs mt-1 ${
                            theme === "high-contrast"
                              ? "text-yellow-400"
                              : isDarkMode
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          재생 시간: {item.duration}초
                        </div>
                      )}
                    </div>

                    {/* 오른쪽: 번역 재생 버튼 (좋아요/싫어요 버튼과 같은 너비) */}
                    {
                      <div className="w-[75px] flex items-center">
                        {" "}
                        {/* 좋아요 버튼(40px) + gap(8px) + 싫어요 버튼(40px) + padding 고려하여 112px */}
                        <button
                          onClick={() =>
                            onReplayTranslation &&
                            onReplayTranslation(item.text)
                          }
                          className={`
                            w-full px-3 py-2 rounded-lg transition-all duration-200 hover:scale-[0.98]
                            flex items-center justify-center gap-1 text-xs font-medium
                            ${
                              theme === "high-contrast"
                                ? "bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-yellow-400"
                                : isDarkMode
                                ? "bg-blue-600 text-white hover:bg-blue-700 border border-blue-500"
                                : "bg-blue-500 text-white hover:bg-blue-600 border border-blue-400"
                            }
                          `}
                          title="번역 재생"
                        >
                          <Play size={12} />
                          재생
                        </button>
                      </div>
                    }
                  </div>
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
                  : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
            >
              "번역 재생" 버튼을 클릭하면 해당 텍스트를 다시 변환할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransHistoryModal;
