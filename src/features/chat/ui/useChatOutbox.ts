"use client";

import * as React from "react";
import type { ChatMessageDto } from "../contracts";
import type { OfflineLeadValues } from "./OfflineLeadForm";

const MAX_AUTO_RETRIES = 3;

export interface OutboxItem {
  clientId: string;
  body: string;
  contact?: OfflineLeadValues;
  status: "queued" | "failed";
  createdAt: string;
}

/**
 * Visitor outbox: every message shows up at once, then is delivered strictly in order,
 * one request at a time. A failed send keeps its clientId (the server dedupes on it),
 * holds the messages behind it so order is never broken, and is retried automatically
 * (2 s, 4 s, 8 s), then on demand, on the next send, or when the browser comes back
 * online. Typing while a send is in flight never blocks or loses anything.
 */
export function useChatOutbox(
  send: (item: OutboxItem) => Promise<ChatMessageDto>,
  onSent: (message: ChatMessageDto) => void,
) {
  const [items, setItems] = React.useState<OutboxItem[]>([]);
  const queueRef = React.useRef<OutboxItem[]>([]);
  const flushingRef = React.useRef(false);
  const autoRetriesRef = React.useRef(0);
  const retryTimerRef = React.useRef(0);
  const sendRef = React.useRef(send);
  const onSentRef = React.useRef(onSent);
  sendRef.current = send;
  onSentRef.current = onSent;

  const commit = React.useCallback((next: OutboxItem[]) => {
    queueRef.current = next;
    setItems(next);
  }, []);

  const flush = React.useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;
    try {
      while (queueRef.current[0]?.status === "queued") {
        const item = queueRef.current[0];
        try {
          const message = await sendRef.current(item);
          autoRetriesRef.current = 0;
          commit(queueRef.current.filter((queued) => queued.clientId !== item.clientId));
          onSentRef.current(message);
        } catch {
          commit(queueRef.current.map((queued) => ({ ...queued, status: "failed" })));
          if (autoRetriesRef.current < MAX_AUTO_RETRIES) {
            const delay = 2_000 * 2 ** autoRetriesRef.current;
            autoRetriesRef.current += 1;
            window.clearTimeout(retryTimerRef.current);
            retryTimerRef.current = window.setTimeout(() => retryRef.current(), delay);
          }
        }
      }
    } finally {
      flushingRef.current = false;
    }
  }, [commit]);

  const retry = React.useCallback(() => {
    window.clearTimeout(retryTimerRef.current);
    if (!queueRef.current.length) return;
    commit(queueRef.current.map((queued) => ({ ...queued, status: "queued" })));
    void flush();
  }, [commit, flush]);

  const enqueue = React.useCallback((body: string, contact?: OfflineLeadValues) => {
    const item: OutboxItem = {
      clientId: crypto.randomUUID(), body, contact, status: "queued", createdAt: new Date().toISOString(),
    };
    // A new message is an implicit retry of anything stuck ahead of it.
    autoRetriesRef.current = 0;
    commit([...queueRef.current.map((queued) => ({ ...queued, status: "queued" as const })), item]);
    void flush();
  }, [commit, flush]);

  const retryRef = React.useRef(retry);
  retryRef.current = retry;

  // A person's retry (button, back online) earns a fresh round of automatic retries.
  const retryNow = React.useCallback(() => {
    autoRetriesRef.current = 0;
    retry();
  }, [retry]);

  React.useEffect(() => {
    window.addEventListener("online", retryNow);
    return () => {
      window.removeEventListener("online", retryNow);
      window.clearTimeout(retryTimerRef.current);
    };
  }, [retryNow]);

  return { items, enqueue, retry: retryNow };
}
