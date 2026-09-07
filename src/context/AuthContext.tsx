"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, otpSendSchema, otpVerifySchema } from "@/lib/validations/auth";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  // Modal & Step state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<"login" | "otp">("login");
  const [pendingPhone, setPendingPhone] = useState<string>("");

  // Pre-hydration fast-path check on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuthFastPath() {
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Cache control for fast path
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setUser(data.user || null);
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Failed fast-path /api/me check:", err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuthFastPath();

    return () => {
      isMounted = false;
    };
  }, []);

  const openAuthModal = useCallback((step: "login" | "otp" = "login") => {
    setError(null);
    setToastMessage(null);
    setToastType(null);
    setAuthStep(step);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setError(null);
    setToastMessage(null);
    setToastType(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
    setToastType(null);
  }, []);

  const login = useCallback(async (rawPhone: string): Promise<boolean> => {
    setError(null);
    setToastMessage(null);
    setToastType(null);
    setIsLoading(true);

    try {
      const validation = otpSendSchema.safeParse({ phone: rawPhone, purpose: "login" });
      if (!validation.success) {
        const errMsg = validation.error.errors[0]?.message || "Noto'g'ri telefon raqami";
        setError(errMsg);
        setToastMessage(errMsg);
        setToastType("error");
        setIsLoading(false);
        return false;
      }

      const formattedPhone = validation.data.phone;

      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, purpose: "login" }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errMsg = data.error || "SMS yuborishda xatolik yuz berdi";
        setError(errMsg);
        setToastMessage(errMsg);
        setToastType("error");
        setIsLoading(false);
        return false;
      }

      setPendingPhone(formattedPhone);
      if (data.devCode) {
        setDevCode(data.devCode);
      }
      const successMsg = data.message || "SMS tasdiqlash kodi telefoningizga yuborildi";
      setToastMessage(successMsg);
      setToastType("success");
      setAuthStep("otp");
      setIsLoading(false);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tizim xatoligi";
      setError(msg);
      setToastMessage(msg);
      setToastType("error");
      setIsLoading(false);
      return false;
    }
  }, []);

  const verifyOtp = useCallback(
    async (code: string): Promise<boolean> => {
      setError(null);
      setToastMessage(null);
      setToastType(null);
      setIsLoading(true);

      try {
        const validation = otpVerifySchema.safeParse({
          phone: pendingPhone,
          code,
          purpose: "login",
        });

        if (!validation.success) {
          const errMsg = validation.error.errors[0]?.message || "Noto'g'ri tasdiqlash kodi";
          setError(errMsg);
          setToastMessage(errMsg);
          setToastType("error");
          setIsLoading(false);
          return false;
        }

        const response = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: validation.data.phone,
            code: validation.data.code,
            purpose: "login",
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          const errMsg = data.error || "Kod noto'g'ri kiritildi";
          setError(errMsg);
          setToastMessage(errMsg);
          setToastType("error");
          setIsLoading(false);
          return false;
        }

        setUser(data.user);
        setToastMessage("Tizimga muvaffaqiyatli kirdingiz!");
        setToastType("success");
        setIsAuthModalOpen(false);
        setPendingPhone("");
        setDevCode(null);
        setAuthStep("login");
        setIsLoading(false);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Kodni tasdiqlashda xatolik";
        setError(msg);
        setToastMessage(msg);
        setToastType("error");
        setIsLoading(false);
        return false;
      }
    },
    [pendingPhone]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setIsLoading(false);
      setIsAuthModalOpen(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        toastMessage,
        toastType,
        devCode,
        isAuthModalOpen,
        authStep,
        pendingPhone,
        login,
        verifyOtp,
        logout,
        openAuthModal,
        closeAuthModal,
        clearError,
        clearToast,
        setAuthStep,
        setPendingPhone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
