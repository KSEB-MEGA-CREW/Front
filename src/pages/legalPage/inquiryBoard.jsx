import React, { useState, useEffect } from "react";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { authApi } from "../../api/authApi";
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  User,
  Search,
  Filter,
  UserCheck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/pagination/Pagination";

const InquiryBoard = () => {
  const { isDarkMode } = useTheme();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("public"); // 'public', 'my', 'admin'
  const [isMyInquiryFilter, setIsMyInquiryFilter] = useState(false);

  // 페이징 상태 관리 (각 모드별 독립적)
  const [currentPage, setCurrentPage] = useState({
    public: 1,
    my: 1,
    admin: 1,
  });
  const [pageInfo, setPageInfo] = useState({
    public: { totalPages: 0, totalElements: 0, size: 5, number: 0 },
    my: { totalPages: 0, totalElements: 0, size: 5, number: 0 },
    admin: { totalPages: 0, totalElements: 0, size: 5, number: 0 },
  });

  const categories = [
    { id: "all", label: "전체", icon: "📋" },
    { id: "technical", label: "기술적 문제", icon: "⚙️" },
    { id: "account", label: "계정 관련", icon: "👤" },
    { id: "learning", label: "학습 문의", icon: "📚" },
    { id: "feature", label: "기능 제안", icon: "💡" },
    { id: "other", label: "기타", icon: "❓" },
  ];

  const getCategoryLabel = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.label : categoryId;
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.icon : "❓";
  };

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user?.id && (viewMode === "admin" || viewMode === "my")) {
        setError("사용자 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        let response;
        const page = currentPage[viewMode];
        const size = 5;

        switch (viewMode) {
          case "public":
            if (isMyInquiryFilter && user?.id) {
              // 내 문의만 보기 (공개+비공개 모두 포함)
              response = await authApi.getSupportTickets(page, size);
            } else {
              // 모든 공개 문의
              response = await authApi.getPublicSupportTickets(page, size);
            }
            break;

          case "my":
            response = await authApi.getSupportTickets(page, size);
            break;
          case "admin":
            if (isAdmin()) {
              response = await authApi.getAllSupportTickets(page, size);
            } else {
              throw new Error("관리자 권한이 필요합니다.");
            }
            break;
          default:
            response = await authApi.getPublicSupportTickets(page, size);
        }

        console.log(`[${viewMode} 모드] API 전체 응답:`, response);

        if (response.success && response.data) {
          let ticketData;
          let currentPageInfo;

          // 서버에서 페이징 정보와 함께 데이터가 온다고 가정
          if (response.data.content) {
            ticketData = response.data.content;
            currentPageInfo = {
              totalPages: response.data.totalPages || 0,
              totalElements: response.data.totalElements || 0,
              size: response.data.size || 5,
              number: response.data.number || 0,
            };
          } else {
            // 기존 방식 (배열만 오는 경우)
            ticketData = response.data;
            currentPageInfo = {
              totalPages: 1,
              totalElements: response.data.length,
              size: 5,
              number: 0,
            };
          }

          console.log("처리된 티켓 데이터:", ticketData);
          console.log("계산된 페이지 정보:", currentPageInfo);

          setTickets(ticketData);
          setPageInfo((prev) => ({
            ...prev,
            [viewMode]: currentPageInfo,
          }));
        } else {
          console.warn(
            `[${viewMode} 모드] API 응답 실패 또는 데이터 없음. 응답:`,
            response
          );
          setTickets([]);
          setPageInfo((prev) => ({
            ...prev,
            [viewMode]: {
              totalPages: 0,
              totalElements: 0,
              size: 5,
              number: 0,
            },
          }));
        }
      } catch (error) {
        console.error("문의 목록 로딩 실패:", error);
        setError("문의 목록을 불러오는데 실패했습니다.");
        setTickets([]);
        setPageInfo((prev) => ({
          ...prev,
          [viewMode]: {
            totalPages: 0,
            totalElements: 0,
            size: 5,
            number: 0,
          },
        }));
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchTickets();
  }, [user?.id, viewMode, isAdmin, currentPage, isMyInquiryFilter]);

  // 클라이언트 사이드 필터링 제거 (서버 사이드로 대체)

  // 권한 체크 헬퍼 함수
  const canViewTicket = (ticket, currentUser, isAdminUser) => {
    if (!ticket) return false;

    // 공개 게시글은 모든 사용자가 열람 가능
    if (ticket.isPublic) return true;

    // 비공개 게시글은 작성자 또는 관리자만 열람 가능
    if (!ticket.isPublic) {
      if (isAdminUser && isAdminUser()) return true;
      if (currentUser?.id && ticket.userId === currentUser.id) return true;
      return false;
    }

    return false;
  };

  // 대가 제목 반환
  const getDisplayTitle = (ticket, canView) => {
    if (canView) return ticket.subject;
    return "🔒 비공개 문의입니다";
  };

  // 표시용 내용 반환
  const getDisplayContent = (ticket, canView) => {
    if (canView) return ticket.content;
    return "이 문의는 비공개로 설정되어 있습니다. 작성자 또는 관리자만 열람할 수 있습니다.";
  };

  // 게시글 클릭 핸들러
  const handleTicketClick = (ticket) => {
    const canView = canViewTicket(ticket, user, isAdmin);

    if (!canView) {
      alert("비공개 문의입니다. 작성자 또는 관리자만 열람할 수 있습니다.");
      return;
    }

    navigate(`/ticket/${ticket.id}`);
  };

  // 내 문의 필터 토글
  const toggleMyInquiryFilter = () => {
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }
    setIsMyInquiryFilter(!isMyInquiryFilter);
    setSearchTerm(""); // 검색어 초기화
    setSelectedCategory("all"); // 카테고리 초기화
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    setCurrentPage((prev) => ({
      ...prev,
      [viewMode]: newPage,
    }));
  };

  // 뷰 모드 변경 시 페이지 초기화
  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    // 현재 페이지를 1로 리셋하지 않고 각 모드의 마지막 페이지를 유지
  };

  // 검색 및 필터링 (클라이언트 사이드)
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || ticket.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div
        className={`min-h-screen p-6 ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span
                className={`${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                문의 목록을 불러오는 중...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/customer-support")}
            className={`
              p-2 rounded-lg transition-colors
              ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                  : "hover:bg-white text-gray-600 hover:text-gray-900"
              }
            `}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div
              className={`
              p-3 rounded-lg
              ${
                isDarkMode
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }
            `}
            >
              <MessageSquare size={32} />
            </div>
            <h1
              className={`text-4xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              문의 게시판
            </h1>
          </div>
        </div>

        {/* 뷰 모드 탭 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleViewModeChange("public")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "public"
                ? "bg-blue-600 text-white"
                : isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🌐 공개 문의
          </button>
          {isAdmin() && (
            <button
              onClick={() => handleViewModeChange("admin")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "admin"
                  ? "bg-red-600 text-white"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ⚡ 관리자 뷰
            </button>
          )}
        </div>

        {/* 내 문의 필터 상태 표시 */}
        {isMyInquiryFilter && (
          <div
            className={`
            flex items-center justify-between p-3 rounded-lg mb-4
            ${
              isDarkMode
                ? "bg-blue-500/20 border border-blue-500/30"
                : "bg-blue-50 border border-blue-200"
            }
          `}
          >
            <div className="flex items-center gap-2">
              <UserCheck
                size={16}
                className={isDarkMode ? "text-blue-400" : "text-blue-600"}
              />
              <span
                className={`text-sm font-medium ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                내 문의만 표시 중 ({pageInfo[viewMode]?.totalElements || 0}개)
              </span>
            </div>
            <button
              onClick={toggleMyInquiryFilter}
              className={`
                p-1 rounded-md transition-colors
                ${
                  isDarkMode
                    ? "hover:bg-blue-500/30 text-blue-400"
                    : "hover:bg-blue-100 text-blue-600"
                }
              `}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제목이나 내용으로 검색..."
              disabled={isMyInquiryFilter}
              className={`
                w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                ${
                  isMyInquiryFilter
                    ? isDarkMode
                      ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                    : isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            />
          </div>

          <div className="flex gap-2">
            {/* 내 문의 찾기 버튼 */}
            <button
              onClick={toggleMyInquiryFilter}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap
                ${
                  isMyInquiryFilter
                    ? "bg-blue-600 text-white"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }
              `}
            >
              <UserCheck size={16} />
              <span className="hidden sm:inline">
                {isMyInquiryFilter ? "해제" : "내 문의 찾기"}
              </span>
            </button>

            {/* 카테고리 필터 */}
            <div className="relative">
              <Filter
                size={20}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={isMyInquiryFilter}
                className={`
                  pl-10 pr-8 py-3 rounded-lg border transition-colors appearance-none cursor-pointer
                  ${
                    isMyInquiryFilter
                      ? isDarkMode
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                      : isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                `}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 문의 목록 */}
        {error ? (
          <div
            className={`
            p-8 rounded-2xl shadow-lg border text-center
            ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div className="mb-4">
              <MessageSquare
                size={48}
                className={`mx-auto ${
                  isDarkMode ? "text-gray-600" : "text-gray-400"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              오류가 발생했습니다
            </h3>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {error}
            </p>
          </div>
        ) : tickets.length === 0 ? (
          <div
            className={`
            p-8 rounded-2xl shadow-lg border text-center
            ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div className="mb-4">
              <MessageSquare
                size={48}
                className={`mx-auto ${
                  isDarkMode ? "text-gray-600" : "text-gray-400"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              아직 문의가 없습니다
            </h3>
            <p
              className={`mb-4 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              궁금한 점이 있으시면 언제든지 문의해주세요.
            </p>
            <button
              onClick={() => navigate("/customer-support")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              문의하기
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div
            className={`
            p-8 rounded-2xl shadow-lg border text-center
            ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          >
            <div className="mb-4">
              <MessageSquare
                size={48}
                className={`mx-auto ${
                  isDarkMode ? "text-gray-600" : "text-gray-400"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              검색 결과가 없습니다
            </h3>
            <p
              className={`mb-4 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              다른 검색 조건으로 시도해보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const canView = canViewTicket(ticket, user, isAdmin);
              const displayTitle = getDisplayTitle(ticket, canView);
              const displayContent = getDisplayContent(ticket, canView);

              return (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket)}
                  className={`
                    p-6 rounded-2xl shadow-lg border transition-colors hover:shadow-xl cursor-pointer
                    ${
                      !canView
                        ? isDarkMode
                          ? "bg-gray-800 border-gray-700 opacity-75"
                          : "bg-gray-100 border-gray-200 opacity-75"
                        : isDarkMode
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg">
                        {getCategoryIcon(ticket.category)}
                      </span>
                      <span
                        className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${
                        isDarkMode
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-blue-100 text-blue-600"
                      }
                    `}
                      >
                        {getCategoryLabel(ticket.category)}
                      </span>

                      {/* 공개/비공개 상태 표시 */}
                      <span
                        className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${
                        ticket.isPublic
                          ? isDarkMode
                            ? "bg-green-500/20 text-green-400"
                            : "bg-green-100 text-green-600"
                          : isDarkMode
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-orange-100 text-orange-600"
                      }
                    `}
                      >
                        {ticket.isPublic ? "🌐 공개" : "🔒 비공개"}
                      </span>

                      {/* 관리자 뷰에서만 사용자명 표시 */}
                      {viewMode === "admin" && (
                        <span
                          className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${
                          isDarkMode
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-purple-100 text-purple-600"
                        }
                      `}
                        >
                          👤 {ticket.userName || "익명"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} />
                      <span
                        className={`${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString(
                              "ko-KR"
                            )
                          : "날짜 없음"}
                      </span>
                    </div>
                  </div>

                  <h3
                    className={`text-lg font-semibold mb-3 ${
                      !canView
                        ? isDarkMode
                          ? "text-gray-500"
                          : "text-gray-500"
                        : isDarkMode
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {displayTitle}
                  </h3>

                  <p
                    className={`text-sm mb-4 ${
                      !canView
                        ? isDarkMode
                          ? "text-gray-600"
                          : "text-gray-500"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-600"
                    }`}
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {displayContent}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {ticket.userName || "익명"}
                      </span>
                    </div>

                    {ticket.status && (
                      <span
                        className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${
                        ticket.status === "answered"
                          ? isDarkMode
                            ? "bg-green-500/20 text-green-400"
                            : "bg-green-100 text-green-600"
                          : isDarkMode
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-yellow-100 text-yellow-600"
                      }
                    `}
                      >
                        {ticket.status === "answered"
                          ? "답변 완료"
                          : "답변 대기"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 페이징 컴포넌트 */}
            <Pagination
              currentPage={currentPage[viewMode]}
              totalPages={pageInfo[viewMode]?.totalPages || 0}
              totalElements={pageInfo[viewMode]?.totalElements || 0}
              pageSize={pageInfo[viewMode]?.size || 5}
              onPageChange={handlePageChange}
              showInfo={true}
            />
          </div>
        )}

        {/* 하단 액션 */}
        <div className="text-center">
          <button
            onClick={() => navigate("/customer-support")}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <MessageSquare size={18} />새 문의하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default InquiryBoard;
