import BasicLayout from "../../layouts/basicLayout";
import { Outlet } from "react-router-dom";
import AvatarButton from "../../components/button/avatarButton";
import VideoButton from "../../components/button/videoButton";

function TranslatePage() {
  return (
    <BasicLayout>
      <VideoButton />
      <div className="w-full ">
        <Outlet />
      </div>
    </BasicLayout>
  );
}

export default TranslatePage;
