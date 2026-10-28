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
    window.advocateTrack = function (name) {
      try { send(JSON.stringify({ s: site, e: String(name).slice(0, 30) })); } catch (e) { /* never get in the way */ }
    };
  } catch (e) { /* never get in the way of the page */ }
})();
