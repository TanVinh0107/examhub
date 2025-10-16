// lib/withAuth.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const AuthenticatedComponent = (props: P) => {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login"); // ⛔ Nếu chưa login thì chuyển về trang đăng nhập
      } else {
        setIsChecking(false); // ✅ Có token thì cho phép render trang
      }
    }, [router]);

    // 🚧 Tránh nhấp nháy khi đang kiểm tra
    if (isChecking) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <p className="text-gray-600 text-lg">Đang xác thực...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
}
