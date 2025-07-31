// videoGuid.jsx
import React from "react";

export default function VideoGuid({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-black rounded-lg overflow-hidden relative max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()} // 팝업 내부 클릭 시 닫히지 않게 방지
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-2xl font-bold hover:text-gray-300"
          aria-label="Close video popup"
        >
          ×
        </button>
        <video
          src="/path/to/your/video.mp4" // 실제 동영상 경로로 교체하세요
          controls
          autoPlay
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
