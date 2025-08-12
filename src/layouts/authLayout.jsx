import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

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

  const backgroundStyle = {
    backgroundImage: "url('/assets/image.png')",
    backgroundSize: "cover",
    backgroundPosition: `${mousePosition.x / 8}% ${mousePosition.y / 8}%`,
    backgroundRepeat: "no-repeat",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 0,
    transition: "background-position 0.4s ease-out",
  };
  const overlayStyle = {
    background: `rgba(0, 0, 0, 0.3)`,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    pointerEvents: "none",
  };
  const starsStyle = {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: `radial-gradient(2px 2px at 20px 30px, #eee, transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 90px 40px, #fff, transparent), radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent), radial-gradient(2px 2px at 160px 30px, #ddd, transparent)`,
    backgroundRepeat: "repeat",
    backgroundSize: "200px 100px",
    animation: "twinkle 4s ease-in-out infinite alternate",
    opacity: 0.5,
    zIndex: 2,
    pointerEvents: "none",
  };

  return (
    <div style={backgroundStyle} className="overflow-y-auto">
      <style jsx="true">{`
        @keyframes twinkle {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            opacity: 0.6;
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
      <div style={starsStyle}></div>
      <div style={overlayStyle}></div>

      <div className="flex flex-col md:flex-row w-full min-h-full relative z-10">
        <div className="flex-1 flex items-center justify-center p-8 md:p-0 md:pl-24 text-center md:text-left">
          <div className="text-white">
            <h1
              className="text-6xl md:text-8xl font-thin mb-6 md:mb-8 tracking-widest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              수담, 手談
            </h1>
            <p
              className="text-2xl md:text-3xl font-light mb-4 md:mb-6 tracking-wide"
              style={{ fontFamily: "Georgia, serif" }}
            >
              "소통의 장벽을 허물다."
            </p>
            <div
              className="text-lg md:text-xl leading-relaxed opacity-90 font-light max-w-2xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <p>누구나 자유롭게 이야기하고 이해받을 수 있도록,</p>
              <p>우리는 기술로 세상의 모든 말과 귀가 되어</p>
              <p>경계 없는 소통을 완성합니다.</p>
            </div>
          </div>
        </div>

        <div className="hidden md:block w-px bg-white opacity-30 my-16"></div>

        {/* 수정된 영역 */}
        <div className="flex-1 flex items-center justify-center p-8 md:p-0">
          {/* Outlet을 감싸는 컨테이너 박스 추가 */}
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
