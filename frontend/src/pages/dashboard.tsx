import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";

interface User {
  userId: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Hàm đăng xuất
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.push("/login");
    }
  };

  // ✅ Gọi API /auth/me khi trang load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err: any) {
        console.error("Auth failed:", err.response?.data || err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Đang tải thông tin...</p>
      </div>
    );

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Không tìm thấy người dùng.</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-700">Xin chào 👋</h1>
        <p className="text-gray-600 mb-2">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-gray-600 mb-6">
          <strong>Vai trò:</strong> {user.role}
        </p>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
