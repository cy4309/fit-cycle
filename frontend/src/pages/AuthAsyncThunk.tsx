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
import Swal from "sweetalert2";

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
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [birth, setBirth] = useState("");

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
      dispatch(clearAuth());
    }
  }, [success, dispatch]);

  // 切換 login / register tab → 清除錯誤與 success
  const handleSwitchMode = (m: "login" | "register") => {
    setMode(m);
    dispatch(clearAuth());
  };

  // Email 格式驗證
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 生日格式驗證：YYYY-MM-DD 且為合法日期
  const isValidBirth = (birth: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(birth)) return false;

    const d = new Date(birth);
    // 無效日期會變成 Invalid Date
    if (Number.isNaN(d.getTime())) return false;

    // 再反向組裝一次比對，避免 2025-13-40 之類被 JS 自動進位
    const [y, m, day] = birth.split("-").map(Number);
    return (
      d.getFullYear() === y && d.getMonth() + 1 === m && d.getDate() === day
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuth());

    // ------- Register 模式 -------
    if (mode === "register") {
      if (!email.trim()) {
        return Swal.fire({
          icon: "error",
          title: "請輸入 Email",
          confirmButtonColor: "#ef4444",
        });
      }
      if (!isValidEmail(email)) {
        return Swal.fire({
          icon: "error",
          title: "Email 格式不正確",
          confirmButtonColor: "#ef4444",
        });
      }
      if (!height || Number(height) <= 0) {
        return Swal.fire({
          icon: "error",
          title: "請輸入正確的身高",
          confirmButtonColor: "#ef4444",
        });
      }
      if (!weight || Number(weight) <= 0) {
        return Swal.fire({
          icon: "error",
          title: "請輸入正確的體重",
          confirmButtonColor: "#ef4444",
        });
      }
      if (!birth.trim()) {
        return Swal.fire({
          icon: "error",
          title: "請選擇生日",
          confirmButtonColor: "#ef4444",
        });
      }
      // 生日格式 YYYY-MM-DD 檢查
      if (!isValidBirth(birth)) {
        return Swal.fire({
          icon: "error",
          title: "生日格式不正確",
          text: "請使用 YYYY-MM-DD",
          confirmButtonColor: "#ef4444",
        });
      }

      // ------- 全部 OK → 送出註冊 -------
      dispatch(
        registerAsync({
          username,
          password,
          email,
          height: Number(height),
          weight: Number(weight),
          birth,
        })
      );
      return;
    }

    // ------- Login 模式 -------
    dispatch(loginAsync({ username, password }));
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
        className="p-6 rounded-xl shadow-md flex flex-col gap-4 w-[320px] dark:bg-decoratedGray"
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
          className="border-b-2 p-2 rounded focus:ring focus:ring-blue-200 dark:bg-decoratedGray"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
          className="border-b-2 p-2 rounded focus:ring focus:ring-blue-200 dark:bg-decoratedGray"
        />
        {mode === "register" && (
          <>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              type="email"
              className="border-b-2 p-2 rounded focus:ring focus:ring-green-200 dark:bg-decoratedGray"
            />
            <input
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="height"
              type="text"
              className="border-b-2 p-2 rounded focus:ring focus:ring-green-200 dark:bg-decoratedGray"
            />
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="weight"
              type="text"
              className="border-b-2 p-2 rounded focus:ring focus:ring-green-200 dark:bg-decoratedGray"
            />
            {/* <input
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              placeholder="birth"
              type="date"
              className="border-b-2 p-2 rounded focus:ring focus:ring-green-200 dark:bg-decoratedGray"
            /> */}
            <input
              type="text"
              placeholder="birth(YYYY-MM-DD)"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              // onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="
                w-full
                border-b-2
                p-2
                rounded
                focus:ring focus:ring-green-200
                bg-secondary
                text-primary
                placeholder-slate-400
                dark:bg-decoratedGray
                dark:text-slate-100
                dark:placeholder-slate-400
              "
            />
          </>
        )}

        <BaseButton
          disabled={loading}
          className={`text-white mt-4 py-2 rounded ${
            mode === "login"
              ? "bg-blue-500 hover:!bg-blue-400"
              : "bg-green-500 hover:!bg-green-400"
          }`}
        >
          {loading ? "處理中..." : mode === "login" ? "登入" : "註冊"}
        </BaseButton>

        {success && (
          <p className="text-green-600 text-center text-sm">{success}</p>
        )}
      </form>
    </div>
  );
}
