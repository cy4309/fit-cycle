import axios from "axios";
import { getBaseURL } from "@/utils/getBaseURL";

const baseURL = getBaseURL();

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

// ✅ 可選：你之後可以加 interceptors 自動 refresh token
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // refresh token 流程（範例，可自行擴充）
      try {
        const refreshRes = await axiosInstance.post("/refresh");
        const newToken = refreshRes.data.accessToken;
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
