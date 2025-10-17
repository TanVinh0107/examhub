// src/lib/api.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";

// ✅ Tạo axios instance chung
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: false, // Đặt true nếu dùng cookie-based auth
});

// ✅ Request Interceptor: tự động gắn Bearer token
api.interceptors.request.use((config: any) => {

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["X-Requested-With"] = "XMLHttpRequest";
    }
  }
  return config;
});

// --- Biến kiểm soát refresh ---
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

// --- Hàm xử lý các request chờ refresh ---
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

// ✅ Response Interceptor: tự động refresh khi 401
api.interceptors.response.use(
  (response) => response, // thành công -> trả kết quả luôn
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // ❌ Nếu 401 và chưa retry -> xử lý refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh thì xếp request vào hàng chờ
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("Không có refresh token");

        // ⚠️ Dùng axios gốc để refresh, tránh loop interceptor
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/auth/refresh`,
          { refreshToken }
        );

        const newToken = data.access_token;
        if (!newToken) throw new Error("Không nhận được access token mới");

        // ✅ Lưu token mới và gắn header mặc định
        localStorage.setItem("access_token", newToken);
        api.defaults.headers.Authorization = `Bearer ${newToken}`;

        // ✅ Giải quyết tất cả request chờ
        processQueue(null, newToken);

        // ✅ Retry request gốc
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        // ❌ Refresh thất bại -> xoá token & redirect
        processQueue(err, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // ❌ Lỗi khác giữ nguyên
    return Promise.reject(error);
  }
);
