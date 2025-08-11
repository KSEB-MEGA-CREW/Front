import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Calendar, Play, RotateCcw, Trophy, Target, Award, Star } from "lucide-react";
import { quizApi } from "../../api/authApi";
import { useAuth } from "../../Context/authContext";
import CalendarModal from "../../components/calendarModel";
import BasicLayout from "../../layouts/basicLayout";

function StudyWord() {
  const { user } = useAuth();
  const [quizList, setQuizList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answerResult, setAnswerResult] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
      console.log("퀴즈 결과 백엔드 저장 성공");
    } catch (error) {
      console.log("퀴즈 결과 저장 실패:", error);
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
      console.log("API로부터 받은 전체 응답:", response);

      if (response && response.success && Array.isArray(response.data)) {
        const processedQuizzes = response.data.map((q) => ({
          ...q,
          videoUrl: q.subDescription || null,
          textQuiz: q.signDescription,
        }));
        setQuizList(processedQuizzes.slice(0, 5));
      } else {
        console.error(
          "퀴즈 데이터 형식이 올바르지 않거나 조회에 실패했습니다:",
          response
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex justify-center items-center min-h-screen">
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-lg font-medium text-gray-700">퀴즈를 준비하고 있어요...</p>
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">오늘은 여기까지!</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                오늘 생성할 수 있는 퀴즈가 없습니다.<br />
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
    const percentage = Math.round((correctCount / totalCount) * 100);
    
    return (
      <BasicLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
          <div className="max-w-4xl mx-auto">
            
            {/* 결과 헤더 카드 */}
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8 text-center">
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
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">퀴즈 완료!</h2>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {percentage}%
                </div>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                {correctCount}문제 중 {correctCount}개 맞혔어요!
                {percentage >= 80 ? " 🎉 훌륭해요!" : percentage >= 60 ? " 👏 잘했어요!" : " 💪 다시 도전해보세요!"}
              </p>

              {/* 원형 진행률 */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-300"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${percentage * 2.83} 283`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star size={24} className="text-yellow-500 fill-current" />
                </div>
              </div>
            </div>

            {/* 상세 결과 */}
            <div className="grid gap-4 mb-8">
              {answerResult.map((result, i) => (
                <div
                  key={i}
                  className={`bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                    result.isCorrect
                      ? "hover:bg-green-50/30"
                      : "hover:bg-red-50/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      result.isCorrect
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {result.isCorrect ? (
                        <CheckCircle size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-500">문제 {i + 1}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.isCorrect
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {result.isCorrect ? "정답" : "오답"}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-gray-800 text-lg mb-2">
                        {result.quiz.signDescription}
                      </h3>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          정답: <span className="font-semibold text-gray-800">
                            {result.quiz.choices.find((c) => c.answer).word ||
                              result.quiz.choices.find((c) => c.answer).meaning}
                          </span>
                        </span>
                        
                        {!result.isCorrect && (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            선택: {result.quiz.choices[result.selected].word || result.quiz.choices[result.selected].meaning}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 다시 풀기 버튼 */}
            <div className="flex justify-center">
              <button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-2xl font-bold text-white text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* 진행률 헤더 */}
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Target size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">수어 퀴즈</h1>
                  <p className="text-sm text-gray-600">실력을 테스트해보세요!</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {current + 1} <span className="text-gray-400">/ {quizList.length}</span>
                </div>
                <p className="text-sm text-gray-500">문제</p>
              </div>
            </div>
            
            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((current + 1) / quizList.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {Math.round(((current + 1) / quizList.length) * 100)}% 완료
            </p>
          </div>

          {/* 퀴즈 콘텐츠 카드 */}
          <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
            <div className="w-full max-w-3xl mx-auto h-[320px] mb-8 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center overflow-hidden border border-white/10">
              {quiz.videoUrl ? (
                // 비디오가 있을 경우
                <video
                  key={quiz.videoUrl}
                  className="w-full h-full object-contain rounded-2xl"
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
                  <p className="text-gray-700 text-2xl leading-relaxed font-medium">
                    {quiz.textQuiz}
                  </p>
                </div>
              )}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {quiz.videoUrl
                  ? "위 수어 동작이 의미하는 단어는 무엇인가요?"
                  : "위 설명이 의미하는 단어는 무엇인가요?"}
              </h2>
              <p className="text-gray-600">정답을 선택해주세요</p>
            </div>

            {/* 선택지 */}
            <div className="grid gap-4 max-w-2xl mx-auto">
              {quiz.choices.map((choice, idx) => (
                <button
                  key={idx}
                  className={`group relative p-6 rounded-2xl text-lg font-medium transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/50 ${
                    selected === null 
                      ? "bg-white/30 hover:bg-white/40 text-gray-800 shadow-lg hover:shadow-xl border border-white/30" 
                      : ""
                  } ${
                    selected !== null && idx === selected
                      ? choice.answer
                        ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-xl border-2 border-green-300"
                        : "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-xl border-2 border-red-300"
                      : ""
                  } ${
                    selected !== null && idx !== selected
                      ? "bg-gray-200 text-gray-500 opacity-60"
                      : ""
                  }`}
                  onClick={() => handleChoice(idx)}
                  disabled={selected !== null}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        selected === null 
                          ? "bg-white/50 text-gray-700 group-hover:bg-white/70" 
                          : ""
                      } ${
                        selected !== null && idx === selected && choice.answer
                          ? "bg-white/30 text-white"
                          : ""
                      } ${
                        selected !== null && idx === selected && !choice.answer
                          ? "bg-white/30 text-white"
                          : ""
                      }`}>
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
      </div>
    </BasicLayout>
  );
}

export default StudyWord;
