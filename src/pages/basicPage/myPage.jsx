import React from "react";
import { useAuth } from "../../store/authContext";
import BasicLayout from "../../layouts/basicLayout";

function MyPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <BasicLayout>
      <div>
        <h1>내 정보</h1>
        <p>닉네임: {user?.nickname || "정보 없음"}</p>
        <p>이메일: {user?.email || "정보 없음"}</p>
      </div>
    </BasicLayout>
  );
}

export default MyPage;
