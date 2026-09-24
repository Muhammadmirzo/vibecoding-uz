"use client";

import { Loader2, Send, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  telegramStartResponseSchema,
  telegramStatusResponseSchema,
  type telegramPublicUserSchema,
} from "@/lib/validations/auth";
import { TelegramQr } from "./TelegramQr";
import { z } from "zod";

type FlowState = "idle" | "starting" | "waiting" | "success" | "error" | "timeout";
type PublicUser = z.infer<typeof telegramPublicUserSchema>;

interface LoginAttempt {
  id: string;
  deepLink: string;
  expiresAt: number;
}

const PHONE_FALLBACK_MESSAGE = "Telegram orqali kirish vaqtincha ishlamayapti — telefon raqami orqali davom eting";
const BACKOFF_MS = [2_000, 3_000, 5_000] as const;

async function readJson(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function focusPhoneInput(): void {
  window.requestAnimationFrame(() => document.getElementById("phone-input")?.focus());
}

export function TelegramAuthFlow() {
  const { closeAuthModal, refreshAuth } = useAuth();
  const [state, setState] = useState<FlowState>("idle");
  const [attempt, setAttempt] = useState<LoginAttempt | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [seconds, setSeconds] = useState(0);
  const requestControllerRef = useRef<AbortController | null>(null);
  const attemptNumberRef = useRef(0);

  useEffect(() => () => requestControllerRef.current?.abort(), []);

  const showPhoneFallback = useCallback(() => {
    setMessage(PHONE_FALLBACK_MESSAGE);
    setState("error");
    focusPhoneInput();
  }, []);

  const begin = useCallback(async () => {
    const attemptNumber = attemptNumberRef.current + 1;
    attemptNumberRef.current = attemptNumber;
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const desktopPointer = window.matchMedia("(pointer: fine) and (min-width: 640px)").matches;
    const telegramWindow = desktopPointer ? window.open("about:blank", "_blank") : null;
    if (telegramWindow) telegramWindow.opener = null;

    setState("starting");
    setMessage(null);
    setAttempt(null);
    setUser(null);
    try {
      const response = await fetch("/api/auth/telegram/start", {
        method: "POST",
        cache: "no-store",
        signal: controller.signal,
      });
      const parsed = telegramStartResponseSchema.safeParse(await readJson(response));
      if (response.status === 503) {
        telegramWindow?.close();
        showPhoneFallback();
        return;
      }
      if (!response.ok || !parsed.success) {
        telegramWindow?.close();
        setMessage("Telegram ulanishida muammo bor. Qayta urinib ko'ring.");
        setState("error");
        return;
      }

      setAttempt({
        id: parsed.data.id,
        deepLink: parsed.data.deepLink,
        expiresAt: new Date(parsed.data.expiresAt).getTime(),
      });
      setState("waiting");
      if (telegramWindow) telegramWindow.location.href = parsed.data.deepLink;
      else if (!desktopPointer) window.location.href = parsed.data.deepLink;
    } catch (error) {
      if (controller.signal.aborted || attemptNumberRef.current !== attemptNumber) return;
      telegramWindow?.close();
      setMessage("Tarmoq xatosi. Telefon raqami orqali davom eting.");
      setState("error");
    }
  }, [showPhoneFallback]);

  useEffect(() => {
    if (state !== "waiting" || !attempt) return;
    const attemptNumber = attemptNumberRef.current;
    const backoffIndexRef = { current: 0 };
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let requestTimeout: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;
    let wakeWhenVisible: (() => void) | undefined;
    const visible = new Promise<void>((resolve) => { wakeWhenVisible = resolve; });

    const onVisibilityChange = () => {
      if (!document.hidden) wakeWhenVisible?.();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const wait = (duration: number) => new Promise<void>((resolve) => {
      timer = setTimeout(resolve, duration);
    });
    const expire = () => {
      stopped = true;
      setMessage("Telegram orqali kirish muddati tugadi. Qayta urinib ko'ring.");
      setState("timeout");
    };

    const poll = async () => {
      while (!stopped && attemptNumberRef.current === attemptNumber) {
        if (Date.now() >= attempt.expiresAt) {
          expire();
          return;
        }
        if (document.hidden) {
          backoffIndexRef.current = 0;
          await visible;
          continue;
        }

        controller = new AbortController();
        requestTimeout = setTimeout(() => controller?.abort(), 10_000);
        try {
          const response = await fetch(`/api/auth/telegram/status?id=${encodeURIComponent(attempt.id)}`, {
            cache: "no-store",
            signal: controller.signal,
          });
          const parsed = telegramStatusResponseSchema.safeParse(await readJson(response));
          if (response.status === 503) {
            stopped = true;
            showPhoneFallback();
            return;
          }
          if (parsed.success && parsed.data.state === "approved") {
            stopped = true;
            setUser(parsed.data.user);
            setState("success");
            return;
          }
          if (parsed.success && ["expired", "consumed", "unknown"].includes(parsed.data.state)) {
            stopped = true;
            setMessage("Havola muddati tugagan. Qayta urinish uchun Telegram tugmasini bosing.");
            setState("timeout");
            return;
          }
        } catch {
          if (stopped) return;
        } finally {
          if (requestTimeout) clearTimeout(requestTimeout);
        }

        const delay = BACKOFF_MS[backoffIndexRef.current] ?? BACKOFF_MS[2];
        backoffIndexRef.current = Math.min(backoffIndexRef.current + 1, BACKOFF_MS.length - 1);
        await wait(delay);
      }
    };
    void poll();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      if (requestTimeout) clearTimeout(requestTimeout);
      controller?.abort();
      wakeWhenVisible?.();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [attempt, showPhoneFallback, state]);

  useEffect(() => {
    if (state !== "waiting" || !attempt) return;
    const update = () => setSeconds(Math.max(0, Math.ceil((attempt.expiresAt - Date.now()) / 1_000)));
    update();
    const interval = setInterval(update, 1_000);
    return () => clearInterval(interval);
  }, [attempt, state]);

  useEffect(() => {
    if (state !== "success") return;
    const timer = setTimeout(() => {
      void refreshAuth().finally(closeAuthModal);
    }, 1_200);
    return () => clearTimeout(timer);
  }, [closeAuthModal, refreshAuth, state]);

  if (state === "success" && user) {
    return <div role="status" className="rounded-lg border border-success-line bg-success-soft p-4 text-sm text-success">Xush kelibsiz, {user.fullName}!</div>;
  }

  return (
    <div className="rounded-lg border border-border bg-bg-sunken p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-telegram" aria-hidden="true" />
        <div><p className="font-semibold text-ink">Telegram orqali davom etish</p><p className="mt-1 text-sm text-ink-muted">Yangi foydalanuvchi bo'lsangiz ham, Telegram orqali ro'yxatdan o'tasiz.</p></div>
      </div>
      {state === "waiting" && attempt ? (
        <div className="mt-4 text-center">
          <TelegramQr value={attempt.deepLink} />
          <p className="mt-2 text-sm text-ink-muted" aria-live="polite">Telegram'da botni oching va Start bosing… {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</p>
          <button type="button" onClick={() => void begin()} className="mt-3 min-h-11 rounded-md border border-border px-3 text-sm font-medium text-ink">Qayta urinish</button>
        </div>
      ) : null}
      {(state === "starting" || state === "waiting") ? <p className="mt-3 flex items-center justify-center gap-2 text-sm text-ink-muted"><Loader2 className="h-4 w-4 animate-spin text-telegram" aria-hidden="true" />Telegram tekshirilmoqda...</p> : null}
      {message ? <p role="alert" className="mt-3 text-sm text-danger">{message}</p> : null}
      {state !== "waiting" ? <button type="button" onClick={() => void begin()} disabled={state === "starting"} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-telegram px-4 font-semibold text-white disabled:opacity-60"><Send className="h-4 w-4" aria-hidden="true" />Telegram orqali davom etish</button> : null}
    </div>
  );
}
