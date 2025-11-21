import { createSlice } from "@reduxjs/toolkit";
import {
  loginAsync,
  registerAsync,
  // logoutAsync,
} from "./authThunk";

export interface AuthState {
  user: {
    userId?: string | number;
    username: string;
    email?: string;
  } | null;
  loading: boolean;
  success: string | null;
  error: string | null;
}

const initialState: AuthState = {
  user: {
    userId: 0,
    username: "",
    email: "",
  },
  loading: false,
  success: null,
  error: null,
};

// export interface AuthState {
//   user: { username: string } | null;
//   accessToken: string | null;
//   loading: boolean;
//   success: string | null;
//   error: string | null;
// }

// const initialState: AuthState = {
//   user: null,
//   accessToken: null,
//   loading: false,
//   success: null,
//   error: null,
// };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.error = null;
      state.success = null;
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.success = null;
      state.error = null;
      localStorage.removeItem("fc_user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload?.error) {
          state.loading = false;
          state.user = null;
          state.success = null;
          state.error = action.payload.error;
          return; // 重要！
        }

        if (action.payload.userId) {
          const userData = {
            userId: action.payload.userId,
            username: action.payload.username,
            email: action.payload.email,
          };

          state.user = userData;
          state.success = "LOGIN_OK";

          // ⭐ 存到 localStorage
          localStorage.setItem("fc_user", JSON.stringify(userData));
        } else {
          state.error = JSON.stringify(action.payload);
          state.user = null;
        }
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.success = null;
        // state.error = action.payload as string;
        // 有時 action.payload 是物件，要統一轉成字串
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : JSON.stringify(action.payload);
      })
      // // 註冊
      // .addCase(registerAsync.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.error) {
          state.loading = false;
          state.user = null;
          state.success = null;
          state.error = action.payload.error;
          return;
        }

        state.user = {
          userId: action.payload.userId,
          username: action.payload.username,
          email: action.payload.email,
        };
        state.success = "REGISTER_OK";
      });
    // .addCase(registerAsync.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload as string;
    //   state.success = null;
    // })
    // // 登出
    // .addCase(logoutAsync.fulfilled, (state) => {
    //   state.user = null;
    //   state.accessToken = null;
    //   state.success = null;
    // })
  },
});

export const { clearAuth, logout } = authSlice.actions;
export default authSlice.reducer;
