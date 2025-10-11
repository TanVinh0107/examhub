import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      setLoading(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        data
      );

      const { access_token, refresh_token } = res.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Đăng ký
        </h1>

        {error && (
          <div className="text-red-500 bg-red-50 border border-red-200 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <label className="block mb-2 text-sm text-gray-600">Tên hiển thị</label>
        <input
          {...register("name")}
          type="text"
          placeholder="Tên của bạn"
          className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring focus:ring-blue-200"
        />

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
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Đã có tài khoản?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Đăng nhập
          </a>
        </p>
      </form>
    </div>
  );
}
