"use client";

import { AlertCircle, Loader2, Send } from "lucide-react";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { TelegramAuthFlow } from "./TelegramAuthFlow";
import { getBotName, getTelegramErrorMessage, mapTelegramData } from "./telegram-helpers";
import type { TelegramUser } from "./telegram-helpers";

export { getBotName, getTelegramErrorMessage, mapTelegramData } from "./telegram-helpers";
export type { TelegramAuthData, TelegramUser } from "./telegram-helpers";

interface TelegramLoginButtonProps {
  onSuccess?: (user: TelegramUser) => void;
  onError?: (message: string) => void;
}

type Status = "idle" | "loading" | "success" | "error" | "phoneRequired";

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

  const handleAuth = useCallback(async (raw: unknown) => {
    const data = mapTelegramData(raw);
    if (!data) {
      fail("Telegram ma'lumotlari noto'g'ri. Qaytadan urinib ko'ring.");
      return;
    }

    setStatus("loading");
    setErrorMsg(null);
    try {
      const response = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        if (response.status === 422) { setStatus("phoneRequired"); return; }
        let serverMessage: string | null = null;
        try {
          const errorJson = (await response.json()) as { error?: unknown };
          if (typeof errorJson.error === "string" && errorJson.error.length > 0) serverMessage = errorJson.error;
        } catch {
          serverMessage = null;
        }
        fail(serverMessage ?? getTelegramErrorMessage(response.status));
        return;
      }
      const json = (await response.json()) as { user?: { id: number; firstName: string; username?: string } };
      setStatus("success");
      const user: TelegramUser = {
        id: json.user?.id ?? data.id,
        firstName: json.user?.firstName ?? data.first_name,
        username: json.user?.username ?? data.username,
      };
      if (onSuccessRef.current) onSuccessRef.current(user);
      else window.location.reload();
    } catch {
      fail("Tarmoq xatosi. Internetni tekshirib, qaytadan urinib ko'ring.");
    }
  }, [fail]);

  useEffect(() => {
    const container = containerRef.current;
    if (!botName || !container) return;

    const callback = (user: unknown) => { void handleAuth(user); };
    window.onTelegramAuth = callback;
    container.replaceChildren();

    return () => {
      if (window.onTelegramAuth === callback) delete window.onTelegramAuth;
      container.replaceChildren();
    };
  }, [botName, handleAuth]);

  if (status === "phoneRequired") return <TelegramAuthFlow />;

  if (!botName) {
    return (
      <div role="note" aria-label="Telegram kirish vaqtincha o'chirilgan" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-telegram/30 bg-telegram-soft text-sm font-medium text-ink-muted">
        <Send className="h-5 w-5 text-telegram" aria-hidden="true" />
        <span>Telegram kirish vaqtincha o&apos;chirilgan</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={containerRef} className="flex min-h-12 w-full items-center justify-center rounded-md border border-telegram/30 bg-telegram-soft" aria-label="Telegram orqali kirish">
        <Script
          id="telegram-login-widget"
          src="https://telegram.org/js/telegram-widget.js?22"
          strategy="afterInteractive"
          data-telegram-login={botName}
          data-size="large"
          data-onauth="onTelegramAuth(user)"
          data-request-access="write"
        />
      </div>
      <p className="mt-2 flex items-center justify-center gap-2 text-center text-xs text-ink-muted">
        <Send className="h-3.5 w-3.5 shrink-0 text-telegram" aria-hidden="true" />
        <span>Telegram tugmasi yuklanmasa — internetni tekshiring</span>
      </p>
      {status === "loading" && <p role="status" aria-live="polite" className="mt-2 flex items-center justify-center gap-2 text-sm text-ink-muted"><Loader2 className="h-4 w-4 animate-spin text-telegram" aria-hidden="true" />Tekshirilmoqda...</p>}
      {status === "error" && errorMsg && (
        <div role="alert" className="mt-2 flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft p-3 text-sm font-medium text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
          <button type="button" onClick={() => { setStatus("idle"); setErrorMsg(null); }} className="ml-auto min-h-11 rounded-md px-1 underline underline-offset-2 hover:no-underline">Yopish</button>
        </div>
      )}
      {status === "success" && <p role="status" aria-live="polite" className="mt-2 text-center text-sm font-medium text-success">Muvaffaqiyatli kirildi. Sahifa yangilanmoqda...</p>}
    </div>
  );
}
