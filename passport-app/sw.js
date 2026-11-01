/* Lets Child Organiser open without a signal. It caches only the app page and its icons. Nothing a parent types is ever sent here or cached. */
var V = "aam-v3";
var FILES = ["./", "./index.html", "./privacy.html", "icon-192.png", "icon-512.png", "logo-passport.svg", "visit.js"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;     // account calls go straight to the network
  if (r.mode === "navigate") {
    var key = u.pathname.indexOf("privacy") >= 0 ? "./privacy.html" : "./index.html";
    e.respondWith(fetch(r).then(function (res) { var c = res.clone(); caches.open(V).then(function (ch) { ch.put(key, c); }); return res; }).catch(function () { return caches.match(key); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (hit) { return hit || fetch(r); }));
});
