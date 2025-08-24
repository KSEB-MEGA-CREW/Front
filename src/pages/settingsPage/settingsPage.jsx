import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Context/themeContext";
import {
  Settings,
  Moon,
  Sun,
  Info,
  Shield,
  ChevronRight,
  Eye,
} from "lucide-react";
import DeleteAccountModal from "../../components/modals/DeleteAccountModal";

const SettingsPage = () => {
  const { theme, setTheme, isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div
      className={`min-h-screen p-6 ${
        theme === "high-contrast"
          ? "bg-black text-yellow-400"
          : isDarkMode
          ? "bg-gray-900"
          : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 페이지 헤더 */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div
              className={`
              p-3 rounded-lg
              ${
                theme === "high-contrast"
                  ? "bg-black text-yellow-400 border-2 border-yellow-400"
                  : isDarkMode
                  ? "bg-gray-800 text-gray-300"
                  : "text-gray-600"
              }
            `}
            >
              <Settings size={32} />
            </div>
            <h1
              className={`text-4xl font-bold ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              설정
            </h1>
          </div>
          <p
            className={`text-lg ${
              theme === "high-contrast"
                ? "text-yellow-400"
                : isDarkMode
                ? "text-gray-300"
                : "text-gray-600"
            }`}
          >
            앱 설정을 개인화하고 사용 경험을 향상시키세요
          </p>
        </div>

        {/* 설정 섹션들 */}
        <div className="space-y-6">
          {/* 테마 설정 */}
          <div
            className={`
            p-6 rounded-2xl shadow-lg border
            ${
              theme === "high-contrast"
                ? "bg-black border-yellow-400 border-4"
                : isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className={`
                  p-3 rounded-lg
                  ${
                    theme === "high-contrast"
                      ? "bg-high-contrast-600 text-yellow-400 border-3 border-yellow-400"
                      : isDarkMode
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                  }
                `}
                >
                  <Settings size={24} />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      theme === "high-contrast"
                        ? "text-yellow-400"
                        : isDarkMode
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    테마 설정
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "high-contrast"
                        ? "text-yellow-400"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    원하는 테마를 선택하세요
                  </p>
                </div>
              </div>

              {/* 테마 선택 라디오 버튼 */}
              <div className="space-y-3">
                {/* 라이트 모드 */}
                <label className="flex items-center space-x-3 cursor-pointer ">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === "light"}
                    onChange={() => setTheme("light")}
                    className={`w-4 h-4 ${
                      theme === "high-contrast"
                        ? "accent-yellow-400 border-3 border-yellow-400"
                        : "text-blue-600"
                    }`}
                  />
                  <div className="flex items-center gap-2 -ml-0.5">
                    <span
                      className={` ${
                        theme === "high-contrast"
                          ? "text-yellow-400"
                          : isDarkMode
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      라이트 모드
                    </span>
                  </div>
                </label>

                {/* 다크 모드 */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === "dark"}
                    onChange={() => setTheme("dark")}
                    className={`w-4 h-4 ${
                      theme === "high-contrast"
                        ? "accent-yellow-400 border-3 border-yellow-400"
                        : "text-blue-600"
                    }`}
                  />
                  <div className="flex items-center gap-2 -ml-0.5">
                    <span
                      className={` ${
                        theme === "high-contrast"
                          ? "text-yellow-400"
                          : isDarkMode
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      다크 모드
                    </span>
                  </div>
                </label>

                {/* 고대비 모드 */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="high-contrast"
                    checked={theme === "high-contrast"}
                    onChange={() => setTheme("high-contrast")}
                    className={`w-4 h-4 ${
                      theme === "high-contrast"
                        ? "accent-yellow-400 border-3 border-yellow-400"
                        : "text-blue-600"
                    }`}
                  />
                  <div className="flex items-center gap-2 -ml-0.5">
                    <div>
                      <span
                        className={` ${
                          theme === "high-contrast"
                            ? "text-yellow-400"
                            : isDarkMode
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        고대비 모드
                      </span>
                      <p
                        className={`text-xs ${
                          theme === "high-contrast"
                            ? "text-yellow-400"
                            : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        시각 장애인을 위한 고대비 테마 (WCAG 2.0 AAA)
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 개인정보 및 보안 */}
          <div
            className={`
            p-6 rounded-2xl shadow-lg border
            ${
              theme === "high-contrast"
                ? "bg-black border-yellow-400 border-4"
                : isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`
                p-3 rounded-lg
                  ${
                    theme === "high-contrast"
                      ? "bg-black border-2 border-yellow-400 text-yellow-400"
                      : isDarkMode
                      ? "bg-green-500/20 text-green-500"
                      : "bg-green-100 text-green-700"
                  }
              `}
              >
                <Shield size={24} />
              </div>
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  개인정보 및 보안
                </h3>
                <p
                  className={`text-sm ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  계정 보안 및 개인정보 설정
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/privacy-policy")}
                className={`
                  w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between group
                  ${
                    theme === "high-contrast"
                      ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                      : isDarkMode
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-700"
                  }
                `}
              >
                <span>개인정보 처리방침</span>
                <ChevronRight
                  size={16}
                  className={`transition-transform group-hover:translate-x-1 ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                />
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className={`
                  w-full text-left p-3 rounded-lg transition-colors
                  ${
                    theme === "high-contrast"
                      ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                      : isDarkMode
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-700"
                  }
                `}
              >
                계정 삭제
              </button>
            </div>
          </div>

          {/* 앱 정보 */}
          <div
            className={`
            p-6 rounded-2xl shadow-lg border
            ${
              theme === "high-contrast"
                ? "bg-black border-yellow-400 border-4"
                : isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div className="flex items-center gap-4 mb-4">
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
                <Info size={24} />
              </div>
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  앱 정보
                </h3>
                <p
                  className={`text-sm ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  앱 버전 및 지원 정보
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-3">
                <span
                  className={`${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  앱 버전
                </span>
                <span
                  className={`${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  v1.0.0
                </span>
              </div>
              <button
                onClick={() => navigate("/terms-of-service")}
                className={`
                    w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between group
                    ${
                      theme === "high-contrast"
                        ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                        : isDarkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-100 text-gray-700"
                    }
                  `}
              >
                <span>이용약관</span>
                <ChevronRight
                  size={16}
                  className={`transition-transform group-hover:translate-x-1 ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 계정 삭제 확인 모달 */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
