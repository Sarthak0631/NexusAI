"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@/services/api";

import { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const response = await getCurrentUser();

      setUser(response.user);
    } catch {
      setUser(null);
    }
  }

  async function register(
    name: string,
    email: string,
    password: string
  ) {
    await registerUser({
      name,
      email,
      password,
    });
  }

  async function login(
    email: string,
    password: string
  ) {
    const response = await loginUser({
      email,
      password,
    });

    setUser(response.user);
  }

  async function logout() {
    await logoutUser();
    setUser(null);
  }

  useEffect(() => {
    async function initializeAuth() {
      await refreshUser();
      setLoading(false);
    }

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}