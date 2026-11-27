const CACHE = "dinimbo-racing-v6";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request, { cache: "reload" })
        .then(r => {
          const copy = r.clone();
          caches.open(CACHE).then(c => {
            c.put("./index.html", copy);
            c.put(e.request, r.clone());
          });
          return r;
        })
        .catch(() =>
          caches.match("./index.html").then(m => m || caches.match(e.request, { ignoreSearch: true }))
        )
    );
    return;
  }

  e.respondWith(
    fetch(e.request, { cache: "no-cache" })
      .then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
