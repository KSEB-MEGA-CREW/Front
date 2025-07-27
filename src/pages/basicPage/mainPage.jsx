import BasicLayout from "../../layouts/basicLayout";
import { useState, useEffect } from "react";
import { ChevronRight, Play, Users, Mic, BookOpen, Zap } from "lucide-react";
import TopMenuComponent from "../../components/menu/topMenu";

function MainPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 마우스 위치 추적
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "실시간 수어 번역",
      description: "AI 기술로 수어와 음성을 실시간으로 번역합니다",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "양방향 소통",
      description: "청각장애인과 청인 모두가 자연스럽게 대화할 수 있습니다",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "체계적인 학습",
      description: "단계별 수어 학습 프로그램을 제공합니다",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden relative">
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

      {/* 배경 */}
      <div className="fixed inset-0">
        <div
          className="fixed inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/back7.jpg')" }}
        ></div>
      </div>

      {/* 떠다니는 구름 애니메이션 */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute w-48 h-24 bg-white rounded-full opacity-20 blur-2xl animate-cloud1 top-[20%] left-[-10%]" />
        <div className="absolute w-40 h-20 bg-white rounded-full opacity-15 blur-2xl animate-cloud2 top-[30%] left-[50%]" />
        <div className="absolute w-64 h-28 bg-white rounded-full opacity-10 blur-2xl animate-cloud3 top-[50%] left-[80%]" />
        <div className="absolute w-52 h-24 bg-white rounded-full opacity-10 blur-2xl animate-cloud4 top-[70%] left-[30%]" />
      </div>

      {/* 메인 화면과 기능 소개 사이에 위치한 마우스 반응형 구름들 여기서 위치 조정 하기 */}
      <div className="absolute top-1/3 left-0 w-full h-96 pointer-events-none z-15 overflow-hidden">
        {/* 구름 1 - 큰 구름 */}
        <div
          className="absolute w-96 h-48 bg-white rounded-full opacity-30 transition-transform duration-1000 ease-out"
          style={{
            top: "20%",
            left: `${10 + (mousePosition.x - 50) * 0.1}%`,
            transform: `translateY(${(mousePosition.y - 50) * -0.05}px)`,
            filter: "blur(30px)",
          }}
        />

        {/* 구름 2 - 중간 구름 */}
        <div
          className="absolute w-80 h-40 bg-white rounded-full opacity-25 transition-transform duration-1200 ease-out"
          style={{
            top: "40%",
            right: `${5 + (mousePosition.x - 50) * 0.08}%`,
            transform: `translateY(${(mousePosition.y - 50) * -0.03}px)`,
            filter: "blur(25px)",
          }}
        />

        {/* 구름 3 - 작은 구름 */}
        <div
          className="absolute w-64 h-32 bg-white rounded-full opacity-35 transition-transform duration-800 ease-out"
          style={{
            top: "60%",
            left: `${50 + (mousePosition.x - 50) * 0.12}%`,
            transform: `translateY(${(mousePosition.y - 50) * -0.07}px)`,
            filter: "blur(20px)",
          }}
        />

        {/* 구름 4 - 넓은 구름 */}
        <div
          className="absolute w-[500px] h-60 bg-white rounded-full opacity-20 transition-transform duration-1500 ease-out"
          style={{
            top: "10%",
            left: `${30 + (mousePosition.x - 50) * 0.06}%`,
            transform: `translateY(${(mousePosition.y - 50) * -0.04}px)`,
            filter: "blur(40px)",
          }}
        />

        {/* 구름 5 - 왼쪽 구름 */}
        <div
          className="absolute w-72 h-36 bg-white rounded-full opacity-28 transition-transform duration-2000 ease-out"
          style={{
            top: "70%",
            left: `${-5 + (mousePosition.x - 50) * 0.15}%`,
            transform: `translateY(${(mousePosition.y - 50) * -0.08}px)`,
            filter: "blur(35px)",
          }}
        />

        {/* 구름 6 - 오른쪽 구름 */}
        <div
          className="absolute w-[400px] h-52 bg-white rounded-full opacity-23 transition-transform duration-1800 ease-out"
          style={{
            top: "50%",
            right: `${-10 + (mousePosition.x - 50) * 0.09}%`,
            transform: `translateY(${(mousePosition.y - 50) * -0.02}px)`,
            filter: "blur(45px)",
          }}
        />

        {/* 추가 배경 구름 */}
        <div
          className="absolute w-[600px] h-80 bg-white rounded-full opacity-15 transition-transform duration-2500 ease-out"
          style={{
            top: "30%",
            left: `${20 + (mousePosition.x - 50) * 0.04}%`,
            transform: `translateY(${(mousePosition.y - 50) * -0.01}px)`,
            filter: "blur(50px)",
          }}
        />
      </div>

      {/* 메인 콘텐츠 중앙 정렬 */}
      <main className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow mb-6">
          수어 통역이 더 가까워집니다
        </h1>
        <p className="text-xl text-white/80 max-w-xl mb-10">
          AI 기술로 수어와 음성을 실시간으로 번역하여, 청각장애인과 청인 간의
          원활한 소통을 지원합니다.
        </p>

        {/* 플레이 버튼 */}
        <button className="z-20 w-20 h-20 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 mb-12 hover:scale-110">
          <Play className="w-8 h-8 text-white ml-1" />
        </button>
      </main>

      {/* 기능 소개 섹션 */}
      <section className="relative z-20 py-24 bg-gradient-to-b from-transparent to-black/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              수담의 주요 기능
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              혁신적인 AI 기술로 더 나은 소통의 세상을 만들어갑니다
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-pink-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CSS 애니메이션 정의 */}
      <style jsx>{`
        @keyframes cloud1 {
          0%,
          100% {
            transform: translateX(0px) translateY(0px);
          }
          25% {
            transform: translateX(10px) translateY(-5px);
          }
          50% {
            transform: translateX(-5px) translateY(10px);
          }
          75% {
            transform: translateX(15px) translateY(5px);
          }
        }

        @keyframes cloud2 {
          0%,
          100% {
            transform: translateX(0px) translateY(0px);
          }
          33% {
            transform: translateX(-15px) translateY(8px);
          }
          66% {
            transform: translateX(8px) translateY(-12px);
          }
        }

        @keyframes cloud3 {
          0%,
          100% {
            transform: translateX(0px) translateY(0px);
          }
          20% {
            transform: translateX(-8px) translateY(-10px);
          }
          40% {
            transform: translateX(12px) translateY(15px);
          }
          60% {
            transform: translateX(-20px) translateY(-5px);
          }
          80% {
            transform: translateX(5px) translateY(8px);
          }
        }

        @keyframes cloud4 {
          0%,
          100% {
            transform: translateX(0px) translateY(0px);
          }
          50% {
            transform: translateX(-12px) translateY(-15px);
          }
        }

        .animate-cloud1 {
          animation: cloud1 20s infinite ease-in-out;
        }
        .animate-cloud2 {
          animation: cloud2 25s infinite ease-in-out;
        }
        .animate-cloud3 {
          animation: cloud3 30s infinite ease-in-out;
        }
        .animate-cloud4 {
          animation: cloud4 35s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default MainPage;
