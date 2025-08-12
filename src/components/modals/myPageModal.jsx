import React, { useState } from 'react';
import { X, User, Mail, Calendar, Award, Edit2, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../../Context/authContext';
import { useTheme } from '../../Context/themeContext';

const MyPageModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });

  if (!isOpen) return null;

  const handleEditToggle = () => {
    if (isEditMode) {
      // 편집 모드 취소
      setEditData({
        username: user?.username || '',
        email: user?.email || ''
      });
      setError('');
    }
    setIsEditMode(!isEditMode);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSave = async () => {
    if (!editData.username.trim()) {
      setError('사용자명을 입력해주세요.');
      return;
    }
    
    if (!editData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // 실제 API 호출은 여기서 구현
      // await updateUserProfile(editData);
      
      // 임시로 로컬 상태 업데이트
      if (updateUser) {
        updateUser({
          ...user,
          username: editData.username,
          email: editData.email
        });
      }
      
      // 로컬스토리지 업데이트
      const updatedUser = {
        ...user,
        username: editData.username,
        email: editData.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditMode(false);
      
      // 성공 알림 (선택사항)
      alert('프로필이 성공적으로 수정되었습니다.');
      
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      setError('프로필 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 콘텐츠 */}
      <div className={`
        relative w-full max-w-md mx-4 rounded-2xl shadow-2xl transform transition-all
        ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        
        {/* 헤더 */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isEditMode ? '프로필 수정' : '내 계정'}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditMode && (
              <button
                onClick={handleEditToggle}
                className={`
                  p-2 rounded-lg transition-colors
                  ${isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }
                `}
                title="프로필 수정"
              >
                <Edit2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition-colors
                ${isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 사용자 정보 */}
        <div className="p-6 space-y-6">
          
          {/* 프로필 이미지 및 기본 정보 */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className={`
                w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold
                ${isDarkMode 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                  : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                }
              `}>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.username || '사용자'}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                수어 학습자
              </p>
            </div>
          </div>

          {/* 계정 정보 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}
              `}>
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  사용자명
                </p>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`
                      w-full mt-1 px-3 py-2 rounded-lg border transition-colors
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20
                    `}
                    placeholder="사용자명을 입력하세요"
                  />
                ) : (
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.username || '사용자'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}
              `}>
                <Mail size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  이메일
                </p>
                {isEditMode ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`
                      w-full mt-1 px-3 py-2 rounded-lg border transition-colors
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20
                    `}
                    placeholder="이메일을 입력하세요"
                  />
                ) : (
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.email || 'user@example.com'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}
              `}>
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  가입일
                </p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '2024년 1월 1일'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}
              `}>
                <Award size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  학습 레벨
                </p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  초급자
                </p>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className={`
              p-3 rounded-lg border flex items-center gap-2
              ${isDarkMode 
                ? 'bg-red-900/20 border-red-700 text-red-400' 
                : 'bg-red-50 border-red-200 text-red-600'
              }
            `}>
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* 액션 버튼들 */}
          {isEditMode ? (
            <div className={`space-y-3 pt-4 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`
                  w-full p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                  ${isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  } text-white
                `}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    저장하기
                  </>
                )}
              </button>
              <button
                onClick={handleEditToggle}
                disabled={isLoading}
                className={`
                  w-full p-3 rounded-lg font-medium transition-colors border
                  ${isDarkMode 
                    ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                    : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                취소
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MyPageModal;