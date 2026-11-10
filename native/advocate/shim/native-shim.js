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

  /* 7. downloads (backups, calendar files, documents): webviews ignore blob downloads. Write the file to the cache folder,
        then hand it to the system share sheet (Save to Files, Drive, email...). */
  try {
    var _fs = plug("Filesystem"), _sh = plug("Share");
    if (_fs && _sh) {
      var _ext = function (t) { return /pdf/.test(t) ? ".pdf" : /jpeg|jpg/.test(t) ? ".jpg" : /png/.test(t) ? ".png" : /json/.test(t) ? ".json" : /calendar/.test(t) ? ".ics" : ""; };
      var _realFetch = window.__nativeRealFetch || window.fetch.bind(window);
      var _shareBlob = function (href, name) {
        return _realFetch(href).then(function (r) { return r.blob(); }).then(function (b) {
          return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res({ b: b, data: String(fr.result).split(",")[1] || "" }); }; fr.onerror = rej; fr.readAsDataURL(b); });
        }).then(function (o) {
          var fn = (name || "document").replace(/[^\w.\- ]+/g, "_"); if (!/\.\w{2,5}$/.test(fn)) fn += _ext(o.b.type);
          return _fs.writeFile({ path: fn, data: o.data, directory: "CACHE" }).then(function (w) { return _sh.share({ title: fn, url: w.uri }); });
        });
      };
      document.addEventListener("click", function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest("a[href^='blob:']") : null;
        if (!a) return;
        ev.preventDefault(); ev.stopPropagation();
        _shareBlob(a.href, a.getAttribute("download") || "").catch(function () { /* cancelled, or plugin missing */ });
      }, true);
      /* files cannot go through navigator.share in a webview: make the page fall back to its download link */
      var _cs = navigator.canShare ? navigator.canShare.bind(navigator) : null;
      navigator.canShare = function (d) { if (d && d.files) return false; return _cs ? _cs(d) : true; };
    }
  } catch (e) { /* ignore */ }

  /* 8. printing does not exist in the app's webview. Say so plainly instead of doing nothing. */
  try {
    window.print = function () {
      var t = document.createElement("div");
      t.setAttribute("role", "status");
      t.textContent = "Printing is not available in the app yet. Open advocate.includeme.uk in your phone's browser to print or save as a PDF.";
      t.style.cssText = "position:fixed;left:12px;right:12px;bottom:calc(16px + env(safe-area-inset-bottom));background:#1B1530;color:#fff;padding:14px 16px;border-radius:12px;font:15px/1.4 system-ui,sans-serif;z-index:2147483647;box-shadow:0 6px 24px rgba(0,0,0,.35)";
      document.body.appendChild(t); setTimeout(function () { t.remove(); }, 6000);
    };
  } catch (e) { /* ignore */ }
})();
