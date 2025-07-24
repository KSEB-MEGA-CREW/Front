import BasicLayout from "../../layouts/basicLayout";
import { Outlet } from "react-router-dom";
import AvatarButton from "../../components/button/avatarButton";
import VideoButton from "../../components/button/videoButton";

function TranslatePage() {
  return (
    <BasicLayout>
      <div className="flex flex-col h-screen">
        {" "}
        {/* 화면 높이 꽉 차게 */}
        {/* 버튼들 위에 모으기 */}
        <div className="flex space-x-4 p-4 bg-gray-800">
          <AvatarButton />
          <VideoButton />
        </div>
        {/* Outlet은 나머지 공간 전부 차지 */}
        <div className="flex-1 w-full">
          <Outlet />
        </div>
      </div>
    </BasicLayout>
  );
}

export default TranslatePage;
