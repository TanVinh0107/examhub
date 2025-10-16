// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";
import { withAuth } from "../lib/withAuth";
import Navbar from "@/components/Layout/Navbar";

interface User {
  id?: string;
  email: string;
  name?: string;
  role?: string;
}

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Gọi /auth/me hoặc lấy từ localStorage nếu có
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          setUser(JSON.parse(stored));
          setLoading(false);
          return;
        }

        const res = await api.get("/auth/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.error("❌ Auth failed:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Đang tải thông tin...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">Không tìm thấy người dùng.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center w-full max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            👋 Xin chào {user.name || user.email.split("@")[0]}
          </h1>
          <p className="text-gray-600 mb-2">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-gray-600 mb-6">
            <strong>Vai trò:</strong> {user.role || "Sinh viên"}
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);
