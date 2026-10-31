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
    send(JSON.stringify({ s: site, p: location.pathname, r: document.referrer || "", u: q.get("utm_campaign") || "", f: q.has("fbclid") ? 1 : 0 }));
    if (site === "info") behaviour(send);
    window.advocateTrack = function (name) {
      try { send(JSON.stringify({ s: site, e: String(name).slice(0, 30) })); } catch (e) { /* never get in the way */ }
    };
  } catch (e) { /* never get in the way of the page */ }
})();

/* What people do on an info page: how far they scroll, which sections come into view, and which links or buttons they tap.
   Anonymous tallies only, under the same rules as above: no cookie, no IP address, nothing about the person. */
function behaviour(send) {
  var path = location.pathname, seen = {};
  function clean(t) { return String(t).toLowerCase().replace(/[^a-z0-9_>-]+/g, "_").slice(0, 40); }
  function post(body) { body.s = "info"; body.p = path; send(JSON.stringify(body)); }
  function once(key, body) { if (seen[key]) return; seen[key] = 1; post(body); }
  var labels = new WeakMap(), n = 0;
  function label(el) {
    if (labels.has(el)) return labels.get(el);
    var l = el.getAttribute("data-sec") || el.id || (el.classList.contains("hero") ? "hero" : el.tagName === "HEADER" ? "nav" : el.tagName === "FOOTER" ? "footer" : "s" + (++n));
    l = clean(l); labels.set(el, l); return l;
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var d = document.documentElement, pct = (window.pageYOffset + window.innerHeight) / Math.max(d.scrollHeight, 1) * 100;
      [25, 50, 75, 100].forEach(function (m) { if (pct >= m - 2) once("d" + m, { d: m }); });
    });
  }, { passive: true });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { once("v" + label(e.target), { v: label(e.target) }); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -35% 0px", threshold: 0 });
    document.querySelectorAll("section, footer").forEach(function (el) { label(el); io.observe(el); });
  }
  function target(a) {
    var t = a.getAttribute("data-t"); if (t) return t;
    var href = a.getAttribute("href"); if (!href) return "button";
    if (href.indexOf("mailto:") === 0) return "email";
    if (href.charAt(0) === "#") return "jump_" + href.slice(1, 18);
    try {
      var u = new URL(a.href, location.href);
      if (u.hostname === "advocate.includeme.uk") return u.searchParams.get("demo") === "1" ? "demo" : "app";
      if (u.hostname === "includeme-passport.netlify.app") return "passport_app";
      if (u.hostname === "includeme.uk") return "finder_app";
      if (u.hostname === location.hostname) return "go_" + (u.pathname.split("/")[1] || "home");
    } catch (e) { /* fall through */ }
    return "other";
  }
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a,button") : null; if (!a) return;
    var sec = a.closest("header,footer,section");
    post({ c: clean((sec ? label(sec) : "page") + ">" + target(a)) });
  }, true);
}
