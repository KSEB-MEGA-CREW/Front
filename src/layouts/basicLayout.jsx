import TopMenuComponent from "../components/menu/topMenu";

function BasicLayout({ children }) {
  return (
    <div>
      <TopMenuComponent />

      {/* TopMenu가 fixed일 경우를 고려해 위쪽 padding */}
      <div className="">{children}</div>
    </div>
  );
}

export default BasicLayout;
