"use client";

import dynamic from "next/dynamic";

const AuthModal = dynamic(
  () => import("@/features/auth/components/AuthModal").then((mod) => mod.AuthModal),
  { ssr: false }
);

const SearchModal = dynamic(
  () => import("@/components/ui/SearchModal").then((mod) => mod.SearchModal),
  { ssr: false }
);

export function ClientModals() {
  return (
    <>
      <AuthModal />
      <SearchModal />
    </>
  );
}
