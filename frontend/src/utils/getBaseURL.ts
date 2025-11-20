export const getBaseURL = () => {
  // ✅ 如果跑在 Docker / Nginx (port 8082)
  // if (window.location.port === "8082") {
  if (import.meta.env.VITE_APP_ENV === "docker") {
    return "/api"; // → Nginx 會自動 proxy 到 backend:5000
  }
  // ✅ 如果是本地開發模式 (Vite 5173)
  if (import.meta.env.MODE === "development") {
    return "http://localhost:5000";
  }
  // ✅ 上線用
  return "https://jwt-rtk-practice-backend.onrender.com";
};
