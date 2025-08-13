import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../../Context/themeContext";

const Pagination = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  showInfo = true,
}) => {
  const { isDarkMode } = useTheme();

  // 페이지 범위 계산 (현재 페이지 주변 5개 페이지 표시)
  const getPageNumbers = () => {
    const delta = 2; // 현재 페이지 양쪽으로 표시할 페이지 수
    const range = [];
    const rangeWithDots = [];

    // 시작과 끝 페이지 계산
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // 첫 페이지 추가
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push("...");
      }
    }

    // 중간 페이지들 추가
    rangeWithDots.push(...range);

    // 마지막 페이지 추가
    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  // 현재 페이지의 시작-끝 항목 번호 계산
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalElements);

  if (totalPages <= 1) {
    return null; // 페이지가 1개 이하면 페이징 표시 안함
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* 현재 페이지 정보 */}
      {showInfo && (
        <div
          className={`text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          전체 {totalElements}개 중 {startItem}-{endItem}개 표시
        </div>
      )}

      {/* 페이징 버튼들 */}
      <div className="flex items-center gap-2">
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-colors
            ${
              currentPage === 1
                ? isDarkMode
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }
          `}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">이전</span>
        </button>

        {/* 페이지 번호들 */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === "..." ? (
                <span
                  className={`px-2 py-2 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  ...
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(pageNum)}
                  className={`
                    px-3 py-2 rounded-lg font-medium transition-colors min-w-[40px]
                    ${
                      pageNum === currentPage
                        ? "bg-blue-600 text-white"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }
                  `}
                >
                  {pageNum}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-colors
            ${
              currentPage === totalPages
                ? isDarkMode
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }
          `}
        >
          <span className="hidden sm:inline">다음</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 빠른 이동 (10페이지 이상인 경우만 표시) */}
      {totalPages >= 10 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`
              px-2 py-1 text-xs rounded transition-colors
              ${
                currentPage === 1
                  ? isDarkMode
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-gray-400 cursor-not-allowed"
                  : isDarkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-500"
              }
            `}
          >
            처음으로
          </button>
          <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            |
          </span>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`
              px-2 py-1 text-xs rounded transition-colors
              ${
                currentPage === totalPages
                  ? isDarkMode
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-gray-400 cursor-not-allowed"
                  : isDarkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-500"
              }
            `}
          >
            마지막으로
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;