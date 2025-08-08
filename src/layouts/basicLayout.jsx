import TopMenuComponent from "../components/menu/topMenu";
import { useLocation } from "react-router-dom";

function BasicLayout({ children }) {
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/main";

  return (
    <div className="min-h-screen">
      <TopMenuComponent />

      {/* TopMenu가 fixed일 경우를 고려해 위쪽 padding - 홈페이지는 패딩 없음 */}
      {isHomePage ? (
        <div>{children}</div>
      ) : (
        <div className="pt-24 px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default BasicLayout;
