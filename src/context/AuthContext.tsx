"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { otpSendSchema, otpVerifySchema, userSchema, type User } from "@/lib/validations/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  toastMessage: string | null;
  toastType: "success" | "error" | null;
  devCode: string | null;
  isAuthModalOpen: boolean;
  authStep: "login" | "otp";
  pendingPhone: string;
  login: (phone: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  openAuthModal: (step?: "login" | "otp") => void;
  closeAuthModal: () => void;
  clearError: () => void;
  clearToast: () => void;
  setAuthStep: (step: "login" | "otp") => void;
  setPendingPhone: (phone: string) => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isInternalRedirect(path: string | null): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\"));
}

function errorMessage(value: unknown, fallback: string) {
  if (value && typeof value === "object" && "error" in value && typeof value.error === "string") {
    return value.error;
  }
  return fallback;
}

export function AuthProvider({ children, initialUser = null }: { children: React.ReactNode; initialUser?: User | null }) {
  const router = useRouter();
  const loginRedirect = useRef<string | null>(null);
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState<"login" | "otp">("login");
  const [pendingPhone, setPendingPhone] = useState("");

  const clearMessages = useCallback(() => {
    setError(null);
    setToastMessage(null);
    setToastType(null);
  }, []);

  const openAuthModal = useCallback((step: "login" | "otp" = "login") => {
    clearMessages();
    setAuthStep(step);
    setIsAuthModalOpen(true);
  }, [clearMessages]);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    clearMessages();
    const redirect = loginRedirect.current;
    loginRedirect.current = null;
    if (redirect) router.replace(redirect);
  }, [clearMessages, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (params.get("auth") === "1" && isInternalRedirect(redirect)) {
      loginRedirect.current = redirect;
      openAuthModal("login");
    }
  }, [openAuthModal]);

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/me", { cache: "no-store" });
      const data: unknown = await response.json();
      if (!response.ok || !data || typeof data !== "object" || !("user" in data)) {
        setUser(null);
        return;
      }
      const parsed = userSchema.safeParse(data.user);
      setUser(parsed.success ? parsed.data : null);
    } catch (error: unknown) {
      console.error("Failed fast-path /api/me check:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const login = useCallback(async (rawPhone: string) => {
    clearMessages();
    setIsLoading(true);
    const validation = otpSendSchema.safeParse({ phone: rawPhone, purpose: "login" });
    if (!validation.success) {
      const message = validation.error.errors[0]?.message ?? "Noto'g'ri telefon raqami";
      setError(message); setToastMessage(message); setToastType("error"); setIsLoading(false);
      return false;
    }
    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: validation.data.phone, purpose: "login" }),
      });
      const data: unknown = await response.json();
      if (!response.ok || !data || typeof data !== "object" || !("success" in data) || data.success !== true) {
        const message = errorMessage(data, "SMS yuborishda xatolik yuz berdi");
        setError(message); setToastMessage(message); setToastType("error"); setIsLoading(false);
        return false;
      }
      const result = data as { message?: string; devCode?: string };
      setPendingPhone(validation.data.phone);
      if (result.devCode) setDevCode(result.devCode);
      const message = result.message ?? "SMS tasdiqlash kodi telefoningizga yuborildi";
      setToastMessage(message); setToastType("success"); setAuthStep("otp"); setIsLoading(false);
      return true;
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : "Tizim xatoligi";
      setError(message); setToastMessage(message); setToastType("error"); setIsLoading(false);
      return false;
    }
  }, [clearMessages]);

  const verifyOtp = useCallback(async (code: string) => {
    clearMessages();
    setIsLoading(true);
    const validation = otpVerifySchema.safeParse({ phone: pendingPhone, code, purpose: "login" });
    if (!validation.success) {
      const message = validation.error.errors[0]?.message ?? "Noto'g'ri tasdiqlash kodi";
      setError(message); setToastMessage(message); setToastType("error"); setIsLoading(false);
      return false;
    }
    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: validation.data.phone, code: validation.data.code, purpose: "login" }),
      });
      const data: unknown = await response.json();
      if (!response.ok || !data || typeof data !== "object" || !("success" in data) || data.success !== true) {
        const message = errorMessage(data, "Kod noto'g'ri kiritildi");
        setError(message); setToastMessage(message); setToastType("error"); setIsLoading(false);
        return false;
      }
      setUser((data as unknown as { user: User }).user);
      setToastMessage("Tizimga muvaffaqiyatli kirdingiz!"); setToastType("success");
      setIsAuthModalOpen(false); setPendingPhone(""); setDevCode(null); setAuthStep("login"); setIsLoading(false);
      if (loginRedirect.current) {
        const redirect = loginRedirect.current;
        loginRedirect.current = null;
        router.replace(redirect);
      }
      return true;
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : "Kodni tasdiqlashda xatolik";
      setError(message); setToastMessage(message); setToastType("error"); setIsLoading(false);
      return false;
    }
  }, [clearMessages, pendingPhone, router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); }
    catch (error: unknown) { console.error("Logout error:", error); }
    finally { setUser(null); setIsLoading(false); setIsAuthModalOpen(false); }
  }, []);

  return <AuthContext.Provider value={{ user, isLoading, error, toastMessage, toastType, devCode,
    isAuthModalOpen, authStep, pendingPhone, login, verifyOtp, logout, openAuthModal, closeAuthModal,
    clearError: () => setError(null), clearToast: () => { setToastMessage(null); setToastType(null); },
    setAuthStep, setPendingPhone, refreshAuth }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
