// lib/withAuth.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function isTokenExpired(token: string) {
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    return payload.exp && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  const AuthenticatedComponent = (props: P) => {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("access_token");
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.replace("/login", undefined, { shallow: true });
      } else {
        setIsChecking(false);
      }
    }, [router]);

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
