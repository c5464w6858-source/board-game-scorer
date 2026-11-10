// Checks the native-only download and print fallbacks of shim/native-shim.js with a mocked Capacitor.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const shim = fs.readFileSync(path.join(__dirname, '..', 'shim', 'native-shim.js'), 'utf8');
  const b = await chromium.launch(); const p = await b.newPage();
  await p.route('**/*', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><body><p id="x">hi</p></body>' }));
  await p.addInitScript(() => {
    window.__calls = [];
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {
      Filesystem: { writeFile: async o => { window.__calls.push('writeFile:' + o.path + ':' + o.directory); return { uri: 'file:///cache/' + o.path }; } },
      Share: { share: async o => { window.__calls.push('share:' + o.url); } },
      App: { addListener() {} }, StatusBar: { setStyle() {}, setBackgroundColor() {} } } };
  });
  await p.goto('https://localhost/');
  await p.addScriptTag({ content: shim });
  const res = await p.evaluate(async () => {
    const out = {};
    const blobUrl = URL.createObjectURL(new Blob(['BEGIN:VCALENDAR'], { type: 'text/calendar' }));
    const a = document.createElement('a'); a.href = blobUrl; a.download = 'dates'; document.body.appendChild(a); a.click();
    await new Promise(r => setTimeout(r, 400));
    out.calls = window.__calls;
    out.canShareFiles = navigator.canShare ? navigator.canShare({ files: [new File(['x'], 'a.txt')] }) : 'no canShare';
    window.print();
    out.toast = (document.querySelector('[role=status]') || {}).textContent || '';
    return out;
  });
  console.log(JSON.stringify(res, null, 1));
  const ok = res.calls.some(c => /^writeFile:dates\.ics:CACHE/.test(c)) && res.calls.some(c => /^share:file:\/\/\/cache\/dates\.ics/.test(c)) && res.canShareFiles === false && /Printing is not available/.test(res.toast);
  console.log('RESULT:', ok ? 'PASS' : 'FAIL'); await b.close(); process.exit(ok ? 0 : 1);
})();
