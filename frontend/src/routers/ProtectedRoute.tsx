//* 保護頁面元件
//* 控制登入狀態存取權限。

// import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
// import { RootState } from "@/stores/store";
import { useAppSelector } from "@/utils/useRedux";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  // const queryToken = useSelector((s: RootState) => s.authQuery.accessToken);
  // const thunkToken = useSelector((s: RootState) => s.authThunk.accessToken);
  // const token = queryToken || thunkToken;

  // const user = useSelector((s: RootState) => s.authThunk.user);
  const user = useAppSelector((state) => state.authThunk);

  // console.log(
  //   "🧩 [STEP 4] ProtectedRoute 檢查 token:",
  //   token ? "存在 ✅" : "不存在 ❌"
  // );
  // return token ? children : <Navigate to="/auth" replace />;
  return user ? children : <Navigate to="/auth" replace />;
}
