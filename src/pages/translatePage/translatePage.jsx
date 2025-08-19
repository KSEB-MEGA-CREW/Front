import BasicLayout from "../../layouts/basicLayout";
import { Outlet, useLocation } from "react-router-dom";
import AvatarButton from "../../components/button/avatarButton";
import VideoButton from "../../components/button/videoButton";

function TranslatePage() {
  const location = useLocation();
  
  const isMainTranslatePage = location.pathname === '/translate';

  return (
    <BasicLayout>
      {isMainTranslatePage ? (
        <div className="fixed inset-0 top-0 z-10 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                수어 번역 서비스
              </h1>
              <p className="text-xl text-gray-600">
                원하시는 번역 방식을 선택해주세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <AvatarButton />
              <VideoButton />
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-500 text-sm">
                두 서비스 모두 고품질의 수어 번역을 제공합니다
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-screen">
          <Outlet />
        </div>
      )}
    </BasicLayout>
  );
}

export default TranslatePage;