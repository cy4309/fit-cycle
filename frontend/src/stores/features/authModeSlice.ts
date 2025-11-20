import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthMode = "query" | "thunk";

export interface AuthModeState {
  mode: AuthMode;
}

const initialState: AuthModeState = {
  mode: "thunk", // 預設用 thunk
};

const authModeSlice = createSlice({
  name: "authMode",
  initialState,
  reducers: {
    setAuthMode(state, action: PayloadAction<AuthMode>) {
      state.mode = action.payload;
    },
    toggleAuthMode(state) {
      state.mode = state.mode === "query" ? "thunk" : "query";
    },
  },
});

export const { setAuthMode, toggleAuthMode } = authModeSlice.actions;
export default authModeSlice.reducer;
