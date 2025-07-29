import BasicLayout from "../../layouts/basicLayout";
import { useState, useEffect } from "react";
import { ChevronRight, Play, Users, Mic, BookOpen, Zap } from "lucide-react";
import TopMenuComponent from "../../components/menu/topMenu";

function MainPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [stars, setStars] = useState([]);
  const [particles, setParticles] = useState([]);

  // 별과 입자 생성
  useEffect(() => {
    // 반짝이는 별들 생성
    const generateStars = () => {
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

    // 떠다니는 입자들 생성
    const generateParticles = () => {
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
  }, []);

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
      setScrollProgress((currentScrollY / (documentHeight - windowHeight)) * 100);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "실시간 수어 번역",
      description: "AI 기술로 수어와 음성을 실시간으로 번역합니다",
      color: "from-blue-400 to-purple-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "양방향 소통",
      description: "청각장애인과 청인 모두가 자연스럽게 대화할 수 있습니다",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "체계적인 학습",
      description: "단계별 수어 학습 프로그램을 제공합니다",
      color: "from-pink-400 to-red-500"
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* 스크롤 진행도 바 */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/20 z-50">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 플로팅 스크롤 인디케이터 */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
        <div className="flex flex-col space-y-2">
          {[0, 25, 50, 75, 100].map((threshold, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                scrollProgress > threshold 
                  ? 'bg-cyan-400/80 scale-125 shadow-lg shadow-cyan-400/50' 
                  : 'bg-white/20 scale-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 반달 - 중앙 상단 배치, 아래쪽이 둥근 형태 */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-48 z-30 overflow-hidden">
        <div className="relative w-full h-full">
          {/* 달 빛 효과 
         <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[250px] h-[250px]">
  <img src="/assets/moon.png" alt="moon" className="w-full h-full object-contain opacity-80" />
</div> */}
        </div>
      </div>

      {/* TopMenu - 달 안에 배치 */}
      <div className="absolute top-0 left-0 w-full z-40">
        <TopMenuComponent />
      </div>

      {/* 패럴랙스 배경 */}
      <div className="fixed inset-0 -z-10">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-200"
          style={{ 
            backgroundImage: "url('/assets/back7.jpg')",
            transform: `translateY(${scrollY * 0.2}px)`
          }}
        />
      </div>

      {/* 반짝이는 별들 */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(147,51,234,0.4) 50%, transparent 100%)',
              borderRadius: '50%',
              animationDelay: `${star.twinkleSpeed}s`,
              animationDuration: `${2 + star.twinkleSpeed}s`
            }}
          />
        ))}
      </div>

      {/* 떠다니는 입자들 */}
      <div className="fixed inset-0 pointer-events-none z-6">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-float rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: 'linear-gradient(45deg, rgba(59,130,246,0.6), rgba(147,51,234,0.6))',
              animationDelay: `${particle.speed}s`
            }}
          />
        ))}
      </div>

      {/* 궤도 도는 요소들 */}
      <div className="fixed inset-0 pointer-events-none z-8 flex items-center justify-center">
        <div className="relative">
          <div className="animate-orbit-slow">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-lg shadow-blue-400/50"></div>
          </div>
          <div className="animate-orbit-fast">
            <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-400/50"></div>
          </div>
        </div>
      </div>

      {/* 마우스 반응형 오로라 효과 */}
      <div className="fixed inset-0 pointer-events-none z-9">
        <div
          className="absolute w-96 h-96 rounded-full transition-all duration-1000 ease-out"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, 
              rgba(100, 130, 246, ${0.1 + Math.sin(Date.now() * 0.001) * 0.05}) 30%,
              rgba(147, 100, 234, ${0.08 + Math.cos(Date.now() * 0.0015) * 0.04}) 50%,
              rgba(236, 100, 200, ${0.05 + Math.sin(Date.now() * 0.002) * 0.03}) 60%,
              transparent 100%
            )`,
            filter: 'blur(40px)',
            opacity: 0.6
          }}
        />
      </div>

      {/* 메인 콘텐츠 중앙 정렬 */}
      <main 
        className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-6"
        style={{ 
          transform: `translateY(${scrollY * -0.3}px)`,
          opacity: Math.max(1 - scrollProgress / 25, 0.1)
        }}
      >
        <h1 
          className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl mb-6 transition-all duration-700 animate-pulse-glow"
          style={{
            transform: `scale(${1 - scrollProgress * 0.002})`
          }}
        >
          수어 통역이 더 가까워집니다
        </h1>
        <p 
          className="text-xl text-white/90 max-w-xl mb-10 transition-all duration-700 drop-shadow-lg"
          style={{
            opacity: Math.max(1 - scrollProgress / 20, 0.5)
          }}
        >
          AI 기술로 수어와 음성을 실시간으로 번역하여, 청각장애인과 청인 간의
          원활한 소통을 지원합니다.
        </p>

        {/* 플레이 버튼 - 개선된 디자인 */}
        <button className="relative z-20 w-20 h-20 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 mb-12 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/30 animate-pulse-glow">
          <Play className="w-8 h-8 text-white ml-1" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-500/20 animate-pulse"></div>
        </button>

        {/* 스크롤 다운 인디케이터 */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
          style={{
            opacity: Math.max(1 - scrollProgress / 10, 0)
          }}
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
          transform: `translateY(${scrollY * -0.1}px)`
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
                  side: "left"
                },
                {
                  title: "AI 기술과 수어의 만남",
                  description: `인공지능 기반 실시간 번역 기술을 활용하여,\n수어와 음성/텍스트 간의 자연스러운 양방향 소통을 가능케 합니다.\n기술은 수어를 이해하고, 우리는 사람을 이해합니다.`,
                  image: "/assets/imagecard04.png",
                  side: "right"
                },
                {
                  title: "배움과 확장성",
                  description: `수어 학습기능을 지원하여 더 넓은 세상과 \n연결합니다.\n수어는 언어이자, 배움의 시작입니다.`,
                  image: "/assets/imagecard02.png",
                  side: "left"
                },
                {
                  title: "함께 만들어가는 수어 플랫폼",
                  description: `누구나 참여할 수 있는 열린 기술.\n이건 단순한 서비스가 아니라 '공존의 기술'입니다.`,
                  image: "/assets/imagecard03.png",
                  side: "right"
                }
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center ${item.side === 'right' ? 'flex-row-reverse' : ''}`}
                  style={{
                    opacity: scrollProgress > (60 + index * 10) ? 1 : 0.3,
                    transform: `translateY(${Math.max(0, scrollY - (1000 + index * 200)) * -0.05}px)`,
                    transition: 'all 0.8s ease-out'
                  }}
                >
                  {/* 카드 본체 */}
                  <div className={`w-1/2 ${item.side === 'right' ? 'pl-8' : 'pr-8'}`}>
                    <div className="relative group bg-black/30 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-black/40 transition-all duration-500 transform hover:scale-105">
                      
                      {/* Hover 시 등장할 이미지 */}
                      <div className={`absolute z-20 hidden md:block ${item.side === 'right' ? 'right-[calc(100%+75px)]' : 'left-[calc(100%+75px)]'} top-[0px] w-64 h-40 opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-90 group-hover:scale-100 rounded-xl overflow-hidden shadow-xl`}>
                        <img
                          src={item.image}
                          alt={`${item.title} 이미지`}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>

                      {/* 카드 내부 텍스트 */}
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                        <p className="text-white/90 leading-relaxed whitespace-pre-line">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 연결점 */}
                  <div className="relative">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-4 border-white/20 shadow-lg shadow-blue-500/30 animate-pulse"></div>
                    <div className={`absolute top-1/2 ${item.side === 'right' ? 'right-6' : 'left-6'} w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500`}></div>
                  </div>

                  {/* 빈 공간 */}
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CSS 애니메이션 정의 */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        
        @keyframes shootingStar {
          0% { transform: translateX(-100px) translateY(-100px) rotate(45deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100vw) translateY(100vh) rotate(45deg); opacity: 0; }
        }
        
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.3); }
          50% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.6), 0 0 60px rgba(59, 130, 246, 0.4); }
        }
        
        @keyframes orbitSlow {
          0% { transform: rotate(0deg) translateX(200px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(200px) rotate(-360deg); }
        }
        
        @keyframes orbitFast {
          0% { transform: rotate(0deg) translateX(150px) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(150px) rotate(360deg); }
        }

        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-shooting-star { animation: shootingStar 3s linear infinite; }
        .animate-pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
        .animate-orbit-slow { animation: orbitSlow 20s linear infinite; }
        .animate-orbit-fast { animation: orbitFast 15s linear infinite; }
      `}</style>
    </div>
  );
}

export default MainPage;