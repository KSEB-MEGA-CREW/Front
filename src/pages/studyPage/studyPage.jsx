import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaCalendarAlt } from "react-icons/fa";
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
        <div className="flex justify-center items-center min-h-screen text-white">
          로딩 중...
        </div>
      </BasicLayout>
    );
  }

  if (quizList.length === 0 && !isFinished) {
    return (
      <BasicLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#11151b] text-white">
          <p className="text-xl mb-4">오늘 생성할 수 있는 퀴즈가 없습니다.</p>
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition"
          >
            퀴즈 기록 보기
          </button>
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
    return (
      <BasicLayout>
        <div className="min-h-screen flex flex-col items-center bg-[#11151b] px-2 py-8">
          <div className="w-full max-w-2xl flex justify-end mb-4"></div>
          <div className="w-full max-w-2xl flex flex-col gap-2 mb-8">
            {answerResult.map((result, i) => (
              <div
                key={i}
                className={`flex items-center w-full px-4 py-3 rounded-md text-base font-medium mb-2 ${
                  result.isCorrect
                    ? "bg-blue-700 text-white"
                    : "bg-red-700 text-white"
                }`}
              >
                <span className="mr-3 text-2xl">
                  {result.isCorrect ? (
                    <FaCheckCircle className="text-blue-200" />
                  ) : (
                    <FaTimesCircle className="text-red-200" />
                  )}
                </span>
                <span className="flex-1">
                  <strong className="font-bold">
                    {result.quiz.signDescription}
                  </strong>
                  <div className="text-right">
                    <span className="text-sm opacity-80 ml-4">
                      정답:{" "}
                      {result.quiz.choices.find((c) => c.answer).word ||
                        result.quiz.choices.find((c) => c.answer).meaning}
                    </span>
                  </div>
                </span>
              </div>
            ))}
          </div>
          <button
            className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white text-lg transition"
            onClick={handleRetry}
          >
            다시 풀기
          </button>
        </div>
      </BasicLayout>
    );
  }

  const quiz = quizList[current];
  if (!quiz) return null;

  return (
    <BasicLayout>
      <div className="min-h-screen flex flex-col items-center bg-[#11151b] px-4 py-8 relative">
        <div className="w-full max-w-1xl flex flex-col items-center relative">
          <div className="absolute right-0 top-0 flex items-center space-x-4">
            <div className="text-gray-400 text-2xl font-semibold">
              {current + 1} / {quizList.length}
            </div>
          </div>

          {/* ✅ 변경된 부분: 퀴즈 콘텐츠를 하나의 고정 높이 컨테이너로 감싸서 레이아웃 쉬프트 방지 */}
          <div className="w-full max-w-3xl h-[324px] mb-8 bg-[#11151b] rounded-lg flex items-center justify-center overflow-hidden p-4">
            {quiz.videoUrl ? (
              // 비디오가 있을 경우
              <video
                key={quiz.videoUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                muted
                loop
              >
                <source src={quiz.videoUrl} type="video/mp4" />
                브라우저가 비디오 재생을 지원하지 않습니다.
              </video>
            ) : (
              // 비디오가 없을 경우 (텍스트 퀴즈)
              <p className="text-gray-200 text-2xl leading-relaxed text-center">
                {quiz.textQuiz}
              </p>
            )}
          </div>

          <div className="w-full text-center text-gray-300 text-base mb-6 tracking-wide pt-10">
            {quiz.videoUrl
              ? "위 수어 동작이 의미하는 단어는 무엇인가요?"
              : "위 설명이 의미하는 단어는 무엇인가요?"}
          </div>

          <div className="w-full flex flex-col gap-3">
            {quiz.choices.map((choice, idx) => (
              <button
                key={idx}
                className={`w-full py-5 rounded-md text-lg font-medium bg-[#22262b] text-gray-100 border-none transition focus:outline-none flex items-center relative ${
                  selected === null ? "hover:bg-[#2a2e33]" : ""
                } ${
                  selected !== null && idx === selected
                    ? choice.answer
                      ? "bg-blue-700"
                      : "bg-red-700"
                    : ""
                }`}
                onClick={() => handleChoice(idx)}
                disabled={selected !== null}
              >
                {selected !== null && idx === selected && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
                    {choice.answer ? (
                      <FaCheckCircle className="text-blue-200" />
                    ) : (
                      <FaTimesCircle className="text-red-200" />
                    )}
                  </span>
                )}
                <span className="flex-grow text-center">
                  {choice.word || choice.meaning}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </BasicLayout>
  );
}

export default StudyWord;
