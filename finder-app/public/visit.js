/* Counts a visit: one anonymous tally per day, per page and per source (for example Facebook or Google).
   No cookies, no IP address, no device details. Browsers that send Do Not Track are not counted.
   advocateTrack(name) adds one to a plain tally for a tap on the sign-up screen, under the same rules. */
(function () {
  window.advocateTrack = function () {};
  try {
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
    var h = location.hostname;
    var site = h === "advocate.includeme.uk" ? "app" : h === "info.includeme.uk" ? "info" : h === "includeme.uk" ? "finder" : "";
    if (!site || location.pathname.indexOf("/admin") === 0) return;
    var url = "https://advocate.includeme.uk/api/hit";
    function send(body) {
      if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }));
      else fetch(url, { method: "POST", body: body, keepalive: true, mode: "no-cors", headers: { "content-type": "text/plain" } });
    }
    var q = new URLSearchParams(location.search);
    send(JSON.stringify({ s: site, p: site === "app" && q.get("demo") === "1" ? "/demo" : location.pathname, r: document.referrer || "", u: q.get("utm_campaign") || "", f: q.has("fbclid") ? 1 : 0 }));
    if (site === "app") window.advocateLanding = landingTracking(send);
    window.advocateTrack = function (name) {
      try { send(JSON.stringify({ s: site, e: String(name).slice(0, 30) })); } catch (e) { /* never get in the way */ }
    };
  } catch (e) { /* never get in the way of the page */ }
})();

/* What people do on the app's front page (the page shown before sign-in): how far they scroll, which parts they reach and
   which buttons they tap. It only runs while that page is showing, never once someone is inside the app. Anonymous tallies
   only, under the same rules as above: no cookie, no IP address, nothing about the person. */
function landingTracking(send) {
  var on = false, started = false, seen = {}, n = 0, labels = new WeakMap(), checkParts = function () {};
  function clean(t) { return String(t).toLowerCase().replace(/[^a-z0-9_>-]+/g, "_").slice(0, 40); }
  function post(b) { b.s = "app"; b.p = "/landing"; send(JSON.stringify(b)); }
  function once(k, b) { if (!on || seen[k]) return; seen[k] = 1; post(b); }
  function label(el) { if (!labels.has(el)) labels.set(el, clean(el.getAttribute("data-sec") || "s" + (++n))); return labels.get(el); }
  function start() {
    if (started) return; started = true;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!on || ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var d = document.documentElement, pct = (window.pageYOffset + window.innerHeight) / Math.max(d.scrollHeight, 1) * 100;
        [25, 50, 75, 100].forEach(function (m) { if (pct >= m - 2) once("d" + m, { d: m }); });
        checkParts();
      });
    }, { passive: true });
    var root = document.getElementById("view-landing");
    checkParts = function () {
      if (!root) return;
      root.querySelectorAll("[data-sec]").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.height > 0 && r.top <= window.innerHeight * 0.65) once("v" + label(el), { v: label(el) });
      });
    };
    setTimeout(checkParts, 300);
    if (root) root.addEventListener("click", function (e) {
      if (!on) return;
      var a = e.target && e.target.closest ? e.target.closest("a,button") : null; if (!a) return;
      var sec = a.closest("[data-sec]"), href = a.getAttribute("href") || "";
      var t = a.getAttribute("data-t") || (/terms\.html/.test(href) ? "terms" : /privacy\.html/.test(href) ? "privacy" : "other");
      post({ c: clean((sec ? label(sec) : "page") + ">" + t) });
    }, true);
  }
  return function (flag) { on = !!flag; if (on) start(); };
}
