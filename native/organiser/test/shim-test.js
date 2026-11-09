// Run: NODE_PATH=$(npm root -g) node test/shim-test.js   (needs www/ from `npm run sync`)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const WWW = path.join(__dirname, '..', 'www'), OUT = path.join(__dirname, '..', 'test-output');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const results = []; const ok = (name, pass, extra) => { results.push({ name, pass: !!pass, extra }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (extra ? '  -> ' + extra : '')); };

async function open(browser, native) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const seen = [];
  if (native) await ctx.addInitScript(() => {
    window.__calls = [];
    const rec = (n) => (a) => { window.__calls.push([n, JSON.stringify(a)]); return Promise.resolve({ uri: 'file:///cache/x' }); };
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android',
      Plugins: { StatusBar: { setStyle: rec('StatusBar.setStyle'), setBackgroundColor: rec('StatusBar.setBg') }, App: { addListener: rec('App.addListener'), exitApp: rec('exit') },
                 Filesystem: { writeFile: rec('Filesystem.writeFile') }, Share: { share: rec('Share.share') } } };
  });
  await ctx.route('**/*', async (route) => {
    const u = new URL(route.request().url()); seen.push(route.request().method() + ' ' + u.href);
    if (u.origin === 'https://localhost') {
      const f = path.join(WWW, u.pathname === '/' ? 'index.html' : u.pathname);
      if (fs.existsSync(f) && fs.statSync(f).isFile()) return route.fulfill({ status: 200, contentType: types[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
      return route.fulfill({ status: 404, body: 'nf' });
    }
    if (u.hostname === 'advocate.includeme.uk') return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"scan":true,"reminders":true,"publicKey":null}' });
    if (u.hostname.endsWith('supabase.co')) return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }, body: '{}' });
    if (u.hostname === 'includeme-passport.netlify.app') return route.fulfill({ status: 200, contentType: 'text/plain', headers: { 'access-control-allow-origin': '*' }, body: 'live' });
    return route.abort();
  });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto('https://localhost/', { waitUntil: 'load' });
  return { ctx, page, seen, errs };
}

