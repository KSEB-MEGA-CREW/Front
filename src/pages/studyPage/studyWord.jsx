import React, { useEffect, useState } from "react";
import { FaVolumeUp, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { authApi } from "../../api/authApi";

function StudyWord() {
  const [quizList, setQuizList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answerResult, setAnswerResult] = useState([]); // 각 문제의 정오 결과 저장
  const [isFinished, setIsFinished] = useState(false);

  // 문제 불러오기 및 상태 초기화
  const fetchQuestions = async () => {
    const data = await authApi.getquiz({});
    setQuizList(data.slice(0, 5));
    setCurrent(0);
    setSelected(null);
    setAnswerResult([]);
    setIsFinished(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  if (quizList.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#11151b]">
        <div className="text-xl text-gray-200 font-semibold">로딩중...</div>
      </div>
    );

  const quiz = quizList[current];

  // 선택지 선택
  const handleChoice = (idx) => {
    if (selected !== null) return;

    setSelected(idx);

    // 결과 저장 및 다음 문제로 이동
    setTimeout(() => {
      const isCorrect = quiz.choices[idx].answer;
      setAnswerResult((prev) => [
        ...prev,
        {
          isCorrect,
          selected: idx,
          quiz,
        },
      ]);
      if (current + 1 < quizList.length) {
        setCurrent((prev) => prev + 1);
        setSelected(null);
      } else {
        setIsFinished(true);
      }
    }, 1100); // 1.1초 후 자동 다음 문제 or 결과화면
  };

  // "다시 풀기" 버튼 클릭
  const handleRetry = () => {
    fetchQuestions();
  };

  // --- 결과 화면 ---
  if (isFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-[#11151b] px-2 py-8">
        <div className="w-full max-w-2xl flex flex-col gap-2 mb-8">
          {answerResult.map((result, i) => {
            const { quiz, selected, isCorrect } = result;
            const userChoice = quiz.choices[selected];

            return (
              <div
                key={i}
                className={`flex items-center w-full px-4 py-3 rounded-md text-base font-medium 
                  mb-2 
                  ${
                    isCorrect
                      ? "bg-blue-700 text-white"
                      : "bg-red-700 text-white"
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
                  <span className="font-bold">
                    {userChoice.word || userChoice.meaning}
                  </span>
                  <span className="mx-2">–</span>
                  <span>{quiz.word || quiz.signDescription}</span>
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

  // --- 문제 풀이 화면 ---
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
