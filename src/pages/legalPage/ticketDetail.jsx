import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { authApi } from "../../api/authApi";
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  User,
  Send,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const TicketDetail = () => {
  const { isDarkMode } = useTheme();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    subject: "",
    content: "",
    category: "",
    isPublic: false,
  });

  const categories = [
    { id: "TECHNICAL", label: "기술적 문제", icon: "⚙️" },
    { id: "ACCOUNT", label: "계정 관련", icon: "👤" },
    { id: "LEARNING", label: "학습 문의", icon: "📚" },
    { id: "FEATURE", label: "기능 제안", icon: "💡" },
    { id: "OTHER", label: "기타", icon: "❓" },
  ];

  const getCategoryLabel = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.label : categoryId;
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.icon : "❓";
  };

  // useCallback to memoize the fetch function
  const fetchTicket = useCallback(async () => {
    if (!ticketId) {
      setError("문의 ID가 없습니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let response;
      // 분기 처리: 관리자인 경우와 일반 사용자인 경우 다른 API를 호출합니다.
      if (isAdmin()) {
        // 관리자용 API 호출
        console.log(
          `%c[API 요청] 관리자용 문의 상세 조회 (ID: ${ticketId})`,
          "color: #71a4d4; font-weight: bold;"
        );
        response = await authApi.getSupportTicketByAdminId(ticketId);
      } else {
        // 일반 사용자용 API 호출
        console.log(
          `%c[API 요청] 사용자용 문의 상세 조회 (ID: ${ticketId})`,
          "color: #71a4d4; font-weight: bold;"
        );
        response = await authApi.getSupportTicketById(ticketId);
      }

      console.log(
        "%c[API 응답] 문의 상세 정보:",
        "color: #5a9b5a; font-weight: bold;",
        response
      );

      if (response.success && response.data) {
        if (response.data.isPublic === true) {
          setTicket(response.data);
          setError("");
        } else {
          if (!isAdmin() && response.data.userId != user?.id) {
            setError("이 문의에 접근할 권한이 없습니다.");
            setTicket(null);
          } else {
            setTicket(response.data);
            setError("");
          }
        }
      } else {
        setError(response.message || "문의를 찾을 수 없습니다.");
        setTicket(null);
      }
    } catch (error) {
      console.error("문의 상세 로딩 실패:", error);
      setError(error.message || "문의를 불러오는데 실패했습니다.");
      setTicket(null);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId, user?.id, isAdmin]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      console.warn("답변 내용이 비어있습니다.");
      return;
    }

    setIsSubmittingReply(true);

    try {
      const replyData = {
        reply: replyContent.trim(),
      };

      console.log(
        `%c[API 요청] 관리자 답변 제출 (ID: ${ticketId})`,
        "color: #71a4d4; font-weight: bold;",
        replyData
      );
      const response = await authApi.submitSupportReply(ticketId, replyData);
      console.log(
        "%c[API 응답] 답변 제출 결과:",
        "color: #5a9b5a; font-weight: bold;",
        response
      );

      if (response.success) {
        // 답변 등록 성공 후, 문의 정보를 다시 불러와 상태를 업데이트합니다.
        await fetchTicket();
        setReplyContent("");
      } else {
        throw new Error(response.message || "답변 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("답변 등록 오류:", error);
      setError(error.message || "답변 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // 수정 모드 시작
  const handleEditStart = () => {
    setIsEditing(true);
    setEditFormData({
      subject: ticket.subject,
      content: ticket.content,
      category: ticket.category,
      isPublic: ticket.isPublic,
    });
  };

  // 수정 취소
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditFormData({
      subject: "",
      content: "",
      category: "",
      isPublic: false,
    });
  };

  // 게시글 수정
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.subject.trim() || !editFormData.content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const response = await authApi.updateSupportTicket(
        ticketId,
        editFormData
      );

      if (response.success) {
        await fetchTicket(); // 수정된 내용 다시 불러오기
        setIsEditing(false);
        setError("");
      } else {
        throw new Error(response.message || "게시글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("게시글 수정 오류:", error);
      setError(error.message || "게시글 수정 중 오류가 발생했습니다.");
    }
  };

  // 게시글 삭제
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      let response;

      // 관리자인 경우 관리자 삭제 API 사용
      if (isAdmin()) {
        response = await authApi.deleteSupportTicketByAdmin(ticketId);
      } else {
        response = await authApi.deleteSupportTicket(ticketId);
      }

      if (response.success) {
        // 삭제 성공 시 문의게시판으로 이동
        navigate("/inquiry-board");
      } else {
        throw new Error(response.message || "게시글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("게시글 삭제 오류:", error);
      setError(error.message || "게시글 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // 권한 체크 함수
  const canEdit = () => {
    return ticket && user && (ticket.userId == user.id || isAdmin());
  };

  const canDelete = () => {
    return ticket && user && (ticket.userId == user.id || isAdmin());
  };

  // 로딩 상태 UI
  if (isLoading) {
    return (
      <div
        className={`min-h-screen p-6 ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>
              문의 내용을 불러오는 중...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 에러 또는 티켓 데이터가 없는 경우의 UI
  if (error || !ticket) {
    return (
      <div
        className={`min-h-screen p-6 ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/inquiry-board")}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                  : "hover:bg-white text-gray-600 hover:text-gray-900"
              }`}
            >
              <ArrowLeft size={24} />
            </button>
          </div>
          <div
            className={`p-8 rounded-2xl shadow-lg border text-center ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {error ? "오류가 발생했습니다" : "문의를 찾을 수 없습니다"}
            </h3>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {error || "요청하신 문의가 존재하지 않거나 접근할 수 없습니다."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 메인 UI
  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/inquiry-board")}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                : "hover:bg-white text-gray-600 hover:text-gray-900"
            }`}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg ${
                isDarkMode
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <MessageSquare size={32} />
            </div>
            <h1
              className={`text-4xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              문의 상세
            </h1>
          </div>
        </div>

        {/* 문의 내용 */}
        <div
          className={`p-8 rounded-2xl shadow-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {/* 메타 정보 */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-lg">
                {getCategoryIcon(ticket.category)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isDarkMode
                    ? "border-1 border-gray-400 text-white"
                    : "border-1 border-gray-400 text-gray-800"
                }`}
              >
                {getCategoryLabel(ticket.category)}
              </span>

              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  isDarkMode
                    ? "border-1 border-gray-600 bg-gray-700 text-gray-300"
                    : "border-1 border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                <Calendar size={12} />
                {ticket.lastEditedDate &&
                ticket.lastEditedDate !== ticket.createdDate
                  ? `수정됨 ${new Date(
                      ticket.lastEditedDate
                    ).toLocaleDateString("ko-KR")}`
                  : ticket.createdDate
                  ? new Date(ticket.createdDate).toLocaleDateString("ko-KR")
                  : "날짜 없음"}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  ticket.isPublic
                    ? isDarkMode
                      ? ""
                      : ""
                    : isDarkMode
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                {ticket.isPublic ? "" : "🔒"}
              </span>
            </div>

            {/* 수정/삭제 버튼 */}
            {(canEdit() || canDelete()) && !isEditing && (
              <div className="flex gap-2">
                {/* 👇 이 부분에 조건을 추가합니다. */}
                {canEdit() && ticket.status === "PENDING" && (
                  <button
                    onClick={handleEditStart}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      isDarkMode
                        ? "border-1 border-gray-300 hover:bg-gray-600 hover:border-0 text-white"
                        : "border-1 border-gray-300 hover:bg-gray-200 hover:border-0 text-gray-800"
                    }`}
                  >
                    <Pencil size={14} />
                  </button>
                )}

                {canDelete() && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      isDarkMode
                        ? "border-1 border-gray-300 hover:bg-gray-600 hover:border-0 text-white"
                        : " border-1 border-gray-300 hover:bg-gray-200 text-gray-800"
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 수정 폼 */}
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4 mb-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  카테고리
                </label>
                <select
                  value={editFormData.category}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  제목
                </label>
                <input
                  type="text"
                  value={editFormData.subject}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="제목을 입력해주세요"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  내용
                </label>
                <textarea
                  value={editFormData.content}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={8}
                  className={`w-full px-3 py-2 rounded-lg border resize-none ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="내용을 입력해주세요"
                />
              </div>

              <div className="flex items-center gap-3">
                <label
                  className={`flex items-center gap-2 cursor-pointer ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={editFormData.isPublic}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        isPublic: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  공개 게시글
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  수정 완료
                </button>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                  }`}
                >
                  취소
                </button>
              </div>
            </form>
          ) : (
            <>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                제목 *
              </label>
              <div
                className={`p-4 rounded-lg border mb-3 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                {/* 제목 */}
                <h2
                  className={`text-sx whitespace-pre-wrap ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {ticket.subject}
                </h2>
              </div>

              {/* 내용 */}
              <label
                className={`block text-sm font-semibold mb-2 mt-6 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                문의 내용 *
              </label>
              <div
                className={`p-4 rounded-lg border mb-3 min-h-[155px] ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p
                  className={`text-sx whitespace-pre-wrap ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {ticket.content}
                </p>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 ">
            <User size={14} />
            <span
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {ticket.userName || "익명"}
            </span>
          </div>

          {/* 답변 */}
          {ticket.adminResponse && (
            <div className="space-y-4 mt-8">
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                관리자 답변
              </h3>
              <div
                className={`p-4 rounded-lg min-h-[130px] ${
                  isDarkMode
                    ? "bg-blue-900/20 border-blue-700/30"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <User size={14} className="text-blue-500" />
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {ticket.adminName || "관리자"}
                  </span>
                  <span
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {ticket.adminResponseDate
                      ? new Date(ticket.adminResponseDate).toLocaleDateString(
                          "ko-KR"
                        )
                      : "날짜 없음"}
                  </span>
                </div>
                <p
                  className={`text-sx whitespace-pre-wrap ${
                    isDarkMode ? "text-blue-200" : "text-blue-700"
                  }`}
                >
                  {ticket.adminResponse}
                </p>
              </div>
            </div>
          )}

          {/* 관리자 답변 작성 폼 */}
          {isAdmin() && !ticket.adminResponse && (
            <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-600">
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                답변 작성
              </h3>
              <form onSubmit={handleReplySubmit} className="space-y-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={6}
                  placeholder="답변 내용을 입력해주세요..."
                  className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReply || !replyContent.trim()}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      isSubmittingReply || !replyContent.trim()
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isSubmittingReply ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        답변 등록 중...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        답변 등록
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            style={{ backdropFilter: "blur(4px)" }}
          >
            <div
              className={`p-6 rounded-2xl shadow-xl max-w-md w-full mx-4 ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                게시글 삭제 확인
              </h3>
              <p
                className={`mb-6 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                정말로 이 게시글을 삭제하시겠습니까?
                <br />
                삭제된 게시글은 복구할 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isDeleting
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      삭제 중...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      삭제
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                  }`}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* <div className="text-center">
          <button
            onClick={() => navigate("/inquiry-board")}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <MessageSquare size={18} />
            게시판으로 돌아가기
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default TicketDetail;
