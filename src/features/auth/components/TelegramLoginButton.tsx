"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";
import {
  getBotName,
  getTelegramErrorMessage,
  mapTelegramData,
} from "./telegram-helpers";
import type { TelegramUser } from "./telegram-helpers";

export { getBotName, getTelegramErrorMessage, mapTelegramData } from "./telegram-helpers";
export type { TelegramAuthData, TelegramUser } from "./telegram-helpers";

interface TelegramLoginButtonProps {
  onSuccess?: (user: TelegramUser) => void;
  onError?: (message: string) => void;
}

type Status = "idle" | "loading" | "success" | "error";

declare global {
  interface Window {
    onTelegramAuth?: (user: unknown) => void;
  }
}

export function TelegramLoginButton({ onSuccess, onError }: TelegramLoginButtonProps) {
  const botName = getBotName();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const fail = useCallback((message: string) => {
    setStatus("error");
    setErrorMsg(message);
    onErrorRef.current?.(message);
  }, []);

  const handleAuth = useCallback(
    async (raw: unknown) => {
      const data = mapTelegramData(raw);
      if (!data) {
        fail("Telegram ma'lumotlari noto'g'ri. Qaytadan urinib ko'ring.");
        return;
      }
      setStatus("loading");
      setErrorMsg(null);
      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          fail(getTelegramErrorMessage(res.status));
          return;
        }
        const json = (await res.json()) as {
          user?: { id: number; firstName: string; username?: string };
        };
        setStatus("success");
        const user: TelegramUser = {
          id: json.user?.id ?? data.id,
          firstName: json.user?.firstName ?? data.first_name,
          username: json.user?.username ?? data.username,
        };
        if (onSuccessRef.current) {
          onSuccessRef.current(user);
        } else {
          window.location.reload();
        }
      } catch {
        fail("Tarmoq xatosi. Internetni tekshirib, qaytadan urinib ko'ring.");
      }
    },
    [fail]
  );

  useEffect(() => {
    if (!botName || !containerRef.current) return;
    window.onTelegramAuth = (user: unknown) => {
      void handleAuth(user);
    };
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);
    return () => {
      delete window.onTelegramAuth;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [botName, handleAuth]);

  if (!botName) {
    return (
      <div
        role="note"
        aria-label="Telegram kirish vaqtincha o'chirilgan"
        className="w-full h-12 rounded-md bg-telegram-soft border border-telegram/20 flex items-center justify-center gap-2 text-sm font-medium text-ink-muted"
      >
        <Send className="w-5 h-5 text-telegram" aria-hidden="true" />
        <span>Telegram kirish vaqtincha o'chirilgan</span>
      </div>
    );
  }

  const loading = status === "loading";

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full min-h-12 flex items-center justify-center rounded-md bg-telegram-soft border border-telegram/20"
      />
      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-ink-muted">
        <Send className="w-3.5 h-3.5 text-telegram" aria-hidden="true" />
        <span>Telegram tugmasi yuklanmasa — internetni tekshiring</span>
      </div>
      {loading && (
        <p role="status" className="mt-2 flex items-center justify-center gap-2 text-sm text-ink-muted">
          <Loader2 className="w-4 h-4 animate-spin text-telegram" aria-hidden="true" />
          Tekshirilmoqda...
        </p>
      )}
      {status === "error" && errorMsg && (
        <div
          role="alert"
          className="mt-2 flex items-start gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setErrorMsg(null);
            }}
            className="ml-auto underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-telegram rounded"
          >
            Yopish
          </button>
        </div>
      )}
      {status === "success" && (
        <p role="status" className="mt-2 text-center text-sm font-medium text-success">
          Muvaffaqiyatli kirildi. Sahifa yangilanmoqda...
        </p>
      )}
    </div>
  );
}
