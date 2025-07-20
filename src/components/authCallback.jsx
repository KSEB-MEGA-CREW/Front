import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const authCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log('AuthCallback 컴포넌트 로드됨');
    console.log('현재 URL:', window.location.href);
    console.log('URL 파라미터:', searchParams.toString());
    
    const handleCallback = () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const success = searchParams.get('success');

      console.log('Token:', token);
      console.log('Error:', error);
      console.log('Success:', success);

      if (error) {
        console.error('OAuth 에러:', error);
        // 에러 메시지를 사용자 친화적으로 변환
        const errorMessages = {
          'no_email': '이메일 정보를 가져올 수 없습니다.',
          'server_error': '서버 오류가 발생했습니다.',
          'OAuth2_인증_실패': 'Google 인증에 실패했습니다.',
          'auth_failed': '인증에 실패했습니다.'
        };
        
        const userFriendlyError = errorMessages[error] || '로그인 중 오류가 발생했습니다.';
        alert(userFriendlyError);
        navigate('/login');
        return;
      }

      if (token && success === 'true') {
        console.log('토큰 저장:', token);
        
        // 토큰 저장
        localStorage.setItem('token', token);
        
        // 성공 메시지 (선택사항)
        // alert('로그인에 성공했습니다!');
        
        // 메인 페이지로 이동
        navigate('/');
        return;
      }

      // 토큰도 에러도 없는 경우
      console.warn('토큰과 에러 정보가 모두 없습니다');
      console.warn('전체 URL 파라미터:', Object.fromEntries(searchParams));
      navigate('/login');
    };

    // 약간의 지연을 주어 URL 파싱 완료 대기
    const timer = setTimeout(handleCallback, 200);
    
    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          로그인 처리 중...
        </h2>
        <p className="text-gray-600 mb-4">
          잠시만 기다려주세요.
        </p>
        <div className="text-xs text-gray-400 break-all">
          {window.location.href}
        </div>
      </div>
    </div>
  );
};

export default authCallback;