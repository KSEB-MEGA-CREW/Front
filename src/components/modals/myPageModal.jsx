import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Calendar,
  Edit2,
  Save,
  AlertCircle,
  Ear,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../Context/authContext";
import { useTheme } from "../../Context/themeContext";

const MyPageModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editData, setEditData] = useState({
    username: user?.username || "",
    hearing: user?.hearing || "",
  });

  // user가 변경될 때마다 editData 동기화
  useEffect(() => {
    setEditData({
      username: user?.username || "",
      hearing: user?.hearing || "",
    });
  }, [user]);

  // 청각상태 표시 함수
  const getHearingStatusText = (status) => {
    switch (status) {
      case "NORMAL":
        return "청인";
      case "DEAF":
        return "농인";
      default:
        return "아직 정하지 않음";
    }
  };

  if (!isOpen) return null;

  const handleEditToggle = () => {
    if (isEditMode) {
      // 편집 모드 취소
      setEditData({
        username: user?.username || "",
        hearing: user?.hearing || "",
      });
      setError("");
      setSuccessMessage("");
    }
    setIsEditMode(!isEditMode);
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
    setSuccessMessage("");
  };

  const handleSave = async () => {
    if (!editData.username.trim()) {
      setError("사용자명을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // AuthContext의 updateUser 함수를 통해 서버 업데이트 및 상태 관리
      // 이 함수가 API 호출, localStorage, React 상태를 모두 관리함
      await updateUser({
        username: editData.username,
        hearing: editData.hearing,
      });

      setIsEditMode(false);
      setSuccessMessage("프로필이 성공적으로 수정되었습니다.");

      // 성공 메시지를 3초 후 자동으로 숨기기
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("프로필 수정 실패:", error);

      // 서버 에러 메시지 표시
      if (error.message) {
        setError(error.message);
      } else {
        setError("프로필 수정 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 콘텐츠 */}
      <div
        className={`
        relative w-full max-w-md mx-4 rounded-2xl shadow-2xl transform transition-all
        ${
          isDarkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }
      `}
      >
        {/* 헤더 */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {isEditMode ? "프로필 수정" : "내 계정"}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditMode && (
              <button
                onClick={handleEditToggle}
                className={`
                  p-2 rounded-lg transition-colors
                  ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  }
                `}
                title="프로필 수정"
              >
                <Edit2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition-colors
                ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }
              `}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 사용자 정보 */}
        <div className="p-6 space-y-6">
          {/* 프로필 이미지 및 기본 정보 */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div
                className={`
                w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold
                ${
                  isDarkMode
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                    : "bg-gradient-to-br from-blue-400 to-purple-500 text-white"
                }
              `}
              >
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
            <div>
              <h3
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {user?.username || "사용자"}
              </h3>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                수어 학습자
              </p>
            </div>
          </div>

          {/* 계정 정보 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`
                p-2 rounded-lg
                ${
                  isDarkMode
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                }
              `}
              >
                <User size={18} />
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  사용자명
                </p>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className={`
                      w-full mt-1 px-3 py-2 rounded-lg border transition-colors
                      ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20
                    `}
                    placeholder="사용자명을 입력하세요"
                  />
                ) : (
                  <p
                    className={`font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user?.username || "사용자"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`
                p-2 rounded-lg
                ${
                  isDarkMode
                    ? "bg-green-500/20 text-green-400"
                    : "bg-green-100 text-green-600"
                }
              `}
              >
                <Ear size={18} />
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  청각상태
                </p>
                {isEditMode ? (
                  <select
                    value={editData.hearing}
                    onChange={(e) =>
                      handleInputChange("hearing", e.target.value)
                    }
                    className={`
                      w-full mt-1 px-3 py-2 rounded-lg border transition-colors
                      ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20
                    `}
                  >
                    <option value="">청각상태를 선택하세요</option>
                    <option value="NORMAL">청인</option>
                    <option value="DEAF">농인</option>
                  </select>
                ) : (
                  <p
                    className={`font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {getHearingStatusText(user?.hearing)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`
                p-2 rounded-lg
                ${
                  isDarkMode
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-purple-100 text-purple-600"
                }
              `}
              >
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  가입일
                </p>
                <p
                  className={`font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {user?.createdDate
                    ? new Date(user.createdDate).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "날짜 없음"}
                </p>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div
              className={`
              p-3 rounded-lg border flex items-center gap-2
              ${
                isDarkMode
                  ? "bg-red-900/20 border-red-700 text-red-400"
                  : "bg-red-50 border-red-200 text-red-600"
              }
            `}
            >
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* 성공 메시지 */}
          {successMessage && (
            <div
              className={`
              p-3 rounded-lg border flex items-center gap-2
              ${
                isDarkMode
                  ? "bg-green-900/20 border-green-700 text-green-400"
                  : "bg-green-50 border-green-200 text-green-600"
              }
            `}
            >
              <CheckCircle size={16} />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          {/* 액션 버튼들 */}
          {isEditMode ? (
            <div
              className={`space-y-3 pt-4 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`
                  w-full p-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2
                  ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white
                `}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    저장하기
                  </>
                )}
              </button>
              <button
                onClick={handleEditToggle}
                disabled={isLoading}
                className={`
                  w-full p-3 rounded-lg font-semibold transition-colors border
                  ${
                    isDarkMode
                      ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                      : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                취소
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MyPageModal;
