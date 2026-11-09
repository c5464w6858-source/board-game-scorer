/* EHCP Tracker native shim.
   Injected into the COPY of index.html inside this Capacitor project by scripts/sync-web.sh.
   It is never added to the live website. It does nothing in a normal browser. */
(function () {
  "use strict";
  var C = window.Capacitor;
  if (!C || typeof C.isNativePlatform !== "function" || !C.isNativePlatform()) return;

  var API_ORIGIN = "https://advocate.includeme.uk";
  var SITE = API_ORIGIN;
  var platform = typeof C.getPlatform === "function" ? C.getPlatform() : "native";
  var root = document.documentElement;
  root.classList.add("is-native", "is-" + platform);

  /* 1. Send the app's own /api calls to the live backend. Method, headers, body and signal are kept. */
  function isApiPath(p) { return p === "/api" || p.indexOf("/api/") === 0 || p.indexOf("/api?") === 0; }
  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    try {
      if (typeof input === "string") {
        if (isApiPath(input)) input = API_ORIGIN + input;
      } else if (typeof URL !== "undefined" && input instanceof URL) {
        if (input.origin === location.origin && isApiPath(input.pathname)) input = API_ORIGIN + input.pathname + input.search;
      } else if (typeof Request !== "undefined" && input instanceof Request) {
        var u = new URL(input.url);
        if (u.origin === location.origin && isApiPath(u.pathname)) {
          /* A Request object: rebuild it for the live URL, keeping method, headers, body and signal. (The app itself only passes strings.) */
          var src = input, target = API_ORIGIN + u.pathname + u.search, hasBody = src.method !== "GET" && src.method !== "HEAD";
          return (hasBody ? src.clone().arrayBuffer() : Promise.resolve(undefined)).then(function (buf) {
            var merged = Object.assign({ method: src.method, headers: src.headers, body: buf, signal: src.signal, cache: src.cache, redirect: src.redirect }, init || {});
            return realFetch(target, merged);
          });
        }
      }
    } catch (e) { /* fall through to the untouched call */ }
    return realFetch(input, init);
  };

  /* 2. No service worker inside the app: the bundle is the offline copy. */
  try {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register = function () { return Promise.resolve(undefined); };
    }
    /* Web push does not exist in a store app webview; the app then offers its email reminders only. */
    delete window.PushManager;
  } catch (e) { /* ignore */ }

  /* 3. Links the page opens in a new tab (privacy, terms) point at the live site so the system browser opens them. */
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a[target=_blank]") : null;
    if (!a) return;
    try {
      var u = new URL(a.href, location.href);
      if (u.origin === location.origin) { a.setAttribute("href", SITE + u.pathname + u.search + u.hash); }
    } catch (e) { /* ignore */ }
  }, true);

  /* 4. Side safe areas (landscape notch). The page already handles top and bottom with env(safe-area-inset-*). */
  var css = document.createElement("style");
  css.textContent =
    "html.is-native body{padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}" +
    "html.is-native nav.tabs{padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}" +
    "html.is-native{-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}" +
    "html.is-native input,html.is-native textarea,html.is-native [contenteditable]{-webkit-user-select:text;user-select:text}";
  (document.head || root).appendChild(css);

  /* 5. Status bar and Android back button. Plugins are optional; failures never block the app. */
  function plug(n) { try { return C.Plugins && C.Plugins[n]; } catch (e) { return null; } }
  try {
    var sb = plug("StatusBar");
    if (sb) {
      sb.setStyle({ style: "DARK" });
      if (platform === "android") { sb.setBackgroundColor({ color: "#17214D" }); sb.setOverlaysWebView({ overlay: false }); }
    }
  } catch (e) { /* ignore */ }
  try {
    var app = plug("App");
    if (app && platform === "android") {
      app.addListener("backButton", function () {
        try {
          var ov = document.querySelector("#overlay.open");
          if (ov && typeof window.closeSheet === "function") { window.closeSheet(); return; }
        } catch (e) { /* ignore */ }
        if (window.history.length > 1) window.history.back(); else app.exitApp();
      });
    }
  } catch (e) { /* ignore */ }
})();
