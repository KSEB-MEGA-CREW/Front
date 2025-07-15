import { useState, useContext } from "react";
import { TestContext } from "../store/testContext";
import SignupButton from "../components/button/signupButton";
import axios from "axios";

function LoginPage() {
  const { signin } = useContext(TestContext);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!id.trim() || !pw.trim()) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/login", {
        id,
        password: pw,
      });

      if (!res.data || typeof res.data.ok === "undefined") {
        setError("서버 오류입니다. 관리자에게 문의해주세요.");
        return;
      }

      const { ok, uid, nickname, token } = res.data;

      if (ok) {
        signin(uid, nickname, token);
        window.location.href = "/";
      } else {
        setError("로그인에 실패했습니다.");
      }
    } catch {
      setError("아이디/비밀번호가 잘못되었습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">로그인</h2>
        <form onSubmit={handleLogin}>
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
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            로그인
          </button>
          <SignupButton />
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
