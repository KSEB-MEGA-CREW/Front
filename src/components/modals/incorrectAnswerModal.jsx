import React, { useState, useEffect } from "react";
import { useAuth } from "../../Context/authContext";
import { useTheme } from "../../Context/themeContext";
import { quizApi } from "../../api/authApi";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Video,
  AlertTriangle,
  Loader,
  X,
} from "lucide-react";

const IncorrectAnswerModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();

  // State
  const [view, setView] = useState("list"); // 'list' 또는 'detail' 뷰 상태
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [filteredAnswers, setFilteredAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const itemsPerPage = 4;

  // 컴포넌트가 열릴 때만 데이터 가져오기
  useEffect(() => {
    if (isOpen && user?.id) {
      const fetchIncorrectAnswers = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const response = await quizApi.getUserIncorrectAnswers(user.id);
          if (response.data) {
            setIncorrectAnswers(response.data);
            setFilteredAnswers(response.data);
          }
        } catch (err) {
          console.error("오답 조회 실패:", err);
          setError("오답을 불러오는 중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchIncorrectAnswers();
    } else if (!isOpen) {
      // 모달이 닫히면 상태 초기화
      setView("list");
      setSearchTerm("");
      setCurrentPage(1);
    }
  }, [isOpen, user?.id]);

  // 검색 필터링
  useEffect(() => {
    const results = searchTerm.trim()
      ? incorrectAnswers.filter(
          (ans) =>
            ans.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ans.signDescription.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : incorrectAnswers;
    setFilteredAnswers(results);
    setCurrentPage(1);
  }, [searchTerm, incorrectAnswers]);

  // 페이징 계산
  const totalPages = Math.ceil(filteredAnswers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredAnswers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 핸들러 함수들
  const handleAnswerClick = (answer, index) => {
    setSelectedAnswer(answer);
    setSelectedIndex(startIndex + index);
    setView("detail");
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setSelectedAnswer(filteredAnswers[newIndex]);
    }
  };

  const handleNext = () => {
    if (selectedIndex < filteredAnswers.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setSelectedAnswer(filteredAnswers[newIndex]);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("ko-KR");

  if (!isOpen) return null;

  // 로딩 및 에러 상태 뷰
  const renderStatusView = (status) => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        {status === "loading" ? (
          <>
            <Loader
              size={48}
              className="animate-spin mx-auto mb-4 text-blue-500"
            />
            <p
              className={`text-lg ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-gray-300"
                  : "text-gray-600"
              }`}
            >
              오답을 불러오는 중...
            </p>
          </>
        ) : (
          <>
            <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
            <p
              className={`text-lg mb-4 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-gray-300"
                  : "text-gray-600"
              }`}
            >
              {error}
            </p>
          </>
        )}
      </div>
    </div>
  );

  // 상세 뷰
  const renderDetailView = () => (
    <div className="flex flex-col h-full">
      {/* 상세 뷰 헤더 */}
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
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-lg transition-colors ${
              theme === "high-contrast"
                ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                : isDarkMode
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Video
              size={20}
              className={`${
                theme === "high-contrast" ? "text-yellow-400" : "text-blue-500"
              }`}
            />
            <h2
              className={`text-xl font-bold ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              {selectedAnswer.word}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={selectedIndex === 0}
            className={`p-2 rounded-lg transition-colors ${
              selectedIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : theme === "high-contrast"
                ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                : isDarkMode
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className={`px-3 py-1 rounded-lg text-sm ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400 text-yellow-400"
                : isDarkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {selectedIndex + 1} / {filteredAnswers.length}
          </span>
          <button
            onClick={handleNext}
            disabled={selectedIndex === filteredAnswers.length - 1}
            className={`p-2 rounded-lg transition-colors ${
              selectedIndex === filteredAnswers.length - 1
                ? "opacity-50 cursor-not-allowed"
                : theme === "high-contrast"
                ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                : isDarkMode
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === "high-contrast"
                ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                : isDarkMode
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <X size={20} />
          </button>
        </div>
      </div>
      {/* 상세 뷰 콘텐츠 */}
      <div className="p-6 flex-1 overflow-y-auto">
        <div
          className={`w-full max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden border mb-6 ${
            theme === "high-contrast"
              ? "border-2 border-yellow-400"
              : isDarkMode
              ? "border-gray-600"
              : "border-gray-300"
          }`}
        >
          <video
            src={selectedAnswer.subDescription}
            controls
            autoPlay // 자동 재생 속성
            muted
            className="w-full h-full object-cover bg-black"
            onError={(e) => {
              console.error("비디오 로드 실패:", e);
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          >
            브라우저가 비디오를 지원하지 않습니다.
          </video>

          {/* 비디오 로드 실패 시 표시될 메시지 */}
          <div
            className={`hidden w-full h-full items-center justify-center ${
              theme === "high-contrast"
                ? "bg-black text-yellow-400"
                : isDarkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <div className="text-center">
              <Video size={48} className="mx-auto mb-2 opacity-50" />
              <p>비디오를 불러올 수 없습니다</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3
              className={`text-sm font-medium mb-2 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
            >
              단어 뜻
            </h3>
            <p
              className={`text-lg font-semibold ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              {selectedAnswer.word}
            </p>
          </div>

          <div>
            <h3
              className={`text-sm font-medium mb-2 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
            >
              수형 정보
            </h3>
            <p
              className={`${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-gray-300"
                  : "text-gray-700"
              }`}
            >
              {selectedAnswer.signDescription}
            </p>
          </div>

          <div>
            <h3
              className={`text-sm font-medium mb-2 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
            >
              틀린 날짜
            </h3>
            <div className="flex items-center gap-2">
              <Calendar
                size={16}
                className={`${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              />
              <span
                className={`${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-gray-300"
                    : "text-gray-600"
                }`}
              >
                {formatDate(selectedAnswer.createdDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 목록 뷰
  const renderListView = () => (
    <div className="flex flex-col h-full">
      {/* 목록 뷰 헤더 */}
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
          <BookOpen
            size={24}
            className={`${
              theme === "high-contrast" ? "text-yellow-400" : "text-blue-500"
            }`}
          />
          <h2
            className={`text-xl font-bold ${
              theme === "high-contrast"
                ? "text-yellow-400"
                : isDarkMode
                ? "text-white"
                : "text-gray-900"
            }`}
          >
            오답 노트
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-sm ${
              theme === "high-contrast"
                ? "text-yellow-400"
                : isDarkMode
                ? "text-gray-400"
                : "text-gray-600"
            }`}
          >
            총 {filteredAnswers.length}개
          </span>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === "high-contrast"
                ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                : isDarkMode
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* 목록 뷰 콘텐츠 */}
      <div className="p-6 flex-1 flex flex-col">
        {/* 검색 바 */}
        <div className="relative mb-4">
          <Search
            size={20}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              theme === "high-contrast"
                ? "text-yellow-400"
                : isDarkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder="오답 단어를 검색하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400 text-yellow-400 placeholder-yellow-400"
                : isDarkMode
                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* 오답 목록 */}
        <div className="flex-1 overflow-y-auto">
          {currentItems.length > 0 ? (
            <>
              <div className="space-y-2 mb-4">
                {currentItems.map((answer, index) => (
                  <div
                    key={`${answer.word}-${answer.createdDate}-${index}`}
                    onClick={() => handleAnswerClick(answer, index)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-gray-900"
                        : isDarkMode
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-1 ${
                            theme === "high-contrast"
                              ? ""
                              : isDarkMode
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {answer.word}
                        </h3>
                        <p
                          className={`text-sm mb-2 ${
                            theme === "high-contrast"
                              ? ""
                              : isDarkMode
                              ? "text-gray-300"
                              : "text-gray-600"
                          }`}
                        >
                          {answer.signDescription}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar size={12} />
                          <span
                            className={`${
                              theme === "high-contrast"
                                ? ""
                                : isDarkMode
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {formatDate(answer.createdDate)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`ml-2 ${
                          theme === "high-contrast"
                            ? ""
                            : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이징 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : theme === "high-contrast"
                        ? "text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        : isDarkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span
                    className={`px-3 py-1 rounded-lg text-sm ${
                      theme === "high-contrast"
                        ? "bg-black border-2 border-yellow-400 text-yellow-400"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : theme === "high-contrast"
                        ? "text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        : isDarkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <BookOpen
                size={48}
                className={`mx-auto mb-4 ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-gray-600"
                    : "text-gray-400"
                }`}
              />
              <h3
                className={`text-lg font-semibold mb-2 ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-gray-300"
                    : "text-gray-600"
                }`}
              >
                {searchTerm ? "검색 결과가 없습니다" : "아직 오답이 없습니다"}
              </h3>
              <p
                className={`text-sm ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                {searchTerm
                  ? "다른 검색어를 시도해보세요"
                  : "퀴즈를 풀면서 틀린 문제들이 여기에 표시됩니다"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 콘텐츠 */}
      <div
        className={`relative w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden border ${
          theme === "high-contrast"
            ? "bg-black border-4 border-yellow-400"
            : isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        {isLoading
          ? renderStatusView("loading")
          : error
          ? renderStatusView("error")
          : view === "list"
          ? renderListView()
          : renderDetailView()}
      </div>
    </div>
  );
};

export default IncorrectAnswerModal;
