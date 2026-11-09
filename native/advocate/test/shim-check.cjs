// Headless check: serves ./www, mocks the Capacitor global, proves the shim rewrites /api fetches and the app boots.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const WWW = path.join(__dirname, "..", "www");
const OUT = process.argv[2] || path.join(__dirname, "shim-check.png");
const types = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".webmanifest": "application/json" };
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
  const f = path.join(WWW, p);
  if (!f.startsWith(WWW) || !fs.existsSync(f)) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(s);
});
(async () => {
  await new Promise(r => srv.listen(0, "127.0.0.1", r));
  const origin = "http://localhost:" + srv.address().port;
  const results = {};
  for (const native of [true, false]) {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const seen = []; const errors = [];
    page.on("pageerror", e => errors.push(String(e)));
    await page.route(/^https:\/\/advocate\.includeme\.uk\/api\//, async route => {
      const r = route.request();
      seen.push({ url: r.url(), method: r.method(), auth: r.headers()["authorization"] || null, ct: r.headers()["content-type"] || null, body: r.postDataBuffer() ? r.postDataBuffer().toString() : null });
      await route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify({ enabled: true, ok: true }) });
    });
    await page.route(/^http:\/\/localhost:\d+\/api\//, async route => { seen.push({ url: route.request().url(), local: true }); await route.fulfill({ status: 404, body: "{}" }); });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    if (native) await page.addInitScript(() => { window.Capacitor = { isNativePlatform: () => true, getPlatform: () => "android", Plugins: {} }; });
    await page.goto(origin + "/", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const probe = await page.evaluate(async () => {
      const out = {};
      out.hasShimClass = document.documentElement.classList.contains("is-native");
      out.pushManager = "PushManager" in window;
      try { out.swRegisterResult = navigator.serviceWorker ? String(await navigator.serviceWorker.register("sw.js")) : "no-sw-api"; } catch (e) { out.swRegisterResult = "threw: " + e.name; }
      const r = await fetch("/api/entitlement", { method: "POST", headers: { authorization: "Bearer test-token", "content-type": "application/json" }, body: JSON.stringify({ hello: "Paul" }) });
      out.status = r.status;
      await fetch(new URL("/api/config", location.origin));
      await fetch(new Request(location.origin + "/api/redeem?x=1", { method: "POST", body: JSON.stringify({ code: "ADV-TEST-0000" }), headers: { "content-type": "application/json" } }));
      await fetch("/privacy.html").then(r => out.privacyLocal = r.status);
      out.title = document.title;
      out.landingVisible = !!document.querySelector("#view-landing") && getComputedStyle(document.querySelector("#view-landing")).display !== "none";
      return out;
    });
    if (native) await page.screenshot({ path: OUT });
    results[native ? "native" : "plainBrowser"] = { probe, requests: seen, pageErrors: errors };
    await browser.close();
  }
  srv.close();
  console.log(JSON.stringify(results, null, 2));
  const n = results.native, ok =
    n.probe.hasShimClass && n.probe.swRegisterResult === "undefined" && n.probe.status === 200 && !n.probe.pushManager &&
    n.requests.some(r => r.url === "https://advocate.includeme.uk/api/entitlement" && r.method === "POST" && r.auth === "Bearer test-token" && r.body === '{"hello":"Paul"}') &&
    n.requests.some(r => r.url === "https://advocate.includeme.uk/api/config") &&
    n.requests.some(r => r.url === "https://advocate.includeme.uk/api/redeem?x=1" && r.method === "POST" && r.body === '{"code":"ADV-TEST-0000"}') &&
    !n.requests.some(r => r.local) && n.probe.landingVisible && n.pageErrors.length === 0 &&
    !results.plainBrowser.probe.hasShimClass && results.plainBrowser.requests.some(r => r.local);
  console.log(ok ? "RESULT: PASS" : "RESULT: FAIL");
  process.exit(ok ? 0 : 1);
})();
