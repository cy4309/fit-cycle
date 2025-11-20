import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/services/rtkQuery/authApi";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "@/stores/features/rtkQuery/authSlice";
import { getBaseURL } from "@/utils/getBaseURL";
import { RootState } from "@/stores/store";
import { toggleAuthMode } from "@/stores/features/authModeSlice";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [serverWake, setServerWake] = useState(false);

  const [login, { isLoading: loggingIn }] = useLoginMutation();
  const [register, { isLoading: registering }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const baseURL = getBaseURL();
  const rtkMode = useSelector((s: RootState) => s.authMode.mode);

  // 預熱render
  useEffect(() => {
    fetch(`${baseURL}/health`).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setServerWake(true);

    if (!username || !password) {
      setMessage("請輸入帳號與密碼");
      return;
    }

    try {
      if (mode === "login") {
        console.log("📤 [STEP 3] 嘗試登入中...");
        const res = await login({ username, password }).unwrap();
        console.log("✅ [STEP 3] 後端回傳：", res);
        dispatch(setCredentials(res));
        console.log("💾 [STEP 3] 已寫入 Redux:", res);
        setMessage("登入成功！");
        navigate("/");
      } else {
        const res = await register({ username, password }).unwrap();
        setMessage(res.message || "註冊成功！請切換到登入頁登入。");
        setMode("login");
      }
    } catch (err: any) {
      console.error("❌ [STEP 3] 登入失敗:", err);
      setMessage(
        err?.data?.message || `${mode === "login" ? "登入" : "註冊"}失敗`
      );
    } finally {
      // setServerWake(false);
      setTimeout(() => setServerWake(false), 3000);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[340px]">
        {/* tab switch */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => dispatch(toggleAuthMode())}
            className="absolute top-4 right-4 text-xs px-4 py-2 rounded-lg bg-white border border-black"
          >
            切換登入模式（目前：{rtkMode}）
          </button>

          <button
            type="button"
            className={`flex-1 py-2 text-center font-semibold ${
              mode === "login"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-400"
            }`}
            onClick={() => setMode("login")}
          >
            登入
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-center font-semibold ${
              mode === "register"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-400"
            }`}
            onClick={() => setMode("register")}
          >
            註冊
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="帳號"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="密碼"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loggingIn || registering}
            className={`w-full text-white py-2 rounded transition ${
              mode === "login"
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {mode === "login"
              ? loggingIn
                ? "登入中..."
                : "登入"
              : registering
              ? "註冊中..."
              : "註冊"}
          </button>

          {/* ✅ 額外提示區塊 */}
          {serverWake && (loggingIn || registering) && (
            <p className="text-center text-sm text-gray-500 mt-2 animate-pulse">
              ☁️ 伺服器啟動中，請稍候...
            </p>
          )}

          {message && (
            <p
              className={`text-center text-sm ${
                message.includes("成功") ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
