import React from 'react';
import { MessageSquare, RotateCcw } from 'lucide-react';
import { useTheme } from '../../../Context/themeContext';

const TextInputPanel = ({
  inputText,
  onInputChange,
  onConvert,
  onClear,
  isConvertButtonEnabled,
  placeholder = "수어로 변환할 텍스트를 입력하세요..."
}) => {
  const { theme, isDarkMode } = useTheme();

  const handleTextareaKeyDown = (e) => {
    // Enter 키로 변환 실행 (Shift+Enter는 줄바꿈)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isConvertButtonEnabled) {
        onConvert();
      }
    }
  };

  return (
    <div
      className={`rounded-2xl shadow-lg mb-4 border ${
        theme === "high-contrast"
          ? "bg-black border-2 border-yellow-400 p-4"
          : isDarkMode
          ? "bg-gray-800 border-gray-700 p-6"
          : "bg-white border-gray-200 p-6"
      }`}
    >
      {/* 제목 */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare
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
          텍스트 입력
        </h3>
      </div>

      <div className="space-y-4">
        {/* 텍스트 입력 영역 */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={onInputChange}
            onKeyDown={handleTextareaKeyDown}
            placeholder={placeholder}
            rows={4}
            className={`w-full rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400 text-yellow-400 placeholder-yellow-400/70"
                : isDarkMode
                ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500"
            }`}
            style={{ minHeight: '100px' }}
          />
          
          {/* 글자 수 표시 */}
          <div 
            className={`absolute bottom-2 right-2 text-xs ${
              theme === "high-contrast"
                ? "text-yellow-400/70"
                : isDarkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            {inputText.length} / 1000
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex items-center gap-2">
          <button
            onClick={onConvert}
            disabled={!isConvertButtonEnabled}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-xl transition-all duration-300 transform shadow-lg ${
              !isConvertButtonEnabled
                ? theme === "high-contrast"
                  ? "bg-black border-2 border-yellow-400 text-yellow-400 opacity-50 cursor-not-allowed"
                  : isDarkMode
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                : theme === "high-contrast"
                ? "bg-black border-4 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                : "bg-blue-500 hover:bg-blue-600 text-white hover:scale-[1.02] active:scale-[0.98]"
            }`}
            title={
              !isConvertButtonEnabled 
                ? "텍스트를 입력하고 시스템이 준비될 때까지 기다려주세요" 
                : "수어로 변환 (Enter)"
            }
          >
            수어 변환
          </button>

          <button
            onClick={onClear}
            className={`p-3 rounded-xl transition-all duration-200 ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                : isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
            title="입력 내용 지우기"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* 도움말 텍스트 */}
        <div 
          className={`text-xs ${
            theme === "high-contrast"
              ? "text-yellow-400/70"
              : isDarkMode
              ? "text-gray-400"
              : "text-gray-500"
          }`}
        >
          • Enter 키로 바로 변환할 수 있습니다 (줄바꿈: Shift+Enter)
          <br />
          • 자주 사용하는 구문은 빠르게 처리됩니다
        </div>
      </div>
    </div>
  );
};

export default TextInputPanel;