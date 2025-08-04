import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // FaCalendarAlt 제거
import { quizApi } from "../../api/authApi";
import BasicLayout from "../../layouts/basicLayout";

// CalendarModal import 제거

function StudyWord() {
  // 퀴즈 관련 상태만 남겨둡니다.
  const [quizList, setQuizList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answerResult, setAnswerResult] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // isCalendarOpen, quizHistory 상태 제거

  // 페이지가 처음 로드될 때 퀴즈를 불러오는 로직만 남깁니다.
  useEffect(() => {
    fetchQuestions();
  }, []);

  // quizHistory 저장 관련 useEffect 및 saveQuizResult 함수 제거

  // --- 기존 퀴즈 로직은 그대로 유지됩니다. ---
  const fetchQuestions = async () => {
    setIsLoading(true);
    setQuizList([]);
    try {
      const response = await quizApi.getQuiz({});
      if (Array.isArray(response)) {
        setQuizList(response.slice(0, 5));
      } else {
        console.error("퀴즈 데이터 형식이 올바르지 않습니다:", response);
        setQuizList([]);
      }
    } catch (error) {
      console.error("퀴즈를 불러오는 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
    setCurrent(0);
    setSelected(null);
    setAnswerResult([]);
    setIsFinished(false);
  };

  const handleChoice = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => {
      const quiz = quizList[current]; // quiz 변수를 여기서 정의
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
        <div className="min-h-screen flex justify-center items-center bg-[#11151b]">
          <p className="text-white text-xl">퀴즈를 불러오는 중...</p>
        </div>
      </BasicLayout>
    );
  }
  if (quizList.length === 0 && !isFinished) {
    return (
      <BasicLayout>
        <div className="min-h-screen flex flex-col justify-center items-center bg-[#11151b]">
          <p className="text-white text-xl mb-6">
            오늘의 퀴즈가 모두 소진되었어요!
          </p>
          <button
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white text-lg transition"
            onClick={handleRetry}
          >
            다시 시작하기
          </button>
        </div>
      </BasicLayout>
    );
  }

  // 결과 화면
  if (isFinished) {
    return (
      <BasicLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#11151b] px-2 py-8">
          {/* 달력 버튼이 있던 div 제거 */}
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
                    {result.quiz.word || result.quiz.signDescription}
                  </strong>
                  {!result.isCorrect && (
                    <span className="text-sm opacity-80 ml-4">
                      정답:{" "}
                      {result.quiz.choices.find((c) => c.answer).word ||
                        result.quiz.choices.find((c) => c.answer).meaning}
                    </span>
                  )}
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
        {/* CalendarModal 렌더링 코드 제거 */}
      </BasicLayout>
    );
  }

  const quiz = quizList[current];
  if (!quiz) return null;

  // 퀴즈 진행 화면
  return (
    <BasicLayout>
      <div className="min-h-screen flex flex-col items-center bg-[#11151b] px-4 py-8 relative">
        <div className="w-full flex flex-col items-center relative">
          <div className="absolute right-0 top-0 flex items-center space-x-4">
            <div className="text-gray-400 text-base font-semibold">
              {current + 1} / {quizList.length}
            </div>
            {/* 달력 버튼 제거 */}
          </div>
          <div className="w-full text-center text-gray-300 text-base mb-6 tracking-wide pt-10">
            {quiz.word ? "아래 단어의 뜻은?" : "아래 뜻의 단어는?"}
          </div>
          <div className="flex items-center justify-center mb-8 w-full min-h-[80px]">
            <span className="text-3xl font-bold tracking-wide text-white mx-2 select-none break-words w-full text-center">
              {quiz.word || quiz.signDescription || "(문제 없음)"}
            </span>
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
      {/* CalendarModal 렌더링 코드 제거 */}
    </BasicLayout>
  );
}

export default StudyWord;
