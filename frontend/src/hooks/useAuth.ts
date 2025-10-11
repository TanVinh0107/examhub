import { useEffect } from "react";
import { useAtom } from "jotai";
import { authAtom } from "../store/authAtom";
import { AuthAPI } from "../lib/auth";

export function useAuth() {
  const [auth, setAuth] = useAtom(authAtom);

  const login = async (email: string, password: string) => {
    const res = await AuthAPI.login({ email, password });
    localStorage.setItem("access_token", res.data.access_token);
    setAuth({ user: await AuthAPI.me().then(r => r.data) });
  };

  const logout = async () => {
    await AuthAPI.logout();
    localStorage.removeItem("access_token");
    setAuth({ user: null });
  };

  useEffect(() => {
    AuthAPI.me().then(r => setAuth({ user: r.data })).catch(() => {});
  }, []);

  return { ...auth, login, logout };
}
