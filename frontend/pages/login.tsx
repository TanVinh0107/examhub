import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";
import { api } from "../lib/api";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    name?: string;
    email: string;
    role?: string;
  };
}

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) router.replace("/dashboard");
  }, [router]);

  const onSubmit = async (data: any) => {
    setError(null);
    setLoading(true);

    try {
      const res = await api.post<LoginResponse>("/auth/login", data);
      const { access_token, refresh_token, user } = res.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400 || status === 401) {
          setError("Sai email hoặc mật khẩu, vui lòng thử lại.");
        } else {
          setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
        }
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm animate-fadeIn border border-gray-100"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Đăng nhập
        </h1>

        {error && (
          <div className="text-red-500 bg-red-50 border border-red-200 p-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <label className="block mb-2 text-sm text-gray-600">Email</label>
        <input
          {...register("email")}
          type="email"
          placeholder="Nhập email"
          required
          className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring focus:ring-blue-200"
        />

        <label className="block mb-2 text-sm text-gray-600">Mật khẩu</label>
        <input
          {...register("password")}
          type="password"
          placeholder="Nhập mật khẩu"
          required
          className="w-full border p-2 rounded mb-6 focus:outline-none focus:ring focus:ring-blue-200"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang xử lý...
            </>
          ) : (
            "Đăng nhập"
          )}
        </button>

        <div className="flex justify-between mt-4 text-sm">
          <a
            href="/forgot-password"
            className="text-blue-600 hover:underline font-medium"
          >
            Quên mật khẩu?
          </a>
          <a
            href="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Tạo tài khoản
          </a>
        </div>
      </form>
    </div>
  );
}
