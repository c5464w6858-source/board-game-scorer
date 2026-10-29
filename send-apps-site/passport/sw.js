/* Lets the passport open without a signal. It caches only this page and its icons; nothing a parent types is ever sent or cached here. */
var V = "passport-v1";
var FILES = ["./", "./index.html", "icon-192.png", "icon-512.png", "../assets/logo-passport.svg", "../assets/logo-includeme.svg"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(function (res) { var copy = res.clone(); caches.open(V).then(function (c) { c.put("./index.html", copy); }); return res; }).catch(function () { return caches.match("./index.html"); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (hit) { return hit || fetch(r); }));
});
