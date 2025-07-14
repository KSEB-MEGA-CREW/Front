import { useState } from "react";
import { NavLink } from "react-router-dom";

function TopMenuComponent() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">로고</div>
        {/* 데스크탑 메뉴 */}
        <div className="space-x-6 hidden md:flex">
          <NavLink
            to="/"
            className="text-white hover:text-yellow-300 transition"
          >
            Main
          </NavLink>
          <NavLink
            to="/about"
            className="text-white hover:text-yellow-300 transition"
          >
            About
          </NavLink>
        </div>
        {/* 모바일 메뉴 토글 버튼 */}
        <div className="md:hidden">
          <button
            className="text-white focus:outline-none"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="메뉴 열기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* 모바일 메뉴 */}
      <div
        className={`md:hidden bg-gray-800 p-4 space-y-2 ${
          mobileOpen ? "" : "hidden"
        }`}
      >
        <NavLink
          to="/"
          className="block text-white py-2 px-4 rounded hover:bg-gray-700 transition"
          onClick={() => setMobileOpen(false)}
        >
          Main
        </NavLink>
        <NavLink
          to="/about"
          className="block text-white py-2 px-4 rounded hover:bg-gray-700 transition"
          onClick={() => setMobileOpen(false)}
        >
          About
        </NavLink>
      </div>
    </nav>
  );
}

export default TopMenuComponent;
