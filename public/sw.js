const CACHE_NAME = "naqsh-v1-assets";
const PRECACHE_ASSETS = ["/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cache) => cache !== CACHE_NAME)
          .map((cache) => caches.delete(cache)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // HTML stays network-only because the app has authenticated server UI and a
  // per-request CSP nonce. Never return a stale page or another user's markup.
  if (request.mode === "navigate" || url.pathname.startsWith("/api/")) {
    return;
  }

  if (
    request.method !== "GET" ||
    !url.origin.startsWith(self.location.origin) ||
    !(
      url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.match(/\.(?:png|jpg|jpeg|svg|gif|webp|avif|woff2?|css|js)$/i)
    )
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      });
    }),
  );
});
