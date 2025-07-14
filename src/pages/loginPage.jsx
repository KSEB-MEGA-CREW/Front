import { useState, useContext } from "react";
import { TestContext } from "../store/testContext";
import axios from "axios";

function LoginPage() {
  const { signin } = useContext(TestContext);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/login", {
        id,
        password: pw,
      });

      const { uid, nickname, token } = res.data;
      signin(uid, nickname, token);
      alert(`환영합니다, ${nickname}님!`); // 이 줄 추가
      window.location.href = "/"; // 메인화면 이동
    } catch {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-col items-center justify-center h-screen bg-gray-100"
    >
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">로그인</h2>
        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          로그인
        </button>
      </div>
    </form>
  );
}

export default LoginPage;