(async () => {
  const browser = await chromium.launch();
  // ---------- native (mocked Capacitor) ----------
  let { ctx, page, seen, errs } = await open(browser, true);
  await page.waitForTimeout(800);
  ok('shim script is in the copied index.html', fs.readFileSync(path.join(WWW, 'index.html'), 'utf8').includes('native-shim.js'));
  ok('shim is NOT in the source passport-app/index.html', !fs.readFileSync('/home/user/board-game-scorer/passport-app/index.html', 'utf8').includes('native-shim'));
  ok('shim active (html.cap-native)', await page.evaluate(() => document.documentElement.classList.contains('cap-native')));
  const gateVisible = await page.evaluate(() => { const g = document.getElementById('gate'); return !!g && !g.hidden && g.getBoundingClientRect().height > 100; });
  ok('sign-in gate renders', gateVisible);
  ok('gate shows an email field and a password field', await page.evaluate(() => !!document.querySelector('#gEmail') && !!document.querySelector('input[type=password]')));
  await page.screenshot({ path: path.join(OUT, 'native-signin.png') });

  const r1 = await page.evaluate(() => fetch('/api/diary/config').then((r) => r.text()));
  ok('relative /api/diary/config -> advocate.includeme.uk', seen.includes('GET https://advocate.includeme.uk/api/diary/config') && r1.includes('scan'), seen.filter(s => s.includes('/api/')).join(' | '));
  await page.evaluate(() => fetch('https://localhost/api/diary/scan?x=1', { method: 'POST', body: '{}' }));
  ok('same-origin absolute /api/diary/scan?x=1 rewritten, method kept', seen.includes('POST https://advocate.includeme.uk/api/diary/scan?x=1'));
  await page.evaluate(() => fetch('/.netlify/functions/foo'));
  ok('/.netlify/functions/foo -> passport site', seen.includes('GET https://includeme-passport.netlify.app/.netlify/functions/foo'));
  await page.evaluate(() => fetch('/privacy.html').then((r) => r.text()));
  ok('bundled static file (/privacy.html) stays local', seen.includes('GET https://localhost/privacy.html') && !seen.includes('GET https://includeme-passport.netlify.app/privacy.html'));
  await page.evaluate(() => fetch('https://advocate.includeme.uk/api/diary/config'));
  ok('already-absolute external URL left alone', seen.filter((s) => s === 'GET https://advocate.includeme.uk/api/diary/config').length === 2);
  await page.evaluate(() => fetch('https://ysoxkcuuphaivacqmgwr.supabase.co/auth/v1/signup?redirect_to=' + encodeURIComponent('https://localhost/'), { method: 'POST', body: '{}' }));
  ok('Supabase redirect_to https://localhost/ -> live web app', seen.some((s) => s.includes('/auth/v1/signup?redirect_to=https%3A%2F%2Fincludeme-passport.netlify.app%2F')), seen.filter(s=>s.includes('supabase')).join(' | '));
  await page.evaluate(() => fetch('https://ysoxkcuuphaivacqmgwr.supabase.co/auth/v1/token?grant_type=password', { method: 'POST', body: '{}' }));
  ok('Supabase password sign-in URL left untouched', seen.includes('POST https://ysoxkcuuphaivacqmgwr.supabase.co/auth/v1/token?grant_type=password'));
  ok('sw.js never requested', !seen.some((s) => s.includes('sw.js')));
  ok('serviceWorker removed from navigator', await page.evaluate(() => !('serviceWorker' in navigator)));
  ok('PushManager removed', await page.evaluate(() => typeof window.PushManager === 'undefined'));
  ok('letter picker narrowed to images/pdf/text (no video)', await page.evaluate(() => (document.getElementById('scanFile').getAttribute('accept') || '').startsWith('image/*')));
  ok('safe-area CSS rule present', await page.evaluate(() => [...document.querySelectorAll('style')].some((s) => s.textContent.includes('safe-area-inset-top') && s.textContent.includes('cap-native'))));
  ok('status bar configured through plugin', await page.evaluate(() => window.__calls.some((c) => c[0] === 'StatusBar.setStyle')));
  // download interception
  await page.evaluate(() => { const b = new Blob(['{"a":1}'], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'backup.json'; document.body.appendChild(a); a.click(); });
  await page.waitForTimeout(500);
  const calls = await page.evaluate(() => window.__calls.map((c) => c[0]));
  ok('blob download -> Filesystem.writeFile then Share.share', calls.includes('Filesystem.writeFile') && calls.includes('Share.share'), calls.join(','));
  ok('share link https://localhost/#p=.. rewritten to live web app', await page.evaluate(() => window.__organiserNativeShim.fixLink('https://localhost/#p=z.abc') === 'https://includeme-passport.netlify.app/#p=z.abc'));
  await page.evaluate(() => navigator.share({ title: 'T', url: 'https://localhost/#p=z.q' }));
  ok('navigator.share uses the native Share plugin with fixed URL', await page.evaluate(() => window.__calls.some((c) => c[0] === 'Share.share' && c[1].includes('includeme-passport.netlify.app/#p=z.q'))));
  ok('no uncaught page errors', errs.length === 0, errs.join(' ; '));
  await ctx.close();

  // ---------- plain browser (no Capacitor): shim must do nothing ----------
  ({ ctx, page, seen, errs } = await open(browser, false));
  await page.waitForTimeout(500);
  ok('browser: shim inactive', await page.evaluate(() => !document.documentElement.classList.contains('cap-native') && !window.__organiserNativeShim));
  await page.evaluate(() => fetch('/api/diary/config').catch(() => 0));
  ok('browser: /api fetch untouched (stays on page origin)', seen.includes('GET https://localhost/api/diary/config'));
  ok('browser: serviceWorker still present', await page.evaluate(() => 'serviceWorker' in navigator));
  await ctx.close(); await browser.close();
  fs.writeFileSync(path.join(OUT, 'shim-test-results.json'), JSON.stringify(results, null, 1));
  process.exit(results.every((r) => r.pass) ? 0 : 1);
})();
