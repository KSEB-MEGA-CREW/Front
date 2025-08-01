import React from "react";
import TopMenuComponent from "../../components/menu/topMenu";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col">
      {/* 상단 메뉴 */}
      <header className="w-full z-40">
        <TopMenuComponent />
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-grow container mx-auto px-6 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 drop-shadow-lg">서비스 소개</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">수담 서비스란?</h2>
          <p className="leading-relaxed text-white/90 whitespace-pre-line">
            {`수담은 인공지능(AI)을 활용한 실시간 수어 통역 서비스입니다.\n
- 수어와 일반 음성/텍스트 간 자연스러운 양방향 번역 지원\n
- 청각장애인과 청인 간의 원활한 소통 환경 제공\n
- 단계별 수어 학습 프로그램 및 다양한 부가 기능으로 소통의 폭을 넓힘\n
  \n더 나은 소통과 누구나 이해받는 세상을 만드는 데 기여합니다.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">주요 기능</h2>
          <ul className="list-disc list-inside space-y-2 text-white/90">
            <li>실시간 수어-음성/텍스트 양방향 번역</li>
            <li>사용자 맞춤 수어 학습 콘텐츠</li>
            <li>소셜 및 커뮤니티 기능 연동 예정</li>
            <li>접근성 높은 UI/UX 지원으로 모두가 쉽게 사용 가능</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">문의 및 지원</h2>
          <p className="text-white/90">
            서비스 이용 중 궁금한 점이나 문제가 발생하면 아래 이메일로 문의해
            주세요.
          </p>
          <a
            href="mailto:dissolve1882@naver.com"
            className="text-cyan-400 hover:underline"
          >
            dissolve1882@naver.com
          </a>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-black/80 text-white/70 py-8 text-center text-sm">
        © {new Date().getFullYear()} 수담. All rights reserved.
      </footer>
    </div>
  );
}
