import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../Context/themeContext';
import { Settings, Moon, Sun, Info, Shield, Bell, ChevronRight } from 'lucide-react';

const SettingsPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 페이지 헤더 */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className={`
              p-3 rounded-lg
              ${isDarkMode 
                ? 'bg-gray-800 text-gray-300' 
                : 'bg-white text-gray-600'
              }
            `}>
              <Settings size={32} />
            </div>
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              설정
            </h1>
          </div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            앱 설정을 개인화하고 사용 경험을 향상시키세요
          </p>
        </div>

        {/* 설정 섹션들 */}
        <div className="space-y-6">
          
          {/* 테마 설정 */}
          <div className={`
            p-6 rounded-2xl shadow-lg border
            ${isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`
                  p-3 rounded-lg
                  ${isDarkMode 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-blue-100 text-blue-600'
                  }
                `}>
                  {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    테마 설정
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    다크 모드와 라이트 모드를 전환하세요
                  </p>
                </div>
              </div>
              
              {/* 테마 토글 스위치 */}
              <button
                onClick={toggleTheme}
                className={`
                  relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                    ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className={`
            p-6 rounded-2xl shadow-lg border
            ${isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }
          `}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`
                p-3 rounded-lg
                ${isDarkMode 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-yellow-100 text-yellow-600'
                }
              `}>
                <Bell size={24} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  알림 설정
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  학습 알림 및 앱 알림을 관리하세요
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  학습 리마인더
                </span>
                <button className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}
                `}>
                  <span className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6
                  `} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  진행 상황 알림
                </span>
                <button className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}
                `}>
                  <span className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1
                  `} />
                </button>
              </div>
            </div>
          </div>

          {/* 개인정보 및 보안 */}
          <div className={`
            p-6 rounded-2xl shadow-lg border
            ${isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }
          `}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`
                p-3 rounded-lg
                ${isDarkMode 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-green-100 text-green-600'
                }
              `}>
                <Shield size={24} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  개인정보 및 보안
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  계정 보안 및 개인정보 설정
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button className={`
                w-full text-left p-3 rounded-lg transition-colors
                ${isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-700'
                }
              `}>
                비밀번호 변경
              </button>
              <button 
                onClick={() => navigate('/privacy-policy')}
                className={`
                  w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between group
                  ${isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <span>개인정보 처리방침</span>
                <ChevronRight size={16} className={`transition-transform group-hover:translate-x-1 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </button>
              <button className={`
                w-full text-left p-3 rounded-lg transition-colors
                ${isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-700'
                }
              `}>
                계정 삭제
              </button>
            </div>
          </div>

          {/* 앱 정보 */}
          <div className={`
            p-6 rounded-2xl shadow-lg border
            ${isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }
          `}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`
                p-3 rounded-lg
                ${isDarkMode 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-purple-100 text-purple-600'
                }
              `}>
                <Info size={24} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  앱 정보
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  앱 버전 및 지원 정보
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  앱 버전
                </span>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  v1.0.0
                </span>
              </div>
              <button 
                onClick={() => navigate('/terms-of-service')}
                className={`
                  w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between group
                  ${isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <span>이용약관</span>
                <ChevronRight size={16} className={`transition-transform group-hover:translate-x-1 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </button>
              <button 
                onClick={() => navigate('/customer-support')}
                className={`
                  w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between group
                  ${isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <span>고객 지원</span>
                <ChevronRight size={16} className={`transition-transform group-hover:translate-x-1 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;