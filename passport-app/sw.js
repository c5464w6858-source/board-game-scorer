/* Lets Child Organiser open without a signal. It caches only the app page and its icons. Nothing a parent types is ever sent here or cached. */
var V = "aam-v23";
var FILES = ["./", "./index.html", "./privacy.html", "icon-192.png", "icon-512.png", "logo-passport.svg", "visit.js"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;     // account calls go straight to the network
  if (r.mode === "navigate") {
    var key = u.pathname.indexOf("privacy") >= 0 ? "./privacy.html" : "./index.html";
    e.respondWith(fetch(r.url, { cache: "no-store" }).then(function (res) { var c = res.clone(); caches.open(V).then(function (ch) { ch.put(key, c); }); return res; }).catch(function () { return caches.match(key); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (hit) { return hit || fetch(r); }));
});

/* Appointment reminders sent from our server arrive here, even when the app is closed. They carry only the type and date. */
self.addEventListener("push", function (e) {
  var d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = {}; }
  e.waitUntil(self.registration.showNotification(d.title || "Child Organiser", { body: d.body || "You have an appointment coming up.", tag: d.tag || "child-organiser", icon: "icon-192.png", badge: "icon-192.png", data: { url: d.url || "./" } }));
});
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { if ("focus" in cs[i]) return cs[i].focus(); }
    return self.clients.openWindow((e.notification.data && e.notification.data.url) || "./");
  }));
});
