import React, { useState } from "react";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { authApi } from "../../api/authApi";
import {
  ArrowLeft,
  Headphones,
  Mail,
  Phone,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerSupport = () => {
  const { theme, isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    message: "",
    isPublic: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { id: "technical", label: "기술적 문제", icon: "⚙️" },
    { id: "account", label: "계정 관련", icon: "👤" },
    { id: "learning", label: "학습 문의", icon: "📚" },
    { id: "feature", label: "기능 제안", icon: "💡" },
    { id: "other", label: "기타", icon: "❓" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 폼 검증
    if (
      !formData.category ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 서버에 지원 요청 제출
      const supportData = {
        userName: user?.username || "익명",
        category: formData.category,
        subject: formData.subject.trim(),
        content: formData.message.trim(),
        isPublic: formData.isPublic,
      };

      const response = await authApi.submitSupportTicket(supportData);

      if (response.success) {
        setIsSubmitted(true);
        // 폼 초기화
        setFormData({
          category: "",
          subject: "",
          message: "",
          isPublic: false,
        });
        setSelectedCategory("");
      } else {
        throw new Error(response.message || "문의 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("문의 전송 오류:", error);
      // alert 대신 더 사용자 친화적인 오류 표시를 위해 상태 추가 가능
      alert(
        error.message ||
          "문의 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        theme === "high-contrast"
          ? "bg-black"
          : isDarkMode
          ? "bg-gray-900"
          : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`
              p-3 rounded-lg
              ${
                theme === "high-contrast"
                  ? "bg-black border-2 border-yellow-400 text-yellow-400"
                  : isDarkMode
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-purple-100 text-purple-600"
              }
            `}
            >
              <Headphones size={32} />
            </div>
            <h1
              className={`text-4xl font-bold ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              고객 지원
            </h1>
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`
            p-6 rounded-2xl shadow-lg border text-center
            ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400"
                : isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div
              className={`
              w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
              ${
                theme === "high-contrast"
                  ? "bg-black border-2 border-yellow-400"
                  : isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
              }
            `}
            >
              <Mail
                size={24}
                className={`${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              이메일
            </h3>
            <p
              className={`text-sm mb-2 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              24시간 이내 답변
            </p>
            <p
              className={`font-medium ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              <a
                href="mailto:dissolve1882@naver.com"
                className={`hover:text-blue-500 transition-colors`}
              >
                dissolve1882@naver.com
              </a>
            </p>
          </div>

          <div
            className={`
            p-6 rounded-2xl shadow-lg border text-center
            ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400"
                : isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div
              className={`
              w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
              ${
                theme === "high-contrast"
                  ? "bg-black border-2 border-yellow-400"
                  : isDarkMode ? "bg-green-500/20" : "bg-green-100"
              }
            `}
            >
              <Phone
                size={24}
                className={`${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-green-500" : "text-green-700"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              전화 상담
            </h3>
            <p
              className={`text-sm mb-2 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              평일 09:00~18:00
            </p>
            <p
              className={`font-medium ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode ? "text-green-500" : "text-green-700"
              }`}
            >
              010-3738-1882
            </p>
          </div>

          <div
            className={`
            p-6 rounded-2xl shadow-lg border text-center
            ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400"
                : isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div
              className={`
              w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
              ${
                theme === "high-contrast"
                  ? "bg-black border-2 border-yellow-400"
                  : isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
              }
            `}
            >
              <MessageCircle
                size={24}
                className={`${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-purple-400" : "text-purple-600"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              라이브 채팅
            </h3>
            <p
              className={`text-sm mb-2 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              평일 09:00~18:00
            </p>
            <p
              className={`font-medium ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode ? "text-purple-400" : "text-purple-600"
              }`}
            >
              <a
                href="https://open.kakao.com/o/sKrWTeNh"
                target="_blank"
                rel="noopener noreferrer"
              >
                오픈채팅 바로가기
              </a>
            </p>
          </div>
        </div>

        {/* 문의 양식 */}
        <div
          className={`
          p-8 rounded-2xl shadow-lg border
          ${
            theme === "high-contrast"
              ? "bg-black border-2 border-yellow-400"
              : isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }
        `}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${
              theme === "high-contrast"
                ? "text-yellow-400"
                : isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            문의하기
          </h2>

          {isSubmitted ? (
            <div className="text-center py-12">
              <div
                className={`
                w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center
                ${
                  theme === "high-contrast"
                    ? "bg-black border-2 border-yellow-400"
                    : isDarkMode ? "bg-green-500/20" : "bg-green-100"
                }
              `}
              >
                <CheckCircle size={32} className={`${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : "text-green-500"
                }`} />
              </div>
              <h3
                className={`text-xl font-semibold mb-4 ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                문의가 성공적으로 전송되었습니다!
              </h3>
              <p
                className={`mb-6 ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                24시간 이내에 답변드리겠습니다.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                새로운 문의하기
              </button>
              <div className="text-center pt-4">
                <button
                  onClick={() => navigate("/inquiry-board")}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  QnA 게시판에서 답변 확인하기
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 카테고리 선택 */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  문의 카테고리
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        handleInputChange("category", category.id);
                      }}
                      className={`
                        p-3 rounded-lg border text-left transition-colors
                        ${
                          selectedCategory === category.id
                            ? theme === "high-contrast"
                              ? "bg-yellow-400 text-black border-2 border-yellow-400"
                              : isDarkMode
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-blue-600 border-blue-500 text-white"
                            : theme === "high-contrast"
                            ? "border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black text-yellow-400"
                            : isDarkMode
                            ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                            : "border-gray-300 hover:bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-semibold">
                          {category.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 사용자 정보 표시 */}

              {/* 제목 */}
              <div className="mt-10">
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  제목 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className={`
                    w-full px-4 py-3 rounded-lg border transition-colors
                    ${
                      theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 text-yellow-400 focus:border-yellow-400"
                        : isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  `}
                  placeholder="문의 제목을 입력하세요"
                />
              </div>

              {/* 메시지 */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  문의 내용 *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className={`
                    w-full px-4 py-3 rounded-lg border transition-colors resize-none
                    ${
                      theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 text-yellow-400 focus:border-yellow-400"
                        : isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  `}
                  placeholder="문의 내용을 상세히 입력해주세요..."
                />
              </div>

              {/* 공개/비공개 선택 */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  공개 설정
                </label>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="isPublic"
                      checked={!formData.isPublic}
                      onChange={() => handleInputChange("isPublic", false)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div
                        className={`text-sx font-semibold ${
                          theme === "high-contrast"
                            ? "text-yellow-400"
                            : isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        🔒 비공개 문의
                      </div>
                      <div
                        className={`text-xs ${
                          theme === "high-contrast"
                            ? "text-yellow-400"
                            : isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        본인과 관리자만 볼 수 있습니다
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={() => handleInputChange("isPublic", true)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div
                        className={`text-sx font-semibold ${
                          theme === "high-contrast"
                            ? "text-yellow-400"
                            : isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        🌐 공개 문의
                      </div>
                      <div
                        className={`text-xs ${
                          theme === "high-contrast"
                            ? "text-yellow-400"
                            : isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        모든 사용자가 볼 수 있습니다 (FAQ 효과)
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 제출 버튼 */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.subject ||
                    !formData.message ||
                    !formData.category
                  }
                  className={`
                    w-full py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2
                    ${
                      isSubmitting ||
                      !formData.subject ||
                      !formData.message ||
                      !formData.category
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      전송 중...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      문의 전송
                    </>
                  )}
                </button>
              </div>

              {/* 안내 메시지 및 문의 게시판 링크 */}
              <div className="space-y-4">
                <div
                  className={`
                  p-4 rounded-lg border-l-4
                  ${
                    theme === "high-contrast"
                      ? "border-yellow-400 bg-black"
                      : "border-blue-500 " + (isDarkMode ? "bg-blue-900/20" : "bg-blue-50")
                  }
                `}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      size={18}
                      className="text-blue-500 mt-0.5 flex-shrink-0"
                    />
                    <div
                      className={`text-sm ${
                        theme === "high-contrast"
                          ? "text-yellow-400"
                          : isDarkMode ? "text-blue-200" : "text-blue-600"
                      }`}
                    >
                      <p className="font-semibold mb-1">문의 전 확인사항</p>
                      <ul className="space-y-1 text-xs">
                        <li>
                          • 기술적 문제의 경우 구체적인 오류 메시지나 상황을
                          포함해주세요.
                        </li>
                        <li>
                          • 계정 관련 문의 시 보안을 위해 비밀번호는 포함하지
                          마세요.
                        </li>
                        <li>
                          • 평일 업무시간(09:00~18:00) 내 문의는 당일
                          답변드립니다.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => navigate("/inquiry-board")}
                    className={`
                      px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2 border
                      ${
                        theme === "high-contrast"
                          ? "border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black text-yellow-400"
                          : isDarkMode
                          ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                          : "border-gray-300 hover:bg-gray-100 text-gray-700"
                      }
                    `}
                  >
                    <MessageCircle size={16} />
                    QnA 게시판 보기
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* FAQ 섹션 */}
        <div
          className={`
          p-8 rounded-2xl shadow-lg border 
          ${
            theme === "high-contrast"
              ? "bg-black border-2 border-yellow-400"
              : isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }
        `}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${
              theme === "high-contrast"
                ? "text-yellow-400"
                : isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            <details
              className={`
              p-4 rounded-lg border
              ${
                theme === "high-contrast"
                  ? "border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                  : isDarkMode
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-gray-200 hover:bg-gray-100"
              }
            `}
            >
              <summary
                className={`font-semibold cursor-pointer ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-white " : "text-gray-900"
                }`}
              >
                비밀번호를 잊어버렸어요
              </summary>
              <p
                className={`mt-3 text-sm ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                로그인 페이지에서 "비밀번호 찾기"를 클릭하시고, 가입한 이메일
                주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
              </p>
            </details>

            <details
              className={`
              p-4 rounded-lg border
                            ${
                              theme === "high-contrast"
                                ? "border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                                : isDarkMode
                                ? "border-gray-600 hover:bg-gray-700"
                                : "border-gray-200 hover:bg-gray-100"
                            }
            `}
            >
              <summary
                className={`font-semibold cursor-pointer ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                카메라가 작동하지 않아요
              </summary>
              <p
                className={`mt-3 text-sm ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                브라우저에서 카메라 접근 권한을 허용했는지 확인해주세요. 설정
                &gt; 개인정보 보호 &gt; 카메라에서 해당 브라우저의 권한을 확인할
                수 있습니다.
              </p>
            </details>

            <details
              className={`
              p-4 rounded-lg border
                           ${
                             theme === "high-contrast"
                               ? "border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                               : isDarkMode
                               ? "border-gray-600 hover:bg-gray-700"
                               : "border-gray-200 hover:bg-gray-100"
                           }
            `}
            >
              <summary
                className={`font-semibold cursor-pointer ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                학습 진도가 저장되지 않아요
              </summary>
              <p
                className={`mt-3 text-sm ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                로그인 상태를 확인해주세요. 로그아웃 상태에서는 학습 진도가
                저장되지 않습니다. 또한 브라우저의 쿠키 설정을 확인해주세요.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
