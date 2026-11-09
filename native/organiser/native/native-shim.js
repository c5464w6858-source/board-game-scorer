/* Child Organiser native shim. Loaded ONLY from the copied www/index.html (see scripts/sync-web.sh).
 * Does nothing in a normal browser. Inside the Capacitor app it:
 *  1. sends same-origin server paths (/api/..., /.netlify/...) to the live servers instead of the local bundle,
 *  2. stops the service worker and web push (not used in the app; avoids promises that never resolve),
 *  3. points Supabase e-mail links (confirm / reset password) at the live web app, because https://localhost is not reachable from an e-mail,
 *  4. adds safe-area padding, status bar colour, Android back-button handling for open dialogs,
 *  5. makes "download" links (backup, calendar file, documents) open the system share sheet, as webviews ignore blob downloads.
 * Everything else is left alone. */
(function () {
  "use strict";
  var C = window.Capacitor;
  if (!C || typeof C.isNativePlatform !== "function" || !C.isNativePlatform()) return;

  var PASSPORT = "https://includeme-passport.netlify.app";   // static site that hosts the web app
  var API = "https://advocate.includeme.uk";                 // server that actually answers /api/diary/* (see STORE-READINESS.md)
  var SERVER_PATH = /^\/(api|\.netlify)(\/|$)/;
  var P = function (n) { return (C.Plugins || {})[n]; };

  document.documentElement.classList.add("cap-native");

  /* 1. fetch: relative or same-origin server paths go to the real server; everything else is untouched */
  function mapUrl(u) {
    try {
      var url = new URL(u, location.href);
      if (url.origin === location.origin && SERVER_PATH.test(url.pathname)) {
        return (url.pathname.indexOf("/api/") === 0 || url.pathname === "/api" ? API : PASSPORT) + url.pathname + url.search;
      }
      if (/\.supabase\.co$/.test(url.hostname) && url.pathname.indexOf("/auth/v1/") === 0) {
        // e-mail links must open the live web app, not https://localhost
        var rt = url.searchParams.get("redirect_to");
        if (rt && /^(https?|capacitor):\/\/localhost(\/|$)/.test(rt)) { url.searchParams.set("redirect_to", PASSPORT + "/"); return url.toString(); }
      }
    } catch (e) { /* leave it */ }
    return null;
  }
  var realFetch = window.fetch;
  window.fetch = function (input, init) {
    try {
      var isReq = typeof Request !== "undefined" && input instanceof Request;
      var m = mapUrl(isReq ? input.url : String(input));
      if (m) input = isReq ? new Request(m, input) : m;
    } catch (e) { /* fall through to the original call */ }
    return realFetch.call(this, input, init);
  };

  /* 2. no service worker, no web push */
  try {
    if (navigator.serviceWorker) {
      delete Navigator.prototype.serviceWorker; // makes ("serviceWorker" in navigator) false, so the page skips registration and push
    }
  } catch (e) { try { navigator.serviceWorker.register = function () { return Promise.reject(new Error("native")); }; } catch (e2) { /* ignore */ } }
  try { delete window.PushManager; } catch (e) { /* ignore */ }

  /* 3 + 4. look and feel */
  var css = document.createElement("style");
  css.textContent =
    "html.cap-native body{padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}" +
    "html.cap-native .top{padding-top:env(safe-area-inset-top)}" +
    "html.cap-native #gate{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}" +
    "html.cap-native body{padding-bottom:env(safe-area-inset-bottom)}" +
    /* phone push is not offered in the app (reminders by e-mail still work) */
    "html.cap-native .chkrow:has(#remPush){display:none!important}" +
    /* "Save to your phone" makes no sense inside an installed app. The EHCP Tracker upsell (a paid web subscription) is hidden
       in the store builds to stay clear of Apple 3.1.1 / Google Play payments rules: see STORE-READINESS.md. */
    "html.cap-native .savecard,html.cap-native #installBar,html.cap-native #miSave,html.cap-native .upsell{display:none!important}" +
    "html.cap-native{-webkit-tap-highlight-color:transparent}";
  (document.head || document.documentElement).appendChild(css);

  /* the letter picker: offer photos and the document types the app reads, not video (so iOS never asks for the microphone) */
  function narrowPicker() {
    var f = document.getElementById("scanFile");
    if (f) f.setAttribute("accept", "image/*,application/pdf,.pdf,.txt,.docx,.heic,.heif");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", narrowPicker); else narrowPicker();

  try { var sb = P("StatusBar"); if (sb) { sb.setStyle({ style: "DARK" }); if (C.getPlatform() === "android") sb.setBackgroundColor({ color: "#3B1F63" }); } } catch (e) { /* ignore */ }
  try {
    var app = P("App");
    if (app && app.addListener) app.addListener("backButton", function (st) {
      var d = document.querySelector("dialog[open]");
      if (d) { try { d.close(); } catch (e) { d.removeAttribute("open"); } return; }
      if (st && st.canGoBack) history.back(); else app.exitApp();
    });
  } catch (e) { /* ignore */ }

  /* 5. downloads: write to the cache folder, then hand to the system share sheet (Save to Files, Drive, email...) */
  function extFor(t) { return /pdf/.test(t) ? ".pdf" : /jpeg|jpg/.test(t) ? ".jpg" : /png/.test(t) ? ".png" : /json/.test(t) ? ".json" : /calendar/.test(t) ? ".ics" : ""; }
  function shareBlobUrl(href, name) {
    var fs = P("Filesystem"), sh = P("Share");
    if (!fs || !sh) return Promise.reject(new Error("no share plugin"));
    return realFetch(href).then(function (r) { return r.blob(); }).then(function (b) {
      return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res({ b: b, data: String(fr.result).split(",")[1] || "" }); }; fr.onerror = rej; fr.readAsDataURL(b); });
    }).then(function (o) {
      var fn = (name || "document").replace(/[^\w.\- ]+/g, "_"); if (!/\.\w{2,5}$/.test(fn)) fn += extFor(o.b.type);
      return fs.writeFile({ path: fn, data: o.data, directory: "CACHE" }).then(function (w) { return sh.share({ title: fn, url: w.uri }); });
    });
  }
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href^='blob:']") : null;
    if (!a) return;
    ev.preventDefault(); ev.stopPropagation();
    shareBlobUrl(a.href, a.getAttribute("download") || "").catch(function () { /* user cancelled the share sheet, or plugin missing */ });
  }, true);
  // programmatic a.click() on a detached/appended anchor also dispatches click, so the listener above covers it.

  /* 6. share links: the page builds them from location.origin (https://localhost here), which nobody else can open.
     Point them at the live web app, and give the page a real share sheet (text/links only; files go through the download path above). */
  function fixLink(s) { return typeof s === "string" ? s.replace(/^(https:|capacitor:|http:)\/\/localhost\/(#p=)/, PASSPORT + "/$2") : s; }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      var cw = navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = function (s) { return cw(fixLink(s)); };
    }
  } catch (e) { /* ignore */ }
  try {
    if (P("Share")) navigator.share = function (d) {
      d = d || {};
      return P("Share").share({ title: d.title, text: d.text, url: fixLink(d.url), dialogTitle: d.title }).then(function () {}, function (e) { if (/cancel/i.test(String(e && e.message))) { var a = new Error("cancelled"); a.name = "AbortError"; throw a; } throw e; });
    };
  } catch (e) { /* ignore */ }

  window.__organiserNativeShim = { version: 1, mapUrl: mapUrl, fixLink: fixLink };
})();
