import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { api } from "../lib/api";

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Nếu đã login thì không cho vào trang register
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) router.replace("/dashboard");
  }, [router]);

  const onSubmit = async (data: any) => {
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      await api.post("/auth/register", data);

      // ✅ Hiển thị thông báo thành công và chuyển hướng sau 3 giây
      setSuccess(true);
      setTimeout(() => {
        router.push("/login?registered=1");
      }, 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400 || status === 409)
          setError("Email đã tồn tại hoặc dữ liệu không hợp lệ.");
        else setError("Không thể đăng ký. Vui lòng thử lại sau.");
      } else setError("Đã xảy ra lỗi không xác định.");
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
        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
          Đăng ký tài khoản
        </h1>

        {success && (
          <div className="text-green-600 bg-green-50 border border-green-200 p-2 rounded mb-4 text-sm text-center">
            🎉 Tạo tài khoản thành công!<br />
            Đang chuyển sang trang đăng nhập...
          </div>
        )}

        {error && !success && (
          <div className="text-red-500 bg-red-50 border border-red-200 p-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {!success && (
          <>
            <label className="block mb-2 text-sm text-gray-600">Tên hiển thị</label>
            <input
              {...register("name")}
              type="text"
              placeholder="Tên của bạn"
              required
              className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring focus:ring-green-200"
            />

            <label className="block mb-2 text-sm text-gray-600">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="Nhập email"
              required
              className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring focus:ring-green-200"
            />

            <label className="block mb-2 text-sm text-gray-600">Mật khẩu</label>
            <input
              {...register("password")}
              type="password"
              placeholder="Nhập mật khẩu"
              required
              className="w-full border p-2 rounded mb-6 focus:outline-none focus:ring focus:ring-green-200"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang đăng ký...
                </>
              ) : (
                "Đăng ký"
              )}
            </button>
          </>
        )}

        {!success && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}
