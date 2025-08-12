import React, { useState, useEffect } from 'react';
import { useTheme } from '../../Context/themeContext';
import { useAuth } from '../../Context/authContext';
import { authApi } from '../../api/authApi';
import { ArrowLeft, MessageSquare, Calendar, Tag, User, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InquiryBoard = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: '전체', icon: '📋' },
    { id: 'technical', label: '기술적 문제', icon: '⚙️' },
    { id: 'account', label: '계정 관련', icon: '👤' },
    { id: 'learning', label: '학습 문의', icon: '📚' },
    { id: 'feature', label: '기능 제안', icon: '💡' },
    { id: 'other', label: '기타', icon: '❓' }
  ];

  const getCategoryLabel = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.label : categoryId;
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '❓';
  };

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user?.id) {
        setError('사용자 정보를 찾을 수 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getSupportTickets(user.id);
        if (response.success && response.data) {
          setTickets(response.data);
        } else {
          setTickets([]);
        }
      } catch (error) {
        console.error('문의 목록 로딩 실패:', error);
        setError('문의 목록을 불러오는데 실패했습니다.');
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user?.id]);

  // 검색 및 필터링
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ticket.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                문의 목록을 불러오는 중...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/customer-support')}
            className={`
              p-2 rounded-lg transition-colors
              ${isDarkMode 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-white text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className={`
              p-3 rounded-lg
              ${isDarkMode 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'bg-blue-100 text-blue-600'
              }
            `}>
              <MessageSquare size={32} />
            </div>
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              문의 게시판
            </h1>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제목이나 내용으로 검색..."
              className={`
                w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                ${isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            />
          </div>
          
          <div className="relative">
            <Filter size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`
                pl-10 pr-8 py-3 rounded-lg border transition-colors appearance-none cursor-pointer
                ${isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 문의 목록 */}
        {error ? (
          <div className={`
            p-8 rounded-2xl shadow-lg border text-center
            ${isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }
          `}>
            <div className="mb-4">
              <MessageSquare size={48} className={`mx-auto ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              오류가 발생했습니다
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className={`
            p-8 rounded-2xl shadow-lg border text-center
            ${isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }
          `}>
            <div className="mb-4">
              <MessageSquare size={48} className={`mx-auto ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {searchTerm || selectedCategory !== 'all' ? '검색 결과가 없습니다' : '아직 문의가 없습니다'}
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm || selectedCategory !== 'all' 
                ? '다른 검색 조건으로 시도해보세요.' 
                : '궁금한 점이 있으시면 언제든지 문의해주세요.'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => navigate('/customer-support')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                문의하기
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`
                  p-6 rounded-2xl shadow-lg border transition-colors hover:shadow-xl
                  ${isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getCategoryIcon(ticket.category)}</span>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${isDarkMode 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-blue-100 text-blue-600'
                      }
                    `}>
                      {getCategoryLabel(ticket.category)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} />
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('ko-KR') : '날짜 없음'}
                    </span>
                  </div>
                </div>

                <h3 className={`text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {ticket.subject}
                </h3>

                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {ticket.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {ticket.userName || '익명'}
                    </span>
                  </div>
                  
                  {ticket.status && (
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${ticket.status === 'answered' 
                        ? isDarkMode 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-green-100 text-green-600'
                        : isDarkMode
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-yellow-100 text-yellow-600'
                      }
                    `}>
                      {ticket.status === 'answered' ? '답변 완료' : '답변 대기'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 하단 액션 */}
        <div className="text-center">
          <button
            onClick={() => navigate('/customer-support')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <MessageSquare size={18} />
            새 문의하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default InquiryBoard;