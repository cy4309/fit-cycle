// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "@/stores/store";
// import { logOut } from "@/stores/features/rtkQuery/authSlice";
// import { useLogoutMutation } from "@/services/rtkQuery/authApi";
import { useNavigate } from "react-router-dom";
import ThemeButton from "@/components/ThemeButton";
import BaseButton from "@/components/BaseButton";
// import { logOut as logOutQuery } from "@/stores/features/rtkQuery/authSlice";
import { Power } from "lucide-react";
import { logout } from "@/stores/features/rtkAsyncThunk/authSlice";
import { useAppDispatch, useAppSelector } from "@/utils/useRedux";

const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // const user = useSelector((state: RootState) => state.auth.user);
  // const queryUser = useSelector((s: RootState) => s.authQuery.user);
  // const thunkUser = useSelector((s: RootState) => s.authThunk.user);
  // const [logoutApi] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.authThunk);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth"); // 或你自己的登入頁
  };

  // const handleLogout = async () => {
  //   console.log("📤 [STEP 6] 執行登出中...");
  //   try {
  //     const res = await logoutApi().unwrap(); // 清除 cookie
  //     console.log("✅ [STEP 6] 後端回傳:", res);
  //   } catch (err) {
  //     console.error("❌ [STEP 6] 登出 API 失敗:", err);
  //     console.error("Logout failed:", err);
  //   } finally {
  //     // dispatch(logOutQuery());
  //     console.log("💾 [STEP 6] Redux 已清除登入資訊");
  //     navigate("/auth");
  //   }
  // };

  return (
    <div className="p-4 mx-auto max-w-6xl min-h-[100dvh] flex flex-col bg-secondary dark:bg-primary text-primary dark:text-secondary">
      <header className="sticky top-0 z-50 p-4 shadow flex justify-between items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-secondary dark:bg-primary">
        <h1 className="text-xl font-bold">
          {user?.username}'s Daily Macro Tracker
          <br />
          {/* <p className="text-sm text-slate-400">紀錄每日運動與飲食。</p> */}
          <p className="text-sm text-slate-400">
            熱量: 低-1600~1700, 中-1800~2000, 高-2000~2100
          </p>
          <p className="text-sm text-slate-400">
            碳水: 低-106.5, 中-177.5, 高-284
          </p>
          <p className="text-sm text-slate-400">
            脂肪: 高-56.8, 中-35.5, 低-28.4
          </p>
          <p className="text-sm text-slate-400">蛋白質: 100~152</p>
        </h1>
        <div className="flex justify-center items-center space-x-4">
          <ThemeButton />
          <BaseButton
            onClick={handleLogout}
            className="px-2 py-2 transition font-bold bg-red-500 hover:!bg-red-400"
          >
            <Power size={16} />
          </BaseButton>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="p-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Fit Cycle
      </footer>
    </div>
  );
};

export default BaseLayout;
