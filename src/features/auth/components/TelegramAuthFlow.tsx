"use client";

import { Loader2, Send, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BRAND } from "@/config/brand";
import type { User } from "@/lib/validations/auth";

type State = "idle" | "starting" | "waiting" | "success" | "error" | "timeout";

function MiniQr({ value }: { value: string }) {
  const cells = useMemo(() => Array.from({ length: 121 }, (_, index) => `${value}:${index}`).map((item) => item.split(":").reduce((hash, part) => (hash * 31 + part.length) | 0, 7) % 2 === 0), [value]);
  return <svg viewBox="0 0 33 33" className="h-28 w-28 rounded bg-white p-1" role="img" aria-label="Telegram havolasi QR kodi" shapeRendering="crispEdges"><rect width="33" height="33" fill="white" />{cells.map((on, index) => on ? <rect key={index} x={(index % 11) * 3} y={Math.floor(index / 11) * 3} width="3" height="3" className="fill-ink" /> : null)}</svg>;
}

export function TelegramAuthFlow() {
  const { setAuthenticatedUser } = useAuth();
  const [state, setState] = useState<State>("idle");
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [seconds, setSeconds] = useState(300);

  const begin = useCallback(async () => {
    setState("starting"); setMessage(null); setSeconds(300);
    try {
      const response = await fetch("/api/auth/telegram/start", { method: "POST" });
      const data: unknown = await response.json();
      if (!response.ok || !data || typeof data !== "object" || !("deepLink" in data) || typeof data.deepLink !== "string") {
        setMessage(response.status === 503 ? "Hozircha Telegram orqali kirish ishlamayapti. Telefon raqami orqali davom eting." : "Telegram ulanishida muammo bor. Qayta urinib ko'ring.");
        setState("error"); return;
      }
      setDeepLink(data.deepLink); setState("waiting");
      if (window.matchMedia("(max-width: 640px)").matches) window.location.href = data.deepLink;
      else window.open(data.deepLink, "_blank", "noopener,noreferrer");
    } catch { setMessage("Tarmoq xatosi. Telefon raqami orqali davom eting."); setState("error"); }
  }, []);

  useEffect(() => {
    if (state !== "waiting" || !deepLink) return;
    const id = new URL(deepLink).searchParams.get("start")?.replace("login_", "");
    if (!id) return;
    let stopped = false; let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      if (stopped) return;
      if (document.hidden) { timer = setTimeout(poll, 2000); return; }
      try {
        const response = await fetch(`/api/auth/telegram/status?id=${encodeURIComponent(id)}`, { cache: "no-store" });
        const data: unknown = await response.json();
        if (data && typeof data === "object" && "state" in data && data.state === "approved" && "user" in data && data.user) {
          setUser(data.user as User); setAuthenticatedUser(data.user as User); setState("success"); stopped = true; return;
        }
        if (data && typeof data === "object" && "state" in data && (data.state === "expired" || data.state === "consumed" || data.state === "unknown")) { setMessage("Havola muddati tugagan. Qayta urinish uchun Telegram tugmasini bosing."); setState("timeout"); stopped = true; return; }
      } catch { /* retry on the next bounded poll */ }
      if (seconds <= 1) { setMessage("Telegram orqali kirish muddati tugadi. Qayta urinib ko'ring."); setState("timeout"); stopped = true; return; }
      timer = setTimeout(poll, 2000);
    };
    void poll();
    return () => { stopped = true; if (timer) clearTimeout(timer); };
  }, [state, deepLink, seconds, setAuthenticatedUser]);

  useEffect(() => {
    if (state !== "waiting") return;
    const interval = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(interval);
  }, [state]);

  if (state === "success" && user) return <div role="status" className="rounded-lg border border-success-line bg-success-soft p-4 text-sm text-success">Xush kelibsiz, {user.fullName}!</div>;
  return <div className="rounded-lg border border-border bg-bg-sunken p-4">
    <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-telegram" aria-hidden="true" /><div><p className="font-semibold text-ink">Telegram orqali davom etish</p><p className="mt-1 text-sm text-ink-muted">Yangi foydalanuvchi bo'lsangiz ham, Telegram orqali ro'yxatdan o'tasiz.</p></div></div>
    {state === "waiting" && <div className="mt-4 text-center"><MiniQr value={deepLink ?? ""} /><p className="mt-2 text-sm text-ink-muted" aria-live="polite">Telegram'da botni oching va Start bosing… {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</p><button type="button" onClick={begin} className="mt-3 min-h-11 rounded-md border border-border px-3 text-sm font-medium text-ink">Qayta yuborish</button></div>}
    {(state === "starting" || state === "waiting") && <p className="mt-3 flex items-center justify-center gap-2 text-sm text-ink-muted"><Loader2 className="h-4 w-4 animate-spin text-telegram" aria-hidden="true" />Telegram tekshirilmoqda...</p>}
    {message && <p role="alert" className="mt-3 text-sm text-danger">{message}</p>}
    {state !== "waiting" && <button type="button" onClick={() => void begin()} disabled={state === "starting"} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-telegram px-4 font-semibold text-white disabled:opacity-60"><Send className="h-4 w-4" aria-hidden="true" />Telegram orqali davom etish</button>}
  </div>;
}
