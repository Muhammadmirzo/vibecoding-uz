export function afterPageReady(callback: () => void): () => void {
  let cancelled = false;
  let idleId: number | ReturnType<typeof globalThis.setTimeout> | undefined;
  let observer: PerformanceObserver | undefined;

  const schedule = () => {
    if (cancelled) return;
    const requestIdle = window.requestIdleCallback?.bind(window);
    if (typeof requestIdle === "function") {
      idleId = requestIdle(callback, { timeout: 2_000 });
    } else {
      idleId = globalThis.setTimeout(callback, 1_000);
    }
  };

  const onLoad = () => {
    if (!("PerformanceObserver" in window)) {
      schedule();
      return;
    }
    try {
      observer = new PerformanceObserver((list) => {
        if (list.getEntries().length > 0) {
          observer?.disconnect();
          schedule();
        }
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      schedule();
    }
  };

  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });

  return () => {
    cancelled = true;
    observer?.disconnect();
    window.removeEventListener("load", onLoad);
    if (idleId !== undefined) {
      if (typeof idleId === "number") {
        const cancelIdle = window.cancelIdleCallback?.bind(window);
        if (typeof cancelIdle === "function") cancelIdle(idleId);
        else globalThis.clearTimeout(idleId);
      } else {
        globalThis.clearTimeout(idleId);
      }
    }
  };
}
