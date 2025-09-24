import React from 'react';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  User, 
  Square, 
  Clock, 
  MessageSquare 
} from 'lucide-react';
import { useTheme } from '../../../Context/themeContext';

const ControlPanel = ({
  // 설정 패널
  showSettings,
  onToggleSettings,
  
  // 음성 설정
  isSpeechEnabled,
  onToggleSpeech,
  
  // 제어 버튼
  isUnityLoaded,
  isPlaying,
  onResetAvatar,
  onStopAnimation,
  
  // 히스토리
  translationHistoryCount = 0,
  onShowHistory,
  
  // 추가 버튼들
  extraButtons = []
}) => {
  const { theme, isDarkMode } = useTheme();

  return (
    <>
      {/* 설정 버튼 (아바타 화면 우상단) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSettings();
        }}
        className={`p-2 rounded-xl transition-all duration-200 ${
          theme === "high-contrast"
            ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            : isDarkMode
            ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-gray-100"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
        }`}
        title="아바타 설정"
      >
        <Settings size={18} />
      </button>

      {/* 설정 패널 (드롭다운) */}
      {showSettings && (
        <div
          className={`absolute top-16 right-4 rounded-2xl p-6 shadow-2xl z-20 min-w-[280px] border ${
            theme === "high-contrast"
              ? "bg-black border-2 border-yellow-400"
              : isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h4
            className={`text-lg font-semibold mb-4 ${
              theme === "high-contrast"
                ? "text-yellow-400"
                : isDarkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            아바타 설정
          </h4>

          <div className="space-y-4">
            {/* 음성 출력 설정 */}
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-semibold ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-gray-300"
                    : "text-gray-700"
                }`}
              >
                음성 출력
              </span>
              <button
                onClick={onToggleSpeech}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  theme === "high-contrast"
                    ? "border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    : isDarkMode
                    ? "border border-gray-400 hover:bg-gray-500 text-white"
                    : "border border-gray-400 hover:bg-gray-200 text-gray-800"
                }`}
                title={`음성 출력 ${isSpeechEnabled ? '끄기' : '켜기'}`}
              >
                {isSpeechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>

            {/* 컨트롤 버튼들 */}
            <div
              className={`pt-2 border-t ${
                theme === "high-contrast"
                  ? "border-yellow-400"
                  : isDarkMode
                  ? "border-gray-700"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={onResetAvatar}
                  disabled={!isUnityLoaded}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
                    !isUnityLoaded
                      ? theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 text-yellow-400 opacity-50 cursor-not-allowed"
                        : isDarkMode
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : theme === "high-contrast"
                      ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                  title={!isUnityLoaded ? "Unity가 로드될 때까지 기다려주세요" : "아바타 자세 초기화"}
                >
                  <User size={16} />
                  리셋
                </button>

                <button
                  onClick={onStopAnimation}
                  disabled={!isPlaying}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
                    !isPlaying
                      ? theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 text-yellow-400 opacity-50 cursor-not-allowed"
                        : isDarkMode
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : theme === "high-contrast"
                      ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : "bg-[#ff4444] hover:bg-red-600 text-white"
                  }`}
                  title={!isPlaying ? "재생 중인 애니메이션이 없습니다" : "애니메이션 중지"}
                >
                  <Square size={16} />
                  정지
                </button>
              </div>
            </div>

            {/* 추가 버튼들 (확장성) */}
            {extraButtons.length > 0 && (
              <div
                className={`pt-2 border-t ${
                  theme === "high-contrast"
                    ? "border-yellow-400"
                    : isDarkMode
                    ? "border-gray-700"
                    : "border-gray-200"
                }`}
              >
                <div className="space-y-2">
                  {extraButtons.map((button, index) => (
                    <button
                      key={index}
                      onClick={button.onClick}
                      disabled={button.disabled}
                      className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
                        button.disabled
                          ? theme === "high-contrast"
                            ? "bg-black border-2 border-yellow-400 text-yellow-400 opacity-50 cursor-not-allowed"
                            : isDarkMode
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : button.variant === 'danger'
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : theme === "high-contrast"
                          ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                          : "bg-gray-500 hover:bg-gray-600 text-white"
                      }`}
                      title={button.title}
                    >
                      {button.icon && <button.icon size={16} />}
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 변환 기록 패널 */}
      <div
        className={`rounded-2xl shadow-lg border ${
          theme === "high-contrast"
            ? "bg-black border-2 border-yellow-400 p-4"
            : isDarkMode
            ? "bg-gray-800 border-gray-700 p-6"
            : "bg-white border-gray-200 p-6"
        }`}
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Clock
              size={20}
              className={`${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-gray-300"
                  : "text-gray-700"
              }`}
            />
            <h3
              className={`text-lg font-semibold ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-800"
              }`}
            >
              변환 기록
            </h3>
          </div>

          <div
            className={`text-sm mb-4 ${
              theme === "high-contrast"
                ? "text-yellow-400"
                : isDarkMode
                ? "text-gray-400"
                : "text-gray-600"
            }`}
          >
            {translationHistoryCount > 0
              ? `${translationHistoryCount}개의 변환 기록이 있습니다`
              : "아직 변환 기록이 없습니다"}
          </div>

          <button
            onClick={onShowHistory}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-xl transition-all duration-200 ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                : isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
            }`}
          >
            <MessageSquare size={18} />
            변환 기록 보기
          </button>
        </div>
      </div>
    </>
  );
};

export default ControlPanel;