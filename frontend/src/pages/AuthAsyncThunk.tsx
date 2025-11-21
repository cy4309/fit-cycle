import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginAsync,
  registerAsync,
} from "@/stores/features/rtkAsyncThunk/authThunk";
import { RootState, AppDispatch } from "@/stores/store";
import { useNavigate } from "react-router-dom";
// import { toggleAuthMode } from "@/stores/features/authModeSlice";
import { clearAuth } from "@/stores/features/rtkAsyncThunk/authSlice";
import BaseButton from "@/components/BaseButton";

export default function Auth() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  // const { loading, error } = useSelector((state: any) => state.auth);
  const { loading, error, success, user } = useSelector(
    (s: RootState) => s.authThunk
  );

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  // const rtkMode = useSelector((s: RootState) => s.authMode.mode);

  // ✅ 登入成功後導向首頁
  useEffect(() => {
    if (user && success === "LOGIN_OK") {
      console.log(user);
      dispatch(clearAuth());
      navigate("/");
    }
  }, [user, success, navigate, dispatch]);

  // 註冊成功 → 切回登入 tab
  useEffect(() => {
    if (success === "REGISTER_OK") {
      setMode("login");
      setLocalError(null);
      dispatch(clearAuth());
    }
  }, [success, dispatch]);

  // 切換 login / register tab → 清除錯誤與 success
  const handleSwitchMode = (m: "login" | "register") => {
    setMode(m);
    setLocalError(null);
    dispatch(clearAuth());
  };

  // Email 格式驗證
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearAuth());

    if (mode === "register") {
      if (!email) {
        setLocalError("請輸入 Email");
        return;
      }
      if (!isValidEmail(email)) {
        setLocalError("Email 格式不正確");
        return;
      }
      dispatch(registerAsync({ username, password, email }));
    } else {
      dispatch(loginAsync({ username, password }));
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center items-center">
      <div className="mb-4 flex justify-center items-center space-x-4">
        <img
          className="w-12 mx-auto"
          src="/fit-cycle-logo.png"
          alt="fitCycle"
        />
        <h1 className="font-bold">FIT CYCLE</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-xl shadow-md flex flex-col gap-4 w-[320px] dark:bg-primaryBlue"
      >
        <div className="flex gap-2 justify-around">
          {/* <button
            type="button"
            onClick={() => dispatch(toggleAuthMode())}
            className="absolute top-4 right-4 text-xs px-4 py-2 rounded-lg bg-white border border-black"
          >
            切換登入模式（目前：{rtkMode}）
          </button> */}

          <button
            type="button"
            onClick={() => handleSwitchMode("login")}
            className={`flex-1 py-2 text-center font-semibold ${
              mode === "login"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-400"
            }`}
          >
            登入
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode("register")}
            className={`flex-1 py-2 text-center font-semibold ${
              mode === "register"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-400"
            }`}
          >
            註冊
          </button>
        </div>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          className="border-b-2 p-2 rounded focus:ring focus:ring-blue-200 dark:bg-primaryBlue"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
          className="border-b-2 p-2 rounded focus:ring focus:ring-blue-200 dark:bg-primaryBlue"
        />
        {mode === "register" && (
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="documentElementail"
            type="email"
            className="border-b-2 p-2 rounded focus:ring focus:ring-green-200 dark:bg-primaryBlue"
          />
        )}

        <BaseButton
          disabled={loading}
          className={`text-white mt-4 py-2 rounded ${
            mode === "login"
              ? "bg-blue-500 hover:bg-blue-400"
              : "bg-green-500 hover:bg-green-400"
          }`}
        >
          {loading ? "處理中..." : mode === "login" ? "登入" : "註冊"}
        </BaseButton>

        {(localError || error) && (
          <p className="text-red-500 text-center text-sm">
            {localError || error}
          </p>
        )}

        {success && (
          <p className="text-green-600 text-center text-sm">{success}</p>
        )}
      </form>
    </div>
  );
}
