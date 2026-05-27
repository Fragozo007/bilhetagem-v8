const ASSET_VERSION = "28";
const CACHE_NAME = "bilhetagem-v" + ASSET_VERSION;

const APP_SHELL = [
  "./",
  "./index.html",
  "./bilhetagem-v8.html",
  "./bilhetagem-v8.css",
  "./boot.js",
  "./bilhetagem-v8.js?v=" + ASSET_VERSION,
  "./sw.js?v=" + ASSET_VERSION,
  "./manifest.webmanifest",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
];

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept")?.includes("text/html"))
  );
}

function isCodeAsset(url) {
  return /\.(js|css|html)(\?.*)?$/i.test(url.pathname);
}

function networkFirst(request, fallbackUrl) {
  return fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() =>
      caches.match(request).then((cached) => cached || caches.match(fallbackUrl))
    );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (isNavigationRequest(event.request) || isCodeAsset(url)) {
    event.respondWith(networkFirst(event.request, "./bilhetagem-v8.html"));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });

          return networkResponse;
        })
        .catch(() => caches.match("./bilhetagem-v8.html"));
    })
  );
});
