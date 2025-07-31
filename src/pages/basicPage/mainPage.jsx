import { useState, useEffect } from "react";
import { Users, Mic, BookOpen, Hand, ArrowRightLeft, Volume2 } from "lucide-react";
import TopMenuComponent from "../../components/menu/topMenu";

function MainPage() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [stars, setStars] = useState([]);
  const [particles, setParticles] = useState([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [translationDemo, setTranslationDemo] = useState(false);

  // 방문자 수 (랜덤 임시값, 실제 서비스 연동 시 API 사용)
  const [todayUsers, setTodayUsers] = useState(
    230 + Math.floor(Math.random() * 70)
  );

  // 번역 데모 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setTranslationDemo(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 별과 입자 생성
  useEffect(() => {
    const generateStars = () => {
      if (reduceMotion) {
        setStars([]);
        return;
      }
      const newStars = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 3 + 1,
        });
      }
      setStars(newStars);
    };

    const generateParticles = () => {
      if (reduceMotion) {
        setParticles([]);
        return;
      }
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.5 + 0.2,
          direction: Math.random() * 360,
        });
      }
      setParticles(newParticles);
    };

    generateStars();
    generateParticles();
  }, [reduceMotion]);

  // 마우스 위치 및 스크롤 추적
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      setScrollY(currentScrollY);
      setScrollProgress(
        (currentScrollY / (documentHeight - windowHeight)) * 100
      );
    };

    if (!reduceMotion) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    window.addEventListener("scroll", handleScroll);

    return () => {
      if (!reduceMotion) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [reduceMotion]);

  const features = [
    {
      icon: <Mic className="w-8 h-8" aria-label="실시간 수어 번역 아이콘" />,
      title: "실시간 수어 번역",
      description: "AI 기술로 수어와 음성을 실시간으로 번역합니다",
      color: "from-blue-400 to-purple-500",
    },
    {
      icon: <Users className="w-8 h-8" aria-label="양방향 소통 아이콘" />,
      title: "양방향 소통",
      description: "청각장애인과 청인 모두가 자연스럽게 대화할 수 있습니다",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: <BookOpen className="w-8 h-8" aria-label="체계적인 학습 아이콘" />,
      title: "체계적인 학습",
      description: "단계별 수어 학습 프로그램을 제공합니다",
      color: "from-pink-400 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* 스크롤 진행도 바 */}
      <div
        className="fixed top-0 left-0 w-full h-1 bg-black/20 z-50"
        aria-hidden
      >
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 플로팅 스크롤 인디케이터 */}
      <div
        className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40"
        aria-hidden
      >
        <div className="flex flex-col space-y-2">
          {[0, 25, 50, 75, 100].map((threshold, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                scrollProgress > threshold
                  ? "bg-cyan-400/80 scale-125 shadow-lg shadow-cyan-400/50"
                  : "bg-white/20 scale-100"
              }`}
            />
          ))}
        </div>
      </div>

      {/* TopMenu */}
      <div className="absolute top-0 left-0 w-full z-40" role="navigation">
        <TopMenuComponent />
      </div>

      {/* 패럴랙스 배경 */}
      <div className="fixed inset-0 -z-10" aria-hidden>
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-200"
          style={{
            backgroundImage: "url('/assets/back7.jpg')",
            
          }}
        />
      </div>

     
     
      {/* 애니메이션 축소/해제 토글 */}
      <button
        className="fixed bottom-7 right-7 z-50 rounded-xl bg-white/80 px-4 py-2 shadow-lg text-sm font-medium opacity-80 hover:opacity-100 transition"
        onClick={() => setReduceMotion((r) => !r)}
        aria-pressed={reduceMotion}
      >
        {reduceMotion ? "애니메이션 ON" : "애니메이션 축소"}
      </button>

      {/* 메인 콘텐츠 */}
      <main
        className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-6"
        style={{
          transform: `translateY(${scrollY * -0.3}px)`,
          opacity: Math.max(1 - scrollProgress / 25, 0.1),
        }}
      >
     
        <h1
          className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl mb-15 transition-all duration-700 animate-pulse-glow"
          style={{
            transform: `scale(${1 - scrollProgress * 0.002})`,
          }}
        >
          수어 통역이 <span className="text-white">더 가까워집니다</span>
        </h1>

      
        {/*
        <p
          className="text-xl text-white/90 max-w-xl mb-10 transition-all duration-700 drop-shadow-lg"
          style={{
            opacity: Math.max(1 - scrollProgress / 20, 0.5),
          }}
        >
          AI 기술로 수어와 음성을 실시간으로 번역하여, 
          청각장애인과의 원활한 소통을 지원합니다.
        </p>
        */}

          {/* 양방향 번역 강조 섹션 - 클릭 가능한 CTA */}
        <a 
          href="/translate" 
          className="relative mb-12 p-6 bg-black/20 backdrop-blur-xl rounded-2xl border-2 border-cyan-400/50 max-w-2xl w-full block group transition-all duration-300 hover:scale-[1.02] hover:bg-black/30 hover:shadow-2xl hover:shadow-cyan-400/20 cursor-pointer hover:border-cyan-400/70"
          tabIndex={0}
          aria-label="양방향 수어 통역 체험 바로가기"
        >
          {/* 글로우 효과 */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-500/10 rounded-2xl animate-pulse group-hover:from-cyan-400/20 group-hover:via-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-white">실시간</span>
                <span className="text-white">양방향</span>
                <span className="text-white">수어 번역</span>
              </div>
            </div>

            {/* 번역 시각화 */} 
            <div className="flex items-center justify-center space-x-6 mb-6">
              {/* 수어 아이콘 */}
              <div className={`relative transition-all duration-1000 ${translationDemo ? 'scale-110 text-cyan-400' : 'scale-100 text-white/70'}`}>
                <Hand className="w-12 h-12 md:w-14 md:h-14" />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium">
  
                </div>
                {translationDemo && (
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
                )}
              </div>

              {/* 양방향 화살표 */}
              <div className="relative">
                <ArrowRightLeft className={`w-8 h-8 md:w-10 md:h-10 text-white transition-all duration-500 ${translationDemo ? 'rotate-180' : 'rotate-0'}`} />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
              </div>

              {/* 음성 아이콘 */}
              <div className={`relative transition-all duration-1000 ${!translationDemo ? 'scale-110 text-purple-400' : 'scale-100 text-white/70'}`}>
                <Volume2 className="w-12 h-12 md:w-14 md:h-14" />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                
                </div>
                {!translationDemo && (
                  <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping"></div>
                )}
              </div>
            </div>

            {/* 데모 텍스트 */}
            <div className="text-center mb-4">
              <p className="text-base md:text-lg text-white/90 mb-2">
                {translationDemo ? 
                  "🤟 '안녕하세요'   →   🎵 '안녕하세요'" : 
                  "🎵 '반갑습니다'   →   🤟 '반갑습니다'"
                }
              </p>
              <div className="text-xs text-white/70">
                {translationDemo ? "수어를 음성으로 실시간 변환" : "음성을 수어로 실시간 변환"}
              </div>
            </div>
            
            {/* CTA 버튼 스타일 */}
            <div className="text-center pt-4 border-t border-white/10">
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-cyan-400/20 group-hover:shadow-cyan-400/40 group-hover:scale-105 transition-all duration-300 group-hover:from-cyan-400 group-hover:to-purple-400">
                <span className="text-lg">지금 바로 체험하기</span>
                <span className="ml-2 text-xl">✨</span>
              </div>
              <div className="text-white/50 text-xs mt-2">
                클릭하여 양방향 수어 번역을 시작하세요
              </div>
            </div>
          </div>
        </a>

        
        {/* 실시간(?) 통계/후기 */}
        <div className="flex flex-col items-center mb-24">
          <span className="text-white/70 text-base font-medium mb-1">
            오늘{" "}
            <strong className="text-cyan-300 text-xl">
              {todayUsers.toLocaleString()}
            </strong>
            명이 통역 서비스를 체험했어요!
          </span>
          <span className="text-sm text-white/50">
            이용자분들의 소중한 경험이 쌓이고 있습니다
          </span>
        </div>

        {/* 스크롤 다운 인디케이터 */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
          style={{
            opacity: Math.max(1 - scrollProgress / 10, 0),
          }}
          aria-hidden
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="text-white/70 text-sm">아래로 스크롤</span>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center bg-white/5 backdrop-blur-sm">
              <div className="w-1 h-3 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </main>

      {/* 기능 소개 섹션 */}
      <section
        className="relative z-20 py-24 bg-gradient-to-b from-transparent to-black/20"
        style={{
          transform: `translateY(${scrollY * -0.1}px)`,
        }}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-2xl">
              수담의 주요 기능
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto drop-shadow-lg">
              혁신적인 AI 기술로 더 나은 소통의 세상을 만들어갑니다
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative bg-black/30 backdrop-blur-xl p-8 rounded-2xl border border-white/20 hover:bg-black/40 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-blue-400 mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 수담이 만드는 변화 섹션 */}
      <section className="relative z-20 py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-2xl">
              수담이 만드는 변화
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-lg">
              실제 사용자들의 이야기와 함께하는 소통의 순간들
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* 중앙 연결선 */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-400 via-purple-500 to-cyan-400 opacity-60 shadow-lg shadow-blue-500/20"></div>

            {/* 이미지 카드 리스트 */}
            <div className="space-y-16">
              {[
                {
                  title: "실생활 솔루션",
                  description: `병원, 관공서, 교육기관 등 다양한 현장에서\n실시간 수어 통역은 소통의 해결책이 됩니다.\n`,
                  image: "/assets/imagecard01.png",
                  side: "left",
                },
                {
                  title: "AI 기술과 수어의 만남",
                  description: `인공지능 기반 실시간 번역 기술을 활용하여,\n수어와 음성/텍스트 간의 자연스러운 양방향 소통을 가능케 합니다.\n기술은 수어를 이해하고, 우리는 사람을 이해합니다.`,
                  image: "/assets/imagecard04.png",
                  side: "right",
                },
                {
                  title: "배움과 확장성",
                  description: `수어 학습기능을 지원하여 더 넓은 세상과 \n연결합니다.\n수어는 언어이자, 배움의 시작입니다.`,
                  image: "/assets/imagecard02.png",
                  side: "left",
                },
                {
                  title: "함께 만들어가는 수어 플랫폼",
                  description: `누구나 참여할 수 있는 열린 기술.\n이건 단순한 서비스가 아니라 '공존의 기술'입니다.`,
                  image: "/assets/imagecard03.png",
                  side: "right",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    item.side === "right" ? "flex-row-reverse" : ""
                  }`}
                  style={{
                    opacity: scrollProgress > 60 + index * 10 ? 1 : 0.3,
                    transform: `translateY(${
                      Math.max(0, scrollY - (1000 + index * 200)) * -0.05
                    }px)`,
                    transition: "all 0.8s ease-out",
                  }}
                >
                  {/* 카드 본체 */}
                  <div
                    className={`w-1/2 ${
                      item.side === "right" ? "pl-8" : "pr-8"
                    }`}
                  >
                    <div className="relative group bg-black/30 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-black/40 transition-all duration-500 transform hover:scale-105">
                      {/* Hover 시 등장할 이미지 */}
                      <div
                        className={`absolute z-20 hidden md:block ${
                          item.side === "right"
                            ? "right-[calc(100%+75px)]"
                            : "left-[calc(100%+75px)]"
                        } top-[0px] w-64 h-40 opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-90 group-hover:scale-100 rounded-xl overflow-hidden shadow-xl`}
                      >
                        <img
                          src={item.image}
                          alt={`${item.title} 일러스트`}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>

                      {/* 카드 내부 텍스트 */}
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-4">
                          {item.title}
                        </h3>
                        <p className="text-white/90 leading-relaxed whitespace-pre-line">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 연결점 */}
                  <div className="relative">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-4 border-white/20 shadow-lg shadow-blue-500/30 animate-pulse"></div>
                    <div
                      className={`absolute top-1/2 ${
                        item.side === "right" ? "right-6" : "left-6"
                      } w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500`}
                    ></div>
                  </div>

                  {/* 빈 공간 */}
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-30 flex flex-col items-center justify-center w-full py-10 bg-gradient-to-t from-black/80 via-black/60 to-transparent text-white/70 text-sm">
        <div className="flex flex-row flex-wrap gap-5 mb-3">
          <a
            href="/about"
            className="hover:text-cyan-300 underline underline-offset-4 transition"
          >
            서비스 소개
          </a>
          <a
            href="mailto:support@sudam.com"
            className="hover:text-cyan-300 underline underline-offset-4 transition"
          >
            문의처
          </a>
          <a
            href="/privacy"
            className="hover:text-cyan-300 underline underline-offset-4 transition"
          >
            개인정보처리방침
          </a>
        </div>
        <div>© {new Date().getFullYear()} 수담. All rights reserved.</div>
      </footer>

      
    </div>
  );
}

export default MainPage;