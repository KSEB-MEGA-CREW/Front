import React, { useState, useEffect } from "react";
import { useAuth } from "../../Context/authContext";
import { useTheme } from "../../Context/themeContext";
import { quizApi } from "../../api/authApi";
import BasicLayout from "../../layouts/basicLayout";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Video,
  AlertTriangle,
  Loader,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const IncorrectAnswerPage = () => {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const navigate = useNavigate();

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

  const itemsPerPage = 8;

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    if (user?.id) {
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
    }
  }, [user?.id]);

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
    <div className="min-h-screen">
      {/* 페이지 헤더 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("list")}
              className={`p-3 rounded-xl transition-colors ${
                theme === "high-contrast"
                  ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                theme === "high-contrast"
                  ? "bg-yellow-400 text-black"
                  : "bg-blue-500 text-white"
              }`}>
                <Video size={28} />
              </div>
              <div>
                <h1
                  className={`text-3xl font-bold ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  {selectedAnswer.word}
                </h1>
                <p
                  className={`text-sm mt-1 ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  오답 상세 보기
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={selectedIndex === 0}
              className={`p-3 rounded-xl transition-colors ${
                selectedIndex === 0
                  ? "opacity-50 cursor-not-allowed"
                  : theme === "high-contrast"
                  ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white bg-gray-800"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 bg-white border border-gray-200"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <span
              className={`px-4 py-2 rounded-xl text-base font-semibold ${
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
              className={`p-3 rounded-xl transition-colors ${
                selectedIndex === filteredAnswers.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : theme === "high-contrast"
                  ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white bg-gray-800"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 bg-white border border-gray-200"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* 비디오 섹션 */}
        <div
          className={`w-full aspect-video rounded-2xl overflow-hidden border mb-8 ${
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
              <Video size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">비디오를 불러올 수 없습니다</p>
            </div>
          </div>
        </div>

        {/* 정보 섹션 */}
        <div className="grid gap-6">
          <div className={`p-6 rounded-2xl border ${
            theme === "high-contrast"
              ? "bg-black border-2 border-yellow-400"
              : isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200 shadow-sm"
          }`}>
            <h3
              className={`text-lg font-bold mb-3 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-gray-200"
                  : "text-gray-800"
              }`}
            >
              단어 뜻
            </h3>
            <p
              className={`text-2xl font-bold ${
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

          <div className={`p-6 rounded-2xl border ${
            theme === "high-contrast"
              ? "bg-black border-2 border-yellow-400"
              : isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200 shadow-sm"
          }`}>
            <h3
              className={`text-lg font-bold mb-3 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-gray-200"
                  : "text-gray-800"
              }`}
            >
              수형 정보
            </h3>
            <p
              className={`text-base leading-relaxed ${
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

          <div className={`p-6 rounded-2xl border ${
            theme === "high-contrast"
              ? "bg-black border-2 border-yellow-400"
              : isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200 shadow-sm"
          }`}>
            <h3
              className={`text-lg font-bold mb-3 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-gray-200"
                  : "text-gray-800"
              }`}
            >
              틀린 날짜
            </h3>
            <div className="flex items-center gap-3">
              <Calendar
                size={20}
                className={`${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              />
              <span
                className={`text-base ${
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
    <div className="min-h-screen">
      {/* 페이지 헤더 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-3 rounded-xl transition-colors ${
                theme === "high-contrast"
                  ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                theme === "high-contrast"
                  ? "bg-yellow-400 text-black"
                  : "bg-blue-500 text-white"
              }`}>
                <BookOpen size={28} />
              </div>
              <div>
                <h1
                  className={`text-3xl font-bold ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  오답 노트
                </h1>
                <p
                  className={`text-sm mt-1 ${
                    theme === "high-contrast"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  틀린 문제들을 다시 확인해보세요
                </p>
              </div>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            theme === "high-contrast"
              ? "bg-black border-2 border-yellow-400 text-yellow-400"
              : isDarkMode
              ? "bg-gray-800 text-gray-300"
              : "bg-gray-100 text-gray-600"
          }`}>
            <span className="text-lg font-semibold">총 {filteredAnswers.length}개</span>
          </div>
        </div>

        {/* 검색 바 */}
        <div className="relative mb-8 max-w-md">
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
            className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400 text-yellow-400 placeholder-yellow-400"
                : isDarkMode
                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* 오답 목록 */}
        {currentItems.length > 0 ? (
          <>
            <div className="grid gap-4 mb-8">
              {currentItems.map((answer, index) => (
                <div
                  key={`${answer.word}-${answer.createdDate}-${index}`}
                  onClick={() => handleAnswerClick(answer, index)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all hover:shadow-lg transform hover:scale-[1.02] ${
                    theme === "high-contrast"
                      ? "bg-black border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : isDarkMode
                      ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                      : "bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-2 ${
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
                        className={`text-base mb-3 ${
                          theme === "high-contrast"
                            ? ""
                            : isDarkMode
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        {answer.signDescription}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} />
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
                      size={20}
                      className={`ml-4 ${
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
              <div className="flex items-center justify-center gap-4 pb-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-xl transition-colors ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : theme === "high-contrast"
                      ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                      : isDarkMode
                      ? "text-gray-300 hover:bg-gray-700 bg-gray-800"
                      : "text-gray-600 hover:bg-gray-100 bg-white border border-gray-200"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <span
                  className={`px-6 py-3 rounded-xl text-base font-semibold ${
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
                  className={`p-3 rounded-xl transition-colors ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : theme === "high-contrast"
                      ? "text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-yellow-400"
                      : isDarkMode
                      ? "text-gray-300 hover:bg-gray-700 bg-gray-800"
                      : "text-gray-600 hover:bg-gray-100 bg-white border border-gray-200"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className={`inline-flex p-6 rounded-2xl mb-6 ${
              theme === "high-contrast"
                ? "bg-yellow-400 text-black"
                : isDarkMode
                ? "bg-gray-800"
                : "bg-gray-100"
            }`}>
              <BookOpen
                size={64}
                className={`${
                  theme === "high-contrast"
                    ? "text-black"
                    : isDarkMode
                    ? "text-gray-600"
                    : "text-gray-400"
                }`}
              />
            </div>
            <h3
              className={`text-2xl font-bold mb-3 ${
                theme === "high-contrast"
                  ? "text-yellow-400"
                  : isDarkMode
                  ? "text-gray-300"
                  : "text-gray-700"
              }`}
            >
              {searchTerm ? "검색 결과가 없습니다" : "아직 오답이 없습니다"}
            </h3>
            <p
              className={`text-base max-w-md mx-auto ${
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
  );

  return (
    <BasicLayout>
      <div
        className={`min-h-screen ${
          theme === "high-contrast"
            ? "bg-black"
            : isDarkMode
            ? "bg-gray-900"
            : "bg-gray-50"
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
    </BasicLayout>
  );
};

export default IncorrectAnswerPage;