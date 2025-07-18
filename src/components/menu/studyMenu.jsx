// studyMenu.jsx
import { NavLink } from "react-router-dom";

function StudyMenu() {
  return (
    <nav className="bg-gray-900 w-full shadow-sm border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-start space-x-8 px-4 h-12">
        <NavLink
          to="/study/word"
          className={({ isActive }) =>
            `text-white text-base hover:text-yellow-300 transition ${
              isActive ? "font-bold text-yellow-300" : ""
            }`
          }
        >
          단어퀴즈
        </NavLink>
        <NavLink
          to="/study/sentence"
          className={({ isActive }) =>
            `text-white text-base hover:text-yellow-300 transition ${
              isActive ? "font-bold text-yellow-300" : ""
            }`
          }
        >
          문장퀴즈
        </NavLink>
      </div>
    </nav>
  );
}

export default StudyMenu;
