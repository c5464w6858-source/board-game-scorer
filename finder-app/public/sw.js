const CACHE = "includeme-v2";
const OFFLINE = ["/", "/manifest.json", "/icons/icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes("supabase") || url.hostname.includes("googleapis") || url.hostname.includes("resend") || url.hostname.includes("netlify")) {
    return; // never intercept API/function calls
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok && e.request.method === "GET") {
          const toCache = res.clone(); // clone BEFORE returning res, not after
          caches.open(CACHE).then(c => c.put(e.request, toCache));
        }
        return res;
      });
      return cached || network;
    })
  );
});

// Real push notifications, sent server-side from netlify/functions/send-push-alerts.js
self.addEventListener("push", e => {
  let data = { title: "IncludeMe", body: "New activity near you", url: "/" };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if ("focus" in client) { client.focus(); if ("navigate" in client) client.navigate(url); return; }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
