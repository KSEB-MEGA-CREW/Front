import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
// [수정 1] 올바른 API 객체(quizApi)를 import 합니다. 파일명에 상관없이 export된 이름을 사용해야 합니다.
import { quizApi } from "../../api/authApi";

function StudyWord() {
  const [quizList, setQuizList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answerResult, setAnswerResult] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setQuizList([]);

    try {
      // [수정 2] 올바른 API 함수(quizApi.getQuiz)를 호출합니다.
      const response = await quizApi.getQuiz({});

      // [수정 3] API 응답 구조에 맞춰 데이터를 처리합니다. (가장 중요한 변경점)
      // apiRequest는 JSON 객체를 반환하므로, 그 안의 data 배열을 사용해야 합니다.
      // 응답 자체가 배열인지 확인합니다.
      if (Array.isArray(response)) {
        // 응답 자체가 배열이므로 그대로 사용합니다.
        setQuizList(response.slice(0, 5));
      } else {
        // 혹시 모를 다른 형식의 응답에 대한 예외 처리
        console.error("퀴즈 데이터 형식이 올바르지 않습니다:", response);
        setQuizList([]);
      }
    } catch (error) {
      console.error("퀴즈를 불러오는 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }

    // 상태 초기화
    setCurrent(0);
    setSelected(null);
    setAnswerResult([]);
    setIsFinished(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#11151b]">
        <div className="text-xl text-gray-200 font-semibold">
          퀴즈를 불러오는 중...
        </div>
      </div>
    );
  }

  if (quizList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#11151b]">
        <div className="text-xl text-gray-200 font-semibold mb-4">
          퀴즈를 불러오지 못했거나, 풀 퀴즈가 없습니다.
        </div>
        <button
          className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white text-lg transition"
          onClick={fetchQuestions}
        >
          다시 시도
        </button>
      </div>
    );
  }

  // --- 이하 렌더링 코드는 기존과 동일합니다. ---
  const quiz = quizList[current];

  const handleChoice = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
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

  if (isFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-[#11151b] px-2 py-8">
        <div className="w-full max-w-2xl flex flex-col gap-2 mb-8">
          {answerResult.map((result, i) => {
            const { quiz, selected, isCorrect } = result;
            const userChoice = quiz.choices[selected];
            const correctAnswer = quiz.choices.find((c) => c.answer);
            return (
              <div
                key={i}
                className={`flex items-center w-full px-4 py-3 rounded-md text-base font-medium mb-2 ${
                  isCorrect ? "bg-blue-700 text-white" : "bg-red-700 text-white"
                }`}
              >
                <span className="mr-3 text-2xl">
                  {isCorrect ? (
                    <FaCheckCircle className="text-blue-200" />
                  ) : (
                    <FaTimesCircle className="text-red-200" />
                  )}
                </span>
                <span className="flex-1">
                  <strong className="font-bold">
                    {quiz.word || quiz.signDescription}
                  </strong>
                  {!isCorrect && (
                    <span className="text-sm opacity-80 ml-4">
                      정답: {correctAnswer.word || correctAnswer.meaning}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <button
          className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white text-lg transition"
          onClick={handleRetry}
        >
          다시 풀기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#11151b] px-2 relative">
      <div className="w-full flex flex-col items-center pt-10 relative">
        <div className="absolute right-0 top-0 text-gray-400 text-base font-semibold">
          {current + 1} / {quizList.length}
        </div>
        <div className="w-full text-center text-gray-300 text-base mb-6 tracking-wide">
          {quiz.word ? "아래 단어의 뜻은?" : "아래 뜻의 단어는?"}
        </div>
        <div className="flex items-center justify-center mb-8 w-full min-h-[80px]">
          <span className="text-3xl font-bold tracking-wide text-white mx-2 select-none break-words w-full text-center">
            {quiz.word || quiz.signDescription || "(문제 없음)"}
          </span>
        </div>
        <div className="w-full flex flex-col gap-3 mb-8 px-4">
          {quiz.choices.map((choice, idx) => {
            let btnClass =
              "w-full py-5 rounded-md text-lg font-medium bg-[#22262b] text-gray-100 border-none transition focus:outline-none flex items-center relative";
            if (selected !== null) {
              if (idx === selected) {
                btnClass += choice.answer ? " bg-blue-700" : " bg-red-700";
              }
            } else {
              btnClass += " hover:bg-[#2a2e33]";
            }
            return (
              <button
                key={idx}
                className={btnClass}
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
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StudyWord;
