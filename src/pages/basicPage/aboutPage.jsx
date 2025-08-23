import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/authContext";
import { useTheme } from "../../Context/themeContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen relative flex flex-col ${
      theme === "high-contrast"
        ? "bg-black text-yellow-400"
        : isDarkMode
        ? "bg-gray-900 text-white"
        : "bg-white text-gray-900"
    }`}>
      {/* 상단 네비게이션 (로그인하지 않은 사용자용) */}
      {!user && (
        <header
          className={`w-full py-4 px-6 border-b ${
            theme === "high-contrast"
              ? "bg-black border-yellow-400 border-b-2"
              : isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/icon.png"
                  alt="수담 로고"
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className={`font-bold text-lg ${
                  theme === "high-contrast"
                    ? "text-yellow-400"
                    : isDarkMode 
                    ? "text-white" 
                    : "text-gray-900"
                }`}
              >
                수담
              </span>
            </div>
            <Link
              to="/auth/signup"
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                theme === "high-contrast"
                  ? "bg-yellow-400 text-black hover:bg-yellow-300 hover:text-black"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              회원가입으로 돌아가기
            </Link>
          </div>
        </header>
      )}

      {/* 메인 콘텐츠 */}
      <main className="flex-grow container mx-auto px-6 py-20 max-w-4xl">
        {/* 로그인된 사용자를 위한 돌아가기 버튼 */}
        {user && (
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/")}
              className={`
                p-2 rounded-lg transition-colors
                ${
                  theme === "high-contrast"
                    ? "hover:bg-yellow-400 hover:text-black text-yellow-400"
                    : isDarkMode
                    ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                    : "hover:bg-white text-gray-600 hover:text-gray-900"
                }
              `}
            >
              <ArrowLeft size={24} />
            </button>
          </div>
        )}
        <h1 className={`text-4xl font-bold mb-8 drop-shadow-lg ${
          theme === "high-contrast"
            ? "text-yellow-400"
            : isDarkMode
            ? "text-white"
            : "text-gray-900"
        }`}>서비스 소개</h1>

        <section className="mb-8">
          <h2 className={`text-2xl font-semibold mb-4 ${
            theme === "high-contrast"
              ? "text-yellow-400"
              : isDarkMode
              ? "text-white"
              : "text-gray-900"
          }`}>수담 서비스란?</h2>
          <p className={`leading-relaxed whitespace-pre-line ${
            theme === "high-contrast"
              ? "text-yellow-400"
              : isDarkMode
              ? "text-gray-300"
              : "text-gray-700"
          }`}>
            {`수담은 인공지능(AI)을 활용한 실시간 수어 통역 서비스입니다.\n
- 수어와 일반 음성/텍스트 간 자연스러운 양방향 번역 지원\n
- 청각장애인과 청인 간의 원활한 소통 환경 제공\n
- 단계별 수어 학습 프로그램 및 다양한 부가 기능으로 소통의 폭을 넓힘\n
  \n더 나은 소통과 누구나 이해받는 세상을 만드는 데 기여합니다.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`text-2xl font-semibold mb-4 ${
            theme === "high-contrast"
              ? "text-yellow-400"
              : isDarkMode
              ? "text-white"
              : "text-gray-900"
          }`}>주요 기능</h2>
          <ul className={`list-disc list-inside space-y-2 ${
            theme === "high-contrast"
              ? "text-yellow-400"
              : isDarkMode
              ? "text-gray-300"
              : "text-gray-700"
          }`}>
            <li>실시간 수어-음성/텍스트 양방향 번역</li>
            <li>사용자 맞춤 수어 학습 콘텐츠</li>
            <li>소셜 및 커뮤니티 기능 연동 예정</li>
            <li>접근성 높은 UI/UX 지원으로 모두가 쉽게 사용 가능</li>
          </ul>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${
            theme === "high-contrast"
              ? "text-yellow-400"
              : isDarkMode
              ? "text-white"
              : "text-gray-900"
          }`}>문의 및 지원</h2>
          <p className={`${
            theme === "high-contrast"
              ? "text-yellow-400"
              : isDarkMode
              ? "text-gray-300"
              : "text-gray-700"
          }`}>
            서비스 이용 중 궁금한 점이나 문제가 발생하면 아래 이메일로 문의해
            주세요.
          </p>
          <a
            href="mailto:dissolve1882@naver.com"
            className={`hover:underline transition-colors ${
              theme === "high-contrast"
                ? "text-yellow-300 hover:text-yellow-200"
                : "text-cyan-400"
            }`}
          >
            dissolve1882@naver.com
          </a>
        </section>
      </main>

      {/* 푸터 */}
      <footer className={`py-8 text-center text-sm border-t ${
        theme === "high-contrast"
          ? "bg-black text-yellow-400 border-yellow-400 border-t-2"
          : isDarkMode
          ? "bg-gray-900 text-gray-400 border-gray-700"
          : "bg-gray-100 text-gray-600 border-gray-200"
      }`}>
        © {new Date().getFullYear()} 수담. All rights reserved.
      </footer>
    </div>
  );
}
