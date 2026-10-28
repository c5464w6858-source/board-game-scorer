/* Counts a visit: one anonymous tally per day, per page and per source (for example Facebook or Google).
   No cookies, no IP address, no device details. Browsers that send Do Not Track are not counted. */
(function () {
  try {
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
    var h = location.hostname;
    var site = h === "advocate.includeme.uk" ? "app" : h === "info.includeme.uk" ? "info" : h === "includeme.uk" ? "finder" : "";
    if (!site || location.pathname.indexOf("/admin") === 0) return;
    var q = new URLSearchParams(location.search);
    var body = JSON.stringify({ s: site, p: location.pathname, r: document.referrer || "", u: q.get("utm_campaign") || "", f: q.has("fbclid") ? 1 : 0 });
    var url = "https://advocate.includeme.uk/api/hit";
    if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }));
    else fetch(url, { method: "POST", body: body, keepalive: true, mode: "no-cors", headers: { "content-type": "text/plain" } });
  } catch (e) { /* never get in the way of the page */ }
})();
