import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Hand,
  ArrowRightLeft,
  Volume2,
  Play,
  CheckCircle,
  Star,
  Mic,
  Heart,
  Globe,
  Award,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "../../Context/themeContext";
import { useNavigate } from "react-router-dom"; // 1. useNavigate import

function MainPage() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate(); // 2. useNavigate 훅 사용
  const [translationDemo, setTranslationDemo] = useState(false);
  const [todayUsers] = useState(2847 + Math.floor(Math.random() * 153));

  useEffect(() => {
    const interval = setInterval(() => {
      setTranslationDemo((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "실시간 번역",
      description: "AI 기반 실시간 수어 번역으로 즉석에서 소통하세요",
      gradient: "bg-blue-500/50",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "양방향 소통",
      description: "수어와 문장을 자유롭게 번역하여 모두가 소통할 수 있어요",
      gradient: "bg-green-500/50",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "체계적인 학습",
      description: "단계별 수어 학습으로 실력을 체계적으로 향상시키세요",
      gradient: "bg-purple-500/50",
    },
  ];

  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      label: "활성 사용자",
      value: "15,000+",
    },
    { icon: <Globe className="w-6 h-6" />, label: "번역 완료", value: "2.5M+" },
    { icon: <Award className="w-6 h-6" />, label: "정확도", value: "98.5%" },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: "성장률",
      value: "+157%",
    },
  ];

  const projects = [
    {
      title: "실생활 속 수어 통역",
      description:
        "병원, 은행, 관공서 등 일상에서 필요한 순간마다 실시간 수어 통역을 제공합니다.",
      image: "/assets/imagecard01.png",
    },
    {
      title: "AI 기술의 혁신",
      description:
        "최신 딥러닝 기술로 수어의 미세한 움직임까지 정확하게 인식하고 번역합니다.",
      image: "/assets/imagecard04.png",
    },
    {
      title: "학습과 성장",
      description:
        "개인 맞춤형 학습 시스템으로 수어 실력을 체계적으로 향상시킬 수 있습니다.",
      image: "/assets/imagecard02.png",
    },
    {
      title: "함께 만드는 미래",
      description:
        "청각장애인과 청인이 함께 만들어가는 포용적인 소통 플랫폼입니다.",
      image: "/assets/imagecard03.png",
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className={`h-full w-full ${
              isDarkMode
                ? "bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600"
                : "bg-gradient-to-br from-blue-100 via-purple-100 to-cyan-100"
            }`}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-8 border-2 ${
                isDarkMode
                  ? "border-gray-500 text-white"
                  : "border-1 border-gray-500 text-gray-800"
              }`}
            >
              AI 기반 수어 번역 서비스
            </div>

            {/* Main Heading */}
            <h1
              className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="block">수어와 문장을</span>
              <span className="bg-white bg-clip-text">실시간으로 연결</span>
            </h1>

            {/* Subtitle */}
            <p
              className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              수어와 문장을 즉시 번역하여
              <br />
              모든 사람이 자유롭게 소통할 수 있는 세상을 만듭니다
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {/* <button
                onClick={() => navigate("/translate/video")}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              > */}
              <button
                onClick={() => navigate("/translate/video")}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-blue-500 text-white hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                지금 체험하기
              </button>
              {/* <button
                onClick={() => navigate("/study")}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                학습 시작하기
              </button> */}
            </div>

            {/* Demo Section */}
            <div
              className={`max-w-4xl mx-auto p-8 rounded-2xl border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-[#f1f3f5] border-gray-200"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-6 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                실시간 번역 예시
              </h3>

              <div className="flex items-center justify-center space-x-8 mb-6">
                {/* 수어 아이콘 */}
                <div
                  className={`relative transition-all duration-1000 ${
                    translationDemo ? "scale-110" : "scale-100"
                  }`}
                >
                  <div
                    className={`p-6 rounded-2xl ${
                      translationDemo
                        ? isDarkMode
                          ? "border-1 border-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "border-1 border-blue-500 text-gray-700 bg-blue-50 shadow-lg shadow-blue-500/30"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-400"
                        : "bg-white text-gray-500 shadow-md"
                    } transition-all duration-1000`}
                  >
                    <Hand className="w-12 h-12" />
                  </div>
                  <div
                    className={`text-sm mt-2 font-semibold text-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    수어
                  </div>
                </div>

                {/* 화살표 */}
                <div className="relative">
                  <ArrowRightLeft
                    className={`w-8 h-8 transition-all duration-500 ${
                      translationDemo ? "rotate-180" : "rotate-0"
                    } ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  />
                </div>

                {/* 음성 아이콘 */}
                <div
                  className={`relative transition-all duration-1000 ${
                    !translationDemo ? "scale-110" : "scale-100"
                  }`}
                >
                  <div
                    className={`p-6 rounded-2xl ${
                      !translationDemo
                        ? isDarkMode
                          ? "border-1 border-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "border-1 border-blue-500 text-gray-700 bg-blue-50 shadow-lg shadow-blue-500/30"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-400"
                        : "bg-white text-gray-500 shadow-md"
                    } transition-all duration-1000`}
                  >
                    <Volume2 className="w-12 h-12" />
                  </div>
                  <div
                    className={`text-sm mt-2 font-semibold text-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    문장
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {translationDemo
                    ? "🖐 '안녕하세요' → 💬 '안녕하세요'"
                    : "💬 '반갑습니다' → 🖐 '반갑습니다'"}
                </p>
                <p
                  className={`text-sm mt-2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {translationDemo
                    ? "수어를 문장으로 실시간 변환"
                    : "문장을 수어로 실시간 변환"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className={`py-16 ${isDarkMode ? "bg-gray-800" : "bg-[#f1f3f5]"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className={`text-3xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              실시간 서비스 현황
            </h2>
            <p
              className={`text-lg ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              오늘{" "}
              <span className="font-bold text-blue-500">
                {todayUsers.toLocaleString()}
              </span>
              명이 수담을 통해 소통했습니다
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-xl ${
                  isDarkMode ? "bg-gray-900" : "bg-white"
                } shadow-lg`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                    isDarkMode
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {stat.icon}
                </div>
                <div
                  className={`text-2xl font-bold mb-1 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stat.value}
                </div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              수담의 핵심 기능
            </h2>
            <p
              className={`text-xl max-w-3xl mx-auto ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              최신 AI 기술로 구현된 혁신적인 수어 번역 서비스의 주요 기능들을
              만나보세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg hover:shadow-xl`}
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 bg-gradient-to-r ${feature.gradient} text-white`}
                >
                  {feature.icon}
                </div>
                <h3
                  className={`text-xl font-bold mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`leading-relaxed ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        className={`py-20 ${isDarkMode ? "bg-gray-800" : "bg-[#f1f3f5]"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              수담이 만드는 변화
            </h2>
            <p
              className={`text-xl max-w-3xl mx-auto ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              AI 기술로 연결되는 새로운 소통의 세상, 모든 사람이 함께하는
              포용적인 미래
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className={`rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? "bg-gray-900" : "bg-white"
                } shadow-lg hover:shadow-xl`}
              >
                <div className="aspect-video">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <h3
                    className={`text-xl font-bold mb-4 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {project.title}
                  </h3>
                  <p
                    className={`leading-relaxed ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className={`p-12 rounded-3xl ${
              isDarkMode
                ? "bg-gradient-to-r from-gray-800 to-gray-900"
                : "bg-gradient-to-r from-[#f1f3f5] to-gray-50"
            }`}
          >
            {/* <Heart className="w-16 h-16 mx-auto mb-6 text-[#ff4444]" /> */}
            <h2
              className={`text-3xl md:text-4xl font-bold mb-6 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              함께 만들어가는 소통의 세상
            </h2>
            <p
              className={`text-xl mb-8 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              수담과 함께 모든 사람이 자유롭게 소통할 수 있는
              <br />
              포용적인 미래를 만들어보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/translate/video")}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-blue-500 text-white hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                지금 시작하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-12 ${
          isDarkMode
            ? "bg-gray-900 border-t border-gray-800"
            : "bg-[#f1f3f5] border-t border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                수담
              </h3>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                AI로 연결되는 수어 번역 서비스
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              <button
                onClick={() => navigate("/about")}
                className={`hover:text-blue-500 transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                서비스 소개
              </button>
              {/* mailto는 외부 앱을 실행하므로 a 태그를 유지합니다 */}
              <a
                href="mailto:dissolve1882@naver.com"
                className={`hover:text-blue-500 transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                문의하기
              </a>
              <button
                onClick={() => navigate("/privacy")}
                className={`hover:text-blue-500 transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                개인정보처리방침
              </button>
            </div>
          </div>

          <div
            className={`mt-8 pt-8 border-t text-center text-sm ${
              isDarkMode
                ? "border-gray-800 text-gray-400"
                : "border-gray-200 text-gray-600"
            }`}
          >
            © {new Date().getFullYear()} 수담. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainPage;
