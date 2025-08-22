import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Play,
  RotateCcw,
  Trophy,
  Target,
  Award,
  Star,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { quizApi } from "../../api/authApi";
import { useAuth } from "../../Context/authContext";
import { useTheme } from "../../Context/themeContext";
import CalendarModal from "../../components/calendarModel";
import BasicLayout from "../../layouts/basicLayout";

function StudyWord() {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [quizList, setQuizList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answerResult, setAnswerResult] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (isFinished && answerResult.length > 0) {
      saveQuizResult();
    }
  }, [isFinished]);

  const saveQuizResult = async () => {
    if (!user?.id) return;
    const correctAnswers = answerResult.filter((r) => r.isCorrect).length;
    const categoryCorrectCounts = {};
    answerResult.forEach((result) => {
      if (result.quiz.category) {
        if (!categoryCorrectCounts[result.quiz.category]) {
          categoryCorrectCounts[result.quiz.category] = 0;
        }
        if (result.isCorrect) {
          categoryCorrectCounts[result.quiz.category]++;
        }
      }
    });
    try {
      await quizApi.saveQuizResult({
        userId: user.id,
        correctCount: correctAnswers,
        categoryCorrectCounts: categoryCorrectCounts,
      });
    } catch (error) {
      console.error("퀴즈 결과 저장 실패:", error);
    }
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    setAnswerResult([]);
    setCurrent(0);
    setSelected(null);
    setIsFinished(false);
    try {
      const response = await quizApi.getQuiz();

      if (response && response.success && Array.isArray(response.data)) {
        const processedQuizzes = response.data.map((q) => ({
          ...q,
          videoUrl: q.subDescription || null,
          textQuiz: q.signDescription,
        }));
        setQuizList(processedQuizzes.slice(0, 5));
      } else {
        console.error(
          "퀴즈 데이터 조회 실패:",
          response?.message || "Unknown error"
        );
        setQuizList([]);
      }
    } catch (error) {
      console.error("퀴즈를 불러오는 중 오류 발생:", error);
      setQuizList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoice = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const quiz = quizList[current];
    setTimeout(() => {
      const isCorrect = quiz.choices[idx].answer;
      setAnswerResult((prev) => [...prev, { isCorrect, selected: idx, quiz }]);
      if (current + 1 < quizList.length) {
        setCurrent((prev) => prev + 1);
        setSelected(null);
      } else {
        setIsFinished(true);
      }
    }, 1100);
  };

  const handleRetry = () => {
    fetchQuestions();
  };

  if (isLoading) {
    return (
      <BasicLayout>
        <div
          className={`min-h-screen p-6 ${
            theme === 'high-contrast'
              ? "bg-black"
              : (isDarkMode ? "bg-gray-900" : "bg-gray-50")
          }`}
        >
          <div className="flex justify-center items-center min-h-screen">
            <div
              className={`
              p-8 rounded-3xl shadow-2xl border
              ${
                theme === 'high-contrast'
                  ? "bg-black border-2 border-yellow-400"
                  : (isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200")
              }
            `}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <p
                  className={`text-lg font-semibold ${
                    theme === 'high-contrast'
                      ? "text-yellow-400"
                      : (isDarkMode ? "text-gray-300" : "text-gray-700")
                  }`}
                >
                  퀴즈를 준비하고 있어요...
                </p>
              </div>
            </div>
          </div>
        </div>
      </BasicLayout>
    );
  }

  if (quizList.length === 0 && !isFinished) {
    return (
      <BasicLayout>
        <div
          className={`min-h-screen p-6 ${
            theme === 'high-contrast'
              ? "bg-black"
              : (isDarkMode ? "bg-gray-900" : "bg-gray-50")
          }`}
        >
          <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div
              className={`
              rounded-3xl p-12 shadow-2xl text-center max-w-md border
              ${
                theme === 'high-contrast'
                  ? "bg-black border-2 border-yellow-400"
                  : (isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200")
              }
            `}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target size={32} className="text-white" />
              </div>
              <h3
                className={`text-2xl font-bold mb-4 ${
                  theme === 'high-contrast'
                    ? "text-yellow-400"
                    : (isDarkMode ? "text-white" : "text-gray-800")
                }`}
              >
                오늘은 여기까지!
              </h3>
              <p
                className={`mb-6 leading-relaxed ${
                  theme === 'high-contrast'
                    ? "text-yellow-400"
                    : (isDarkMode ? "text-gray-300" : "text-gray-600")
                }`}
              >
                오늘 생성할 수 있는 퀴즈가 없습니다.
                <br />
                내일 다시 도전해보세요!
              </p>
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Calendar size={18} />
                퀴즈 기록 보기
              </button>
            </div>
          </div>
        </div>
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          userId={user?.id}
        />
      </BasicLayout>
    );
  }

  if (isFinished) {
    const correctCount = answerResult.filter((r) => r.isCorrect).length;
    const totalCount = answerResult.length;
    const percentage =
      totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    return (
      <BasicLayout>
        <div
          className={`min-h-screen px-4 py-8 ${
            theme === 'high-contrast'
              ? "bg-black"
              : (isDarkMode ? "bg-gray-900" : "bg-gray-50")
          }`}
        >
          <div className="max-w-4xl mx-auto">
            {/* 결과 요약 (박스 제거, 미니멀 디자인) */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                {percentage >= 80 ? (
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <Trophy size={32} className="text-white" />
                  </div>
                ) : percentage >= 60 ? (
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Award size={32} className="text-white" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <Target size={32} className="text-white" />
                  </div>
                )}
              </div>

              <h2
                className={`text-4xl font-bold mb-2 ${
                  theme === 'high-contrast'
                    ? "text-yellow-400"
                    : (isDarkMode ? "text-white" : "text-gray-800")
                }`}
              >
                퀴즈 완료!
              </h2>

              <div className="text-7xl font-bold bg-blue-500 bg-clip-text text-transparent mb-4">
                {percentage}%
              </div>

              <p
                className={`text-lg mb-6 ${
                  theme === 'high-contrast'
                    ? "text-yellow-400"
                    : (isDarkMode ? "text-gray-300" : "text-gray-600")
                }`}
              >
                {totalCount}문제 중 {correctCount}개 맞혔어요!
                {percentage >= 80
                  ? " 훌륭해요!"
                  : percentage >= 60
                  ? " 잘했어요!"
                  : " 다시 도전해보세요!"}
              </p>
            </div>

            {/* 상세 결과 (이 부분은 수정하지 않음) */}
            <div className="grid gap-4 mb-8">
              {answerResult.map((result, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] border ${
                    theme === 'high-contrast'
                      ? "bg-black border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : (isDarkMode
                        ? "bg-gray-800 border-gray-700 hover:bg-blue-400"
                        : "bg-white border-gray-200")
                  } ${
                    result.isCorrect
                      ? isDarkMode
                        ? "hover:bg-blue-900/30"
                        : "hover:bg-blue-50/30"
                      : isDarkMode
                      ? "hover:bg-red-900/30"
                      : "hover:bg-red-50/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        result.isCorrect
                          ? "bg-blue-500 text-white"
                          : "bg-[#ff4444] text-white"
                      }`}
                    >
                      {result.isCorrect ? (
                        <CheckCircle size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-sm font-bold ${
                            theme === 'high-contrast'
                              ? "text-yellow-400"
                              : (isDarkMode ? "text-gray-300" : "text-gray-600")
                          }`}
                        >
                          문제 {i + 1}
                        </span>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            result.isCorrect
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {result.isCorrect ? "정답" : "오답"}
                        </div>
                      </div>

                      <h3
                        className={`font-bold text-lg mb-2 ${
                          theme === 'high-contrast'
                            ? "text-yellow-400"
                            : (isDarkMode ? "text-white" : "text-gray-800")
                        }`}
                      >
                        {result.quiz.signDescription}
                      </h3>

                      <div className="flex justify-between items-center">
                        <span
                          className={`text-sm ${
                            theme === 'high-contrast'
                              ? "text-yellow-400"
                              : (isDarkMode ? "text-gray-300" : "text-gray-600")
                          }`}
                        >
                          정답:{" "}
                          <span
                            className={`font-semibold ${
                              theme === 'high-contrast'
                                ? "text-yellow-400"
                                : (isDarkMode ? "text-white" : "text-gray-800")
                            }`}
                          >
                            {result.quiz.choices.find((c) => c.answer).word ||
                              result.quiz.choices.find((c) => c.answer).meaning}
                          </span>
                        </span>

                        {!result.isCorrect && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${
                              theme === 'high-contrast'
                                ? "text-yellow-400 bg-black border-yellow-400"
                                : (isDarkMode
                                  ? "text-white border-gray-500"
                                  : "text-red-700 bg-red-50 border-red-200")
                            }`}
                          >
                            선택:{" "}
                            {result.quiz.choices[result.selected].word ||
                              result.quiz.choices[result.selected].meaning}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 버튼들 (이 부분은 수정하지 않음) */}
            <div className="flex justify-center gap-4">
              <button
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-500 hover:from-green-600 hover:to-teal-600 rounded-2xl font-bold text-white text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                onClick={() => navigate("/stats")}
              >
                <BarChart3 size={20} />
                기록 확인하기
              </button>
              <button
                className={`inline-flex items-center gap-3 px-8 py-4 border-2 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl ${
                  theme === 'high-contrast'
                    ? "border-4 border-yellow-400 text-yellow-400 bg-black hover:bg-yellow-400 hover:text-black"
                    : (isDarkMode
                      ? "border-gray-600 text-white hover:border-gray-300"
                      : "border-gray-400 text-gray-700 hover:border-gray-600 bg-white hover:bg-gray-50")
                }`}
                onClick={handleRetry}
              >
                <RotateCcw size={20} />
                다시 도전하기
              </button>
            </div>
          </div>
        </div>
      </BasicLayout>
    );
  }

  const quiz = quizList[current];
  if (!quiz) return null;

  return (
    <BasicLayout>
      <div
        className={`min-h-screen px-4 py-8 ${
          theme === 'high-contrast'
            ? "bg-black"
            : (isDarkMode ? "bg-gray-900" : "bg-gray-50")
        }`}
      >
        <div className="max-w-4xl mx-auto">
          {/* 비디오 영역과 문제 번호 */}
          <div className="flex items-start justify-center mb-8 relative">
            <div
              className="
      w-full max-w-3xl h-[320px] rounded-2xl 
      flex items-center justify-center overflow-hidden
    "
            >
              {/* 문제 번호 - 비디오 오른쪽 끝 */}
              <div className="absolute top-0 right-0 -mr-20">
                <div
                  className={`text-xl font-bold ${
                    theme === 'high-contrast'
                      ? "text-yellow-400"
                      : (isDarkMode ? "text-white" : "text-gray-800")
                  }`}
                >
                  {current + 1}{" "}
                  <span
                    className={`${
                      theme === 'high-contrast'
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }`}
                  >
                    / {quizList.length}
                  </span>
                </div>
              </div>
              {quiz.videoUrl ? (
                // 비디오가 있을 경우
                <video
                  key={quiz.videoUrl}
                  className="w-full h-full object-contain rounded-1xl"
                  controls
                  autoPlay
                  muted
                  loop
                >
                  <source src={quiz.videoUrl} type="video/mp4" />
                  <div className="flex items-center justify-center text-gray-500">
                    브라우저가 비디오 재생을 지원하지 않습니다.
                  </div>
                </video>
              ) : (
                // 비디오가 없을 경우 (텍스트 퀴즈)
                <div className="text-center px-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Play size={24} className="text-white" />
                  </div>
                  <p
                    className={`text-2xl leading-relaxed font-semibold ${
                      theme === 'high-contrast'
                        ? "text-yellow-400"
                        : (isDarkMode ? "text-gray-200" : "text-gray-700")
                    }`}
                  >
                    {quiz.textQuiz}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-8">
            <h2
              className={`text-xl font-semibold mb-2 ${
                theme === 'high-contrast'
                  ? "text-yellow-400"
                  : (isDarkMode ? "text-white" : "text-gray-800")
              }`}
            >
              {quiz.videoUrl
                ? "위 수어 동작이 의미하는 단어는 무엇인가요?"
                : "위 설명이 의미하는 단어는 무엇인가요?"}
            </h2>
            <p className={`${
              theme === 'high-contrast'
                ? "text-yellow-400"
                : (isDarkMode ? "text-gray-300" : "text-gray-600")
            }`}>
              정답을 선택해주세요
            </p>
          </div>

          {/* 선택지 */}
          <div className="grid gap-4 max-w mx-auto">
            {quiz.choices.map((choice, idx) => (
              <button
                key={idx}
                className={`group relative p-6 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/50 ${
                  selected === null
                    ? theme === 'high-contrast'
                      ? "bg-black border-2 border-yellow-400 text-yellow-400 shadow-lg hover:bg-yellow-400 hover:text-black"
                      : (isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200 shadow-lg hover:shadow-xl border border-gray-600"
                        : "bg-white hover:bg-blue-50 text-gray-800 shadow-md hover:shadow-lg border border-gray-300")
                    : ""
                } ${
                  selected !== null && idx === selected
                    ? choice.answer
                      ? "bg-blue-500 text-white shadow-xl border-2 border-blue-300"
                      : "bg-red-500 text-white shadow-xl border-2 border-red-300"
                    : ""
                } ${
                  selected !== null && idx !== selected
                    ? theme === 'high-contrast'
                      ? "bg-black border-2 border-yellow-400 text-yellow-400 opacity-60"
                      : (isDarkMode
                        ? "bg-gray-800 text-gray-500 opacity-60"
                        : "bg-gray-200 text-gray-500 opacity-60")
                    : ""
                }`}
                onClick={() => handleChoice(idx)}
                disabled={selected !== null}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        selected === null
                          ? theme === 'high-contrast'
                            ? "bg-black border-2 border-yellow-400 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black"
                            : (isDarkMode
                              ? "bg-gray-600 text-gray-200 group-hover:bg-[#f6f6f6]"
                              : "bg-gray-100 text-gray-700 group-hover:bg-gray-200")
                          : ""
                      } ${
                        selected !== null && idx === selected && choice.answer
                          ? "bg-white/30 text-white"
                          : ""
                      } ${
                        selected !== null && idx === selected && !choice.answer
                          ? "bg-white/30 text-white"
                          : ""
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-left">
                      {choice.word || choice.meaning}
                    </span>
                  </div>

                  {selected !== null && idx === selected && (
                    <div className="flex items-center gap-2">
                      {choice.answer ? (
                        <CheckCircle size={24} className="text-white" />
                      ) : (
                        <XCircle size={24} className="text-white" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </BasicLayout>
  );
}

export default StudyWord;
