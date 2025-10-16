// components/Layout/Navbar.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface User {
  name?: string;
  email?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // ✅ Load user info từ localStorage khi mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  // ✅ Theo dõi sự thay đổi user từ localStorage (khi login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const updated = localStorage.getItem("user");
      setUser(updated ? JSON.parse(updated) : null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-600">
        Examhub
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/exams" className="text-gray-700 hover:text-blue-600">
          Đề thi
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-gray-700">
              👋 Xin chào,{" "}
              <strong>{user.name || user.email?.split("@")[0]}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
}
