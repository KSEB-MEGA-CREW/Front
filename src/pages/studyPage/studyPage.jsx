import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaCalendarAlt } from "react-icons/fa";
import { quizApi } from "../../api/authApi";
import {useAuth} from "../../Context/authContext";

// [수정 1] 분리된 달력 모달 컴포넌트를 import 합니다.
import CalendarModal from "../../components/calendarModel"; // 파일 경로에 맞게 수정하세요.
import BasicLayout from "../../layouts/basicLayout";

function StudyWord() {
  const {user} = useAuth(); // 사용자 정보 추가 -> 사용자별 데이터 저장 및 처리를 위함
  const [quizList, setQuizList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answerResult, setAnswerResult] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // [수정 2] 달력 모달의 상태와 퀴즈 기록 상태만 남겨둡니다.
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [quizHistory, setQuizHistory] = useState({});

  // localStorage에서 퀴즈 기록을 불러오는 로직 (기존과 동일)
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("quizHistory");
      if (storedHistory) {
        setQuizHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("퀴즈 기록을 불러오는 데 실패했습니다:", error);
    }
    fetchQuestions();
  }, []);

  // 퀴즈가 끝나면 결과를 저장하는 로직 (기존과 동일)
  useEffect(() => {
    if (isFinished && answerResult.length > 0) {
      saveQuizResult();
    }
  }, [isFinished]);

  const saveQuizResult = async () => {
    if(!user?.id) return;

    const correctAnswers = answerResult.filter((r) => r.isCorrect). length; // 함수가 아니라 속성을 사용해서 정답 개수를 올바르게 저장
    const totalQuestions = answerResult.length;

    // 카테고리별 정답 수 계산
    const categoryCorrectCounts = {};
    answerResult.forEach(result => {
      if(result.quiz.category){
        if(!categoryCorrectCounts[result.quiz.category]){
          categoryCorrectCounts[result.quiz.category] = 0;
        }
        if(result.isCorrect){
          categoryCorrectCounts[result.quiz.category]++;
        }
      }
    });
    try{
      // 백엔드에 퀴즈 결과 저장(quizApi.saveQuizResult 사용) -> 일단 localStorage엔 저장하지 않음
      await quizApi.saveQuizResult({
        userId: user.id,
        correctCount: correctAnswers,
        categoryCorrectCounts: categoryCorrectCounts
      });

      console.log('퀴즈 결과 백엔드 저장 성공');
    } catch(error){
      console.log('퀴즈 결과 저장 실패:', error);
    }
  };

  // --- 기존 퀴즈 로직 (fetchQuestions, handleChoice, handleRetry)은 수정 없이 그대로 둡니다. ---
  const fetchQuestions = async () => {
  setIsLoading(true);
  setQuizList([]);
  try {
    const response = await quizApi.getQuiz();
    
    // 백엔드 ApiResponse 구조에 맞춰 수정
    if (response && response.success && Array.isArray(response.data)) {
      setQuizList(response.data.slice(0, 5));
    } else if (Array.isArray(response)) {
      // 호환성을 위한 기존 구조 지원
      setQuizList(response.slice(0, 5));
    } else {
      console.error("퀴즈 데이터 형식이 올바르지 않습니다:", response);
      setQuizList([]);
    }
  } catch (error) {
    console.error("퀴즈를 불러오는 중 오류 발생:", error);
    
    // 에러 타입별 사용자 메시지 처리
    if (error.message.includes('인증')) {
      alert('로그인이 필요합니다.');
      // 필요시 로그인 페이지로 리다이렉트 추가하기
    } else if (error.message.includes('제한')) {
      alert('일일 퀴즈 생성 제한을 초과했습니다.');
    } else {
      alert('퀴즈를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    setQuizList([]);
  } finally {
    setIsLoading(false);
  }

  };

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

  // 로딩, 퀴즈 없음, 결과 화면 등 UI 렌더링 부분은 달력 버튼 추가 외에는 거의 동일합니다.
  if (isLoading) {
    /* ... 로딩 UI ... */
  }
  if (quizList.length === 0 && !isFinished) {
    /* ... 퀴즈 없음 UI ... */
  }

  if (isFinished) {
    return (
      <>
        <BasicLayout>
          <div className="min-h-screen flex flex-col items-center bg-[#11151b] px-2 py-8">
            <div className="w-full max-w-2xl flex justify-end mb-4">
              {/* [수정 3] 달력 버튼: 클릭 시 isCalendarOpen 상태를 true로 변경 */}
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="text-gray-400 hover:text-white transition p-2"
                aria-label="달력 보기"
              >
                <FaCalendarAlt size={24} />
              </button>
            </div>
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
          {/* [수정 4] CalendarModal 컴포넌트를 렌더링하고 필요한 props를 전달합니다. */}
          <CalendarModal
            isOpen={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
            quizHistory={quizHistory}
          />
        </BasicLayout>
      </>
    );
  }

  const quiz = quizList[current];
  if (!quiz) return null;

  return (
    <>
      <BasicLayout>
        <div className="min-h-screen flex flex-col items-center bg-[#11151b] px-4 py-8 relative">
          <div className="w-full flex flex-col items-center relative">
            <div className="absolute right-0 top-0 flex items-center space-x-4">
              <div className="text-gray-400 text-base font-semibold">
                {current + 1} / {quizList.length}
              </div>
              {/* [수정 3] 달력 버튼: 클릭 시 isCalendarOpen 상태를 true로 변경 */}
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="text-gray-400 hover:text-white transition"
                aria-label="달력 보기"
              >
                <FaCalendarAlt size={22} />
              </button>
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
        {/* [수정 4] CalendarModal 컴포넌트를 렌더링하고 필요한 props를 전달합니다. */}
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          quizHistory={quizHistory}
        />
      </BasicLayout>
    </>
  );
}

export default StudyWord;
