//* 全域 Axios 設定與攔截器邏輯，在 request 攔截器中自動附上 access token，在 response 攔截器中自動 refresh token
//* 可視為「應用層安全邏輯」。
//* 上線後端還是要部在render，因為serverless function沒辦法持久化記憶體，也就是無法真的註冊

import axios from "axios";
import type { AppStore } from "@/stores/store";
import { setCredentials, logOut } from "@/stores/features/rtkQuery/authSlice";
import { getBaseURL } from "@/utils/getBaseURL";

const baseURL = getBaseURL();

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // 讓 cookie 自動帶上
});

// let store: any; // 等等由 api.ts 注入 redux store
let store: AppStore;

// --- 攔截器：在發送請求前附上 Access Token ---
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store?.getState();
    // const token = state?.auth?.accessToken;
    const token = state?.authQuery?.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 攔截器：如果 Access Token 過期，自動 refresh ---
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 如果是 401，且還沒重試過 → 試著 refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("⚠️ [STEP 5] Access Token 失效，嘗試自動 refresh...");
      originalRequest._retry = true;

      try {
        const res = await axiosInstance.post("/refresh");
        console.log(
          "✅ [STEP 5] Refresh 成功，新的 Access Token:",
          res.data.accessToken.slice(0, 20) + "..."
        );
        const newAccessToken = res.data.accessToken;

        // 更新 Redux store
        // store.dispatch({
        //   type: "auth/setCredentials",
        //   payload: {
        //     user: store.getState().auth.user,
        //     accessToken: newAccessToken,
        //   },
        // });
        // 更新 Redux 狀態
        store.dispatch(
          setCredentials({
            user: store.getState().authQuery.user!,
            accessToken: newAccessToken,
          })
        );

        // 更新原請求 header 並重試
        console.log("💾 [STEP 5] Redux 已更新為新的 token");
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log("❌ [STEP 5] Refresh 失敗，執行登出");
        // store.dispatch({ type: "auth/logOut" });
        store.dispatch(logOut());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// 提供外部注入 store
export const injectStore = (_store: any) => {
  store = _store;
};
