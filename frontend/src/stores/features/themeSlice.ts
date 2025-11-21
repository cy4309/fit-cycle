import { createSlice } from "@reduxjs/toolkit";

type ThemeState = {
  mode: "light" | "dark";
};

// 讀 localStorage
const stored = (localStorage.getItem("theme") as "light" | "dark") || null;
// 若 localStorage 沒存 → 用系統偏好
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// const initialState: ThemeState = {
//   mode: "light",
// };

const initialState: ThemeState = {
  mode: stored ?? (prefersDark ? "dark" : "light"),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      // state.mode = state.mode === "light" ? "dark" : "light";
      const newMode = state.mode === "light" ? "dark" : "light";
      // 更新 state
      state.mode = newMode;
      // 寫入 localStorage
      localStorage.setItem("theme", newMode);
      // 更新 HTML class
      document.documentElement.classList.toggle("dark", newMode === "dark");
    },
    setTheme: (state, action) => {
      const newMode = action.payload;
      state.mode = newMode;

      localStorage.setItem("theme", newMode);
      document.documentElement.classList.toggle("dark", newMode === "dark");
    },
  },
});

// 初始化時就同步到 HTML
document.documentElement.classList.toggle("dark", initialState.mode === "dark");

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
