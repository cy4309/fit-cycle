/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // 啟用 class 模式
  theme: {
    extend: {
      colors: {
        primary: "#000",
        secondary: "#fff",
        decoratedGray: "#0f172a", //bg-slate-900
        decoratedRed: "#ef4444", //bg-red-500
        decoratedGreen: "#34d399", //bg-emerald-400
      },
    },
  },
  plugins: [],
};
