import React, { useState } from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { authApi } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { logout } = useAuth(); // user 정보는 여기서 필요 없으므로 제거
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  const handleDeleteAccount = async () => {
    if (confirmText !== "계정삭제") {
      setError('정확히 "계정삭제"를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // 서버에 계정 삭제 요청
      const response = await authApi.deleteAccount();

      if (response.success) {
        const successMessage =
          response.message || "계정이 성공적으로 삭제되었습니다.";

        // 중요: 로그아웃을 먼저 처리합니다.
        logout();
        onClose();

        // 로그인 페이지로 이동하면서 state에 성공 메시지를 담아 전달합니다.
        navigate("/auth/login", {
          replace: true,
          state: { message: successMessage },
        });
      } else {
        setError(response.message || "계정 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("계정 삭제 실패:", error);
      setError(error.message || "계정 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // return (...) 이하의 JSX 코드는 기존과 동일합니다.
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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#ff4444]">
              <AlertTriangle size={24} className="text-gray-100" />
            </div>
            <h2
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              계정 삭제
            </h2>
          </div>
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

        {/* 경고 내용 */}
        <div className="p-6 space-y-4">
          <div
            className={`p-4 rounded-lg border-l-4 border-red-500 ${
              isDarkMode ? "bg-red-900/20" : "bg-red-50"
            }`}
          >
            <h3
              className={`font-semibold mb-2 ${
                isDarkMode ? "text-red-400" : "text-red-700"
              }`}
            >
              ⚠️ 계정 삭제 시 주의사항
            </h3>
            <ul
              className={`space-y-1 text-sm ${
                isDarkMode ? "text-red-300" : "text-red-600"
              }`}
            >
              <li>• 모든 개인 데이터가 영구적으로 삭제됩니다</li>
              <li>• 학습 기록과 퀴즈 결과가 모두 삭제됩니다</li>
              <li>• 삭제된 계정은 복구할 수 없습니다</li>
              <li>• 동일한 이메일로 재가입이 가능합니다</li>
            </ul>
          </div>

          <div>
            <p
              className={`mb-3 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              계정을 삭제하려면 아래에{" "}
              <span className="font-semibold text-red-500">"계정삭제"</span>를
              정확히 입력해주세요.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError("");
              }}
              placeholder="계정삭제"
              className={`
                w-full px-3 py-2 rounded-lg border transition-colors
                ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-red-500"
                    : "bg-white border-gray-300 text-gray-900 focus:border-red-500"
                }
                focus:outline-none focus:ring-2 focus:ring-red-500/20
              `}
            />
          </div>

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
              <AlertTriangle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div
          className={`p-6 border-t space-y-3 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={handleDeleteAccount}
            disabled={isLoading || confirmText !== "계정삭제"}
            className={`
              w-full p-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2
              ${
                isLoading || confirmText !== "계정삭제"
                  ? "bg-gray-400 cursor-not-allowed text-gray-600"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            `}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                계정 삭제하기
              </>
            )}
          </button>
          <button
            onClick={onClose}
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
      </div>
    </div>
  );
};

export default DeleteAccountModal;
