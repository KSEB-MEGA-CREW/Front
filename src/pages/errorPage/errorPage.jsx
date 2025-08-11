import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        {/* 404 Number */}
        <div className="text-9xl font-bold text-gray-300 mb-4">
          404
        </div>
        
        {/* Main Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          페이지를 찾을 수 없습니다
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            홈으로 돌아가기
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            이전 페이지로
          </button>
        </div>
        
        {/* Additional Help */}
        <div className="mt-12 text-sm text-gray-500">
          <p>문제가 지속되면 관리자에게 문의해 주세요.</p>
        </div>
        
        {/* Decorative Element */}
        <div className="mt-8">
          <svg 
            className="w-16 h-16 mx-auto text-gray-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-8h3m-3 0a4 4 0 00-4 4v1m0 0a4 4 0 004 4h6a4 4 0 004-4v-1a4 4 0 00-4-4h-3z" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;