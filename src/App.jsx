import React, { useState } from "react";
import axios from "axios"; // backend와의 연동을 위함

export default function App() {
  const [email, setEmail] = useState(""); // email 대신 아이디 받아요 username은 회원가입 시 입력받기!!!
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");



  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try{
      const response = await axios.post("/api/auth/login", {
        email: email,
        password: password,
      });

      // API 응답 구조에 맞춰서 데이터 추출
      const {success, data, message} = response.data;

      if(success){
        const {token, userInfo} = data;

        // localStorage 저장은 반드시 필요하진 않지만 JWT 특성상 사용하는 것이 권장된답니다
        localStorage.setItem("token", token);
        // UserInfo는 페이지 새로고침마다 api를 호출하지 않기 위해 성능상 localStorage에 저장합니다
        localStorage.setItem("userInfo", JSON.stringify(userInfo));

        // axios 기본 헤더에 토큰 설정
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // alert에서 그냥 id를 가져오는게 아니라 성공시 userInfo를 통해 데이터 가져오기
        alert(`${userInfo.name}님 로그인 성공!`);

        // mainpage 구현 완료되면, 로그인 성공한 상태로 redirect 함수 추가해주세요!!!
        // window.location.href = "/mainpage주소";
      } else{
        setError(message || "login failed");
      }
    } catch(err){
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (err.response?.status === 400) {
        setError("입력 정보를 확인해주세요.");
      } else if (err.response?.status === 500) {
        setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setError("로그인 중 오류가 발생했습니다.");
      }

      console.error("login error:", err);
    } finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-green-600">
          수담, 手談
        </h1>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "login..." : "login"}
          </button>
        </form>
      </div>
    </div>
  );
}
