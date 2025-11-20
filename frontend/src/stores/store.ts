//* Redux Store 設定主檔
//* 負責整合 RTK Query、AsyncThunk、Theme 並與 axios 連動。

import { configureStore } from "@reduxjs/toolkit";

// ---- RTK Query 系統 ----
import { api, setupAxiosInterceptors } from "@/services/rtkQuery/api";
import authQueryReducer from "@/stores/features/rtkQuery/authSlice";

// ---- RTK AsyncThunk 系統 ----
import authThunkReducer from "@/stores/features/rtkAsyncThunk/authSlice";

// ---- 共用 Slice ----
import themeReducer from "@/stores/features/themeSlice";
import authModeReducer from "@/stores/features/authModeSlice";

// ---- 建立 Redux Store ----
export const setupStore = () =>
  configureStore({
    reducer: {
      // RTK Query service reducer
      [api.reducerPath]: api.reducer,

      // 各模組 Reducer
      authMode: authModeReducer,
      authQuery: authQueryReducer, // RTK Query 版本
      authThunk: authThunkReducer, // RTK AsyncThunk 版本
      theme: themeReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });

// ---- 產生 store instance ----
export const store = setupStore();

// ---- 設定 axios interceptors (for RTK Query axiosInstance) ----
setupAxiosInterceptors(store);

// ---- 型別推導 ----
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof setupStore>;
