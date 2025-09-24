import React from 'react';
import { useTheme } from '../../../Context/themeContext';

const PredefinedPhrasesPanel = ({
  predefinedPhrases = [],
  selectedPhrase = "",
  onPhraseSelect,
  isDisabled = false
}) => {
  const { theme, isDarkMode } = useTheme();

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
      <h3
        className={`text-lg font-semibold mb-4 ${
          theme === "high-contrast"
            ? "text-yellow-400"
            : isDarkMode
            ? "text-white"
            : "text-gray-800"
        }`}
      >
        자주 사용하는 구문
      </h3>

      {/* 구문 그리드 */}
      <div className="grid grid-cols-2 gap-2">
        {predefinedPhrases.map((phraseObj) => (
          <button
            key={phraseObj.display}
            onClick={() => !isDisabled && onPhraseSelect(phraseObj)}
            disabled={isDisabled}
            className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              selectedPhrase === phraseObj.display
                ? theme === "high-contrast"
                  ? "bg-yellow-400 text-black border-2 border-yellow-400"
                  : "bg-blue-500 text-white shadow-lg"
                : isDisabled
                ? theme === "high-contrast"
                  ? "bg-black border-2 border-yellow-400/50 text-yellow-400/50 cursor-not-allowed opacity-50"
                  : isDarkMode
                  ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100/50 text-gray-500 cursor-not-allowed"
                : theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                : isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
            } ${
              !isDisabled ? 'active:scale-95' : ''
            }`}
            title={
              isDisabled 
                ? "애니메이션 재생 중에는 선택할 수 없습니다" 
                : `"${phraseObj.display}" 구문 선택`
            }
          >
            {phraseObj.display}
          </button>
        ))}
      </div>

      {/* 도움말 */}
      <div 
        className={`mt-4 text-xs ${
          theme === "high-contrast"
            ? "text-yellow-400/70"
            : isDarkMode
            ? "text-gray-400"
            : "text-gray-500"
        }`}
      >
        • 자주 사용하는 구문은 빠른 GLB 애니메이션으로 재생됩니다
        <br />
        • 구문 선택 후 '수어 변환' 버튼을 눌러주세요
      </div>
    </div>
  );
};

export default PredefinedPhrasesPanel;