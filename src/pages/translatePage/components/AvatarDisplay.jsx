import React, { useEffect, useState } from 'react';
import { 
  Loader, 
  AlertCircle, 
  CheckCircle, 
  ZoomIn, 
  ZoomOut 
} from 'lucide-react';
import { useTheme } from '../../../Context/themeContext';
import GLBAvatarPlayerRaw from '../GLBAvatarPlayer.jsx';

// GLBAvatarPlayer 메모이제이션으로 불필요한 재렌더링 방지
const GLBAvatarPlayer = React.memo(GLBAvatarPlayerRaw);

const AvatarDisplay = ({
  // Unity 관련
  isUnityLoaded,
  isUnityLoading,
  unityError,
  unityContainerRef,
  
  // 애니메이션 관련
  animationType, // 'glb' | 'unity'
  animationUrl,
  isPlaying,
  currentTranslation,
  
  // 공통 상태
  isConversionLoading,
  conversionError,
  
  // GLB 관련
  cameraZoom,
  onZoomIn,
  onZoomOut, 
  onZoomReset,
  onAnimationEnd
}) => {
  const { theme, isDarkMode } = useTheme();

  const getStatusColor = () => {
    if (unityError || conversionError) return "text-red-500";
    if (isConversionLoading || isUnityLoading) return "text-yellow-500";
    if (isUnityLoaded && !isPlaying) return "text-green-500";
    if (isPlaying) return "text-blue-500";
    return "text-gray-500";
  };

  const getStatusText = () => {
    if (unityError) return "Unity 로딩 오류";
    if (conversionError) return "AI 변환 오류";
    if (isConversionLoading) return "AI 변환 중...";
    if (isUnityLoading) return "Unity 로딩 중...";
    if (isPlaying) {
      return animationType === 'unity' ? "Unity 수어 재생 중" : "GLB 수어 재생 중";
    }
    if (isUnityLoaded) return "준비 완료";
    return "초기화 중...";
  };

  return (
    <div
      className={`w-full h-full rounded-3xl overflow-hidden relative border ${
        theme === "high-contrast"
          ? "bg-black border-2 border-yellow-400"
          : isDarkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      {/* 상단 상태 표시 */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400 text-yellow-400"
                : isDarkMode
                ? "bg-gray-700 text-gray-200"
                : "bg-gray-100 text-gray-700"
            } ${getStatusColor()}`}
          >
            {isUnityLoading || isConversionLoading ? (
              <Loader size={16} className="animate-spin" />
            ) : unityError || conversionError ? (
              <AlertCircle size={16} />
            ) : isUnityLoaded ? (
              <CheckCircle size={16} />
            ) : (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            <span>{getStatusText()}</span>
          </div>

          {/* 현재 재생 중인 애니메이션 정보 */}
          {isPlaying && currentTranslation && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                theme === "high-contrast"
                  ? "bg-black border-2 border-yellow-400 text-yellow-400"
                  : isDarkMode
                  ? "bg-gray-700 text-[#ff4444]"
                  : "bg-gray-100 text-[#ff4444]"
              }`}
            >
              <div className="w-2 h-2 bg-[#ff4444] rounded-full animate-pulse" />
              재생 중: {currentTranslation.text}
            </div>
          )}
        </div>
      </div>

      {/* 아바타 컨테이너 */}
      <div className="w-full h-full flex items-center justify-center relative">
        <div
          className={`w-full max-w-4xl h-full max-h-[600px] border relative ${
            theme === "high-contrast"
              ? "bg-gray-900 border-yellow-400"
              : isDarkMode
              ? "bg-gray-900/10 border-white/10"
              : "bg-gray-900/10 border-white/10"
          }`}
          style={{ minHeight: "400px" }}
        >
          {/* GLB 애니메이션 오버레이 */}
          {animationType === 'glb' && (
            <div className="absolute inset-0 z-10">
              <GLBAvatarPlayer
                avatarUrl="/avatar.glb"
                animationUrl={animationUrl}
                play={isPlaying}
                dark={isDarkMode || theme === "high-contrast"}
                zoom={cameraZoom}
                onEnd={onAnimationEnd}
              />
            </div>
          )}
          
          {/* Unity 컨테이너 - 항상 DOM에 유지하되 가시성 제어 */}
          <div 
            ref={unityContainerRef}
            className="w-full h-full"
            style={{ 
              minHeight: "400px", 
              visibility: animationType === 'unity' ? 'visible' : 'hidden',
              position: animationType === 'glb' ? 'absolute' : 'relative'
            }}
          >
            {/* Unity 로딩 중 표시 */}
            {!isUnityLoaded && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    Unity 아바타 초기화 중...
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* 줌 컨트롤 (GLB 모드일 때만 표시) */}
          {animationType === 'glb' && (
            <div className="absolute top-2 right-2 md:top-2 md:right-2 z-20 flex items-center gap-1">
              <button
                onClick={onZoomOut}
                className={`p-2 rounded-lg transition-all duration-200 shadow-lg ${
                  theme === "high-contrast"
                    ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    : isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white"
                    : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200"
                }`}
                title="축소"
              >
                <ZoomOut size={16} />
              </button>

              <button
                onClick={onZoomReset}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg ${
                  theme === "high-contrast"
                    ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    : isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white"
                    : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200"
                }`}
                title="원본 크기"
              >
                {Math.round(cameraZoom * 100)}%
              </button>

              <button
                onClick={onZoomIn}
                className={`p-2 rounded-lg transition-all duration-200 shadow-lg ${
                  theme === "high-contrast"
                    ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    : isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white"
                    : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200"
                }`}
                title="확대"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {(isUnityLoading || isConversionLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-30">
          <div
            className={`text-lg font-semibold px-8 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 ${
              theme === "high-contrast"
                ? "bg-black border-2 border-yellow-400 text-yellow-400"
                : isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-200 text-gray-800"
            }`}
          >
            <Loader size={24} className="animate-spin text-blue-500" />
            {isUnityLoading
              ? "Unity 아바타 로딩 중..."
              : "AI가 수어를 생성하고 있습니다..."}
          </div>
        </div>
      )}

      {/* 오류 표시 */}
      {(unityError || conversionError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
          <div
            className={`text-center px-8 py-6 rounded-2xl shadow-2xl border ${
              theme === "high-contrast"
                ? "bg-black border-2 border-red-400 text-red-400"
                : isDarkMode
                ? "bg-gray-800 border-red-700 text-red-400"
                : "bg-white border-red-200 text-red-600"
            }`}
          >
            <AlertCircle size={32} className="mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">오류 발생</h3>
            <p className="text-sm">
              {unityError || conversionError}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;