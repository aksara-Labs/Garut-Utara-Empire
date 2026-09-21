// MyDashboard service worker — Fase E
const CACHE = "mydashboard-v2";
const ASSETS = [
  "./",
  "./manifest.json",
  "./icon-192.png",
  "./icon-192.webp",
  "./icon-512.png",
  "./icon-512.webp"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Network-first for app shell HTML / API; cache-first for static icons
  const url = new URL(req.url);
  if (/\.(png|webp|jpg|jpeg|svg|ico)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req)))
    );
    return;
  }
  e.respondWith(
    fetch(req).then((res) => res).catch(() => caches.match(req).then((hit) => hit || caches.match("./")))
  );
});
