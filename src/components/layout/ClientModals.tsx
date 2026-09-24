"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";

const AuthModal = dynamic(
  () => import("@/features/auth/components/AuthModal").then((mod) => mod.AuthModal),
  { ssr: false },
);

const SearchModal = dynamic(
  () => import("@/components/ui/SearchModal").then((mod) => mod.SearchModal),
  { ssr: false },
);

export function ClientModals() {
  const { isAuthModalOpen } = useAuth();
  const [searchRequested, setSearchRequested] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const register = () => void navigator.serviceWorker.register("/sw.js");
    const idleId = window.requestIdleCallback?.(register, { timeout: 3_000 });
    if (idleId === undefined) {
      const timeoutId = window.setTimeout(register, 2_000);
      return () => window.clearTimeout(timeoutId);
    }
    return () => window.cancelIdleCallback?.(idleId);
  }, []);

  useEffect(() => {
    const openSearch = () => setSearchRequested(true);
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchRequested(true);
      }
    };

    window.addEventListener("toggle-search-modal", openSearch);
    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("toggle-search-modal", openSearch);
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  return (
    <>
      {isAuthModalOpen ? <AuthModal /> : null}
      {searchRequested ? <SearchModal /> : null}
    </>
  );
}
