// Run: NODE_PATH=$(npm root -g) node test/screenshots.js
// Fictional child (Sam Doe, the same example child the app itself ships) is seeded into a throw-away headless browser profile only.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const WWW = path.join(__dirname, '..', 'www'), OUT = path.join(__dirname, '..', 'store-assets');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const SIZES = [['1290x2796', 430, 932, 3], ['1284x2778', 428, 926, 3], ['2048x2732', 1024, 1366, 2], ['1080x1920', 360, 640, 3]];
const SCREENS = [['overview', 'tabOverview', '01-overview'], ['appts', 'tabAppts', '02-diary'], ['contacts', 'tabContacts', '03-contacts'], ['portfolio', 'tabPortfolio', '04-portfolio'], ['view', 'tabView', '05-passport'], ['card', 'tabCard', '06-emergency-card']];
const day = (n) => { const d = new Date(Date.now() + n * 864e5); return d.toISOString().slice(0, 10); };
const seed = () => {
  const day = (n) => { const d = new Date(Date.now() + n * 864e5); return d.toISOString().slice(0, 10); };
  const sam = { id: 'pexample1', name: 'Sam Doe', preferred: 'Sam', dob: '2016-04-12', pronouns: 'he/him', languages: 'English',
    diagnoses: 'Autism\nASD with speech delay', strengths: 'Funny, kind to animals, brilliant memory for train timetables.', goals: 'Asking for help with words or a sign. Trying new foods.',
    medsChecked: day(-60), communication: 'Uses a few words and Makaton signs. Points and leads you by the hand. Says "no" by turning away.',
    helps: 'Warnings before changes. A visual timetable. Quiet space to retreat to.', upsets: 'Sudden noise. Changes to the plan without warning.', calming: 'Headphones, a weighted blanket, looking at his tablet.',
    sensory: 'Hand dryers and fire alarms are very hard. Likes deep pressure hugs.', likes: 'Trains, bubbles, swimming.', dislikes: 'Wet clothes, tags in tops.', food: 'Eats pasta, toast and fruit. Needs a cup with a lid.',
    personalCare: 'Needs help with toileting. Wears pull-ups at night.', sleep: 'Wakes around 5am. Settles with a story and music.', safety: 'Runs off in open spaces. Needs a hand held near roads.',
    allergies: [{ what: 'Peanuts', reaction: 'Hives and swollen lips', action: 'Give antihistamine, call 999 if breathing is affected' }],
    meds: [{ name: 'Melatonin', dose: '2mg', when: '7pm', forWhat: 'Sleep', prescriber: 'Dr A, paediatrician', notes: 'Not given at weekends unless asked' }],
    team: [{ role: 'GP', name: 'Dr B', org: 'Sample Surgery', phone: '01234 567890', email: '', notes: '' }, { role: 'Speech and language therapist', name: 'C', org: 'Sample Community Trust', phone: '', email: '', notes: 'Sees Sam fortnightly' }],
    school: { name: 'Sample Primary School', teacher: 'Mrs D', senco: 'Mr E', ehcp: 'Yes' },
    contacts: [{ name: 'Alex Doe', relationship: 'Parent', phone: '07700 900001', notes: 'Can collect' }, { name: 'Jo Doe', relationship: 'Grandparent', phone: '07700 900002', notes: 'Can collect' }],
    hide: [], appts: [
      { title: 'Paediatric review', when: day(6) + 'T10:30', who: 'Dr A', where: 'Sample Hospital, Clinic 3', notes: 'Bring the sleep diary', cat: 'Hospital', aid: 'aid1' },
      { title: 'Speech and language session', when: day(13) + 'T14:00', who: 'C', where: 'Sample Community Trust', notes: '', cat: 'Therapy', aid: 'aid2' },
      { title: 'Annual review meeting', when: day(27) + 'T09:15', who: 'Mrs D and Mr E', where: 'Sample Primary School', notes: 'EHCP annual review', cat: 'Review meeting', aid: 'aid3' }],
    portfolio: [
      { area: 'Communication', kind: 'can', text: 'Uses five Makaton signs without prompting', source: 'Speech and language review', date: day(-50) },
      { area: 'Communication', kind: 'working on', text: 'Is learning to ask for help with a word or sign', source: 'Speech and language review', date: day(-50) },
      { area: 'Sensory', kind: 'difficulty', text: 'Finds hand dryers and fire alarms very hard, and copes with headphones', source: 'School report', date: day(-70) },
      { area: 'Understanding and learning', kind: 'can', text: 'Follows a two-step instruction at lunch with a prompt', source: 'School report', date: day(-70) },
      { area: 'Interests and play', kind: 'enjoys', text: 'Enjoys trains, bubbles and swimming', source: 'School report', date: day(-70) },
      { area: 'Communication', kind: 'next step', text: 'Practise asking for help at snack time', source: 'Speech and language review', date: day(-50) }],
    updated: new Date().toISOString() };
  localStorage.setItem('includeme.passport.v1', JSON.stringify({ profiles: [sam], current: 'pexample1', deleted: {}, deletedDocs: {} }));
  localStorage.setItem('includeme.passport.prefs.v1', JSON.stringify({ cloud: false, docs: false, consent: false, leadDays: 3 }));
  localStorage.setItem('includeme.passport.joined', '1');
  localStorage.setItem('includeme.passport.auth.v1', JSON.stringify({ access_token: 'x'.repeat(40), refresh_token: 'y', expires_at: Date.now() + 1e8, email: 'parent@example.com' }));
};
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [label, w, h, dpr] of SIZES) {
    const dir = path.join(OUT, label); fs.mkdirSync(dir, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: w < 600, hasTouch: true });
    await ctx.addInitScript(seed);
    await ctx.addInitScript(() => { window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {} }; });
    await ctx.route('**/*', async (route) => {
      const u = new URL(route.request().url());
      if (u.origin === 'https://localhost') { const f = path.join(WWW, u.pathname === '/' ? 'index.html' : u.pathname); if (fs.existsSync(f) && fs.statSync(f).isFile()) return route.fulfill({ status: 200, contentType: types[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); return route.fulfill({ status: 404, body: '' }); }
      if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') return route.abort();
      return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"scan":true,"reminders":true,"publicKey":null}' });
    });
    const page = await ctx.newPage(); await page.goto('https://localhost/', { waitUntil: 'load' }); await page.waitForTimeout(1200);
    for (const [, tab, name] of SCREENS) {
      // tabs inside menus need the menu opened first, so call the click handler directly
      await page.evaluate((id) => document.getElementById(id).click(), tab); await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(dir, name + '.png') });
    }
    await ctx.close();
  }
  await browser.close();
})();
