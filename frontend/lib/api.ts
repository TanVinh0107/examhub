import axios from "axios";

// --- Tạo axios instance dùng chung ---
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: false, // Nếu bạn không dùng cookie thì giữ false
});

// --- Request Interceptor: tự động gắn Bearer token ---
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// --- Biến kiểm soát refresh ---
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

// --- Hàm xử lý các request chờ token refresh ---
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

// --- Response Interceptor: tự refresh token khi 401 ---
api.interceptors.response.use(
  (res) => res, // ✅ thành công => trả kết quả như bình thường
  async (error) => {
    const originalRequest = error.config;

    // ✅ Nếu 401 mà chưa retry -> xử lý refresh
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
        if (!refreshToken) throw new Error("No refresh token found");

        // ⚠️ Gọi refresh bằng axios “gốc” chứ không dùng instance `api`
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/auth/refresh`,
          { refreshToken }
        );

        const newToken = data.access_token;
        if (!newToken) throw new Error("No new access token returned");

        // ✅ Cập nhật token trong localStorage và header mặc định
        localStorage.setItem("access_token", newToken);
        api.defaults.headers.Authorization = `Bearer ${newToken}`;

        // ✅ Giải quyết tất cả request đang chờ
        processQueue(null, newToken);

        // ✅ Gắn token mới vào request gốc và retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        // ❌ Refresh thất bại => clear token & redirect login
        processQueue(err, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // ❌ Các lỗi khác giữ nguyên
    return Promise.reject(error);
  }
);
