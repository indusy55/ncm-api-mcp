import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import api, { setAccessToken } from "../api/client.js";

interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session via HttpOnly refreshToken cookie
  const restoreSession = useCallback(async () => {
    try {
      // refreshToken is sent automatically via HttpOnly cookie
      const res = await api.post("/auth/refresh");
      const { user: userData, accessToken } = res.data;
      setAccessToken(accessToken);
      setUser(userData);
    } catch {
      // No valid session — stay logged out
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const afterAuth = useCallback((userData: User, accessToken: string) => {
    setAccessToken(accessToken);
    setUser(userData);
  }, []);

  const login = useCallback(async (login: string, password: string) => {
    const res = await api.post("/auth/login", { login, password });
    const { user: userData, accessToken } = res.data;
    afterAuth(userData, accessToken);
  }, [afterAuth]);

  const register = useCallback(
    async (email: string, password: string, username: string) => {
      const res = await api.post("/auth/register", { email, password, username });
      const { user: userData, accessToken } = res.data;
      afterAuth(userData, accessToken);
    },
    [afterAuth],
  );

  const logout = useCallback(() => {
    api.post("/auth/logout").catch(() => {});
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
