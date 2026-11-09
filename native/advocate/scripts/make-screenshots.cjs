// Store screenshots from the live demo (made-up cases: Sam Doe, Maya Doe). Run: NODE_PATH=$(npm root -g) node scripts/make-screenshots.cjs
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs");
const OUT = path.join(__dirname, "..", "store-assets");
const SIZES = {
  "iphone-6.9": { w: 1290, h: 2796, dsf: 3, mobile: true },
  "iphone-6.5": { w: 1284, h: 2778, dsf: 3, mobile: true },
  "ipad-13":    { w: 2048, h: 2732, dsf: 2, mobile: false },
  "android-phone": { w: 1080, h: 1920, dsf: 3, mobile: true },
};
// [file name, url, steps run in the page]
const SHOTS = [
  ["01-deadlines", "/?demo=1", "switchView('dash')"],
  ["02-plan-review", "/?demo=plan", "switchView('plan')"],
  ["03-files", "/?demo=1", "openFiles()"],
  ["04-provision", "/?demo=plan", "switchView('provision')"],
  ["05-contacts", "/?demo=1", "switchView('contacts')"],
  ["06-letters", "/?demo=1", "switchView('chrono');setDocTab('letters')"],
];
(async () => {
  const browser = await chromium.launch();
  for (const [dir, s] of Object.entries(SIZES)) {
    fs.mkdirSync(path.join(OUT, dir), { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: Math.round(s.w / s.dsf), height: Math.round(s.h / s.dsf) }, deviceScaleFactor: s.dsf, isMobile: s.mobile, hasTouch: s.mobile, locale: "en-GB" });
    for (const [name, url, js] of SHOTS) {
      const page = await ctx.newPage();
      await page.route(/\/api\/hit/, r => r.fulfill({ status: 204 }));   // do not count store-screenshot visits
      await page.goto("https://advocate.includeme.uk" + url, { waitUntil: "networkidle" });
      await page.addStyleTag({ content: "#payBar,.install-banner,#updBar{display:none!important}" });
      await page.evaluate(js);
      await page.waitForTimeout(900);
      await page.evaluate(() => window.scrollTo(0, 0));
      const file = path.join(OUT, dir, name + ".png");
      await page.screenshot({ path: file });
      await page.close();
      console.log(dir, name);
    }
    await ctx.close();
  }
  await browser.close();
})();
