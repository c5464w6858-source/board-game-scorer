// Builds assets/*.png from the app's logo glyph (passport-app/logo-passport.svg), then run: npx capacitor-assets generate
import sharp from 'sharp';
import { writeFileSync } from 'fs';
const PLUM = '#3B1F63', ORANGE = '#FF8A5B';
const glyph = (s) => `<g transform="translate(512 512) scale(${s}) translate(-26 -26.5)">
 <rect x="8" y="14" width="36" height="25" rx="5" fill="rgba(255,138,91,.16)" stroke="${ORANGE}" stroke-width="2"/>
 <circle cx="19" cy="23.5" r="4" fill="${ORANGE}"/>
 <path d="M12.5 34c0-3.6 2.9-5.5 6.5-5.5s6.5 1.9 6.5 5.5" stroke="${ORANGE}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
 <path d="M30 22.5h8M30 27.5h8M30 32.5h5" stroke="${ORANGE}" stroke-width="2.2" stroke-linecap="round" fill="none"/></g>`;
const svg = (inner, w = 1024, h = 1024) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`);
const bg = `<rect width="1024" height="1024" fill="${PLUM}"/>`;
// iOS / legacy: opaque, no alpha
await sharp(svg(bg + glyph(17))).flatten({ background: PLUM }).removeAlpha().png().toFile('assets/icon-only.png');
// Android adaptive: glyph kept inside the central 66% safe zone
await sharp(svg(glyph(14))).png().toFile('assets/icon-foreground.png');
await sharp(svg(bg)).removeAlpha().png().toFile('assets/icon-background.png');
// Splash: plum with centred glyph
const sp = (w, h) => svg(`<rect width="${w}" height="${h}" fill="${PLUM}"/><g transform="translate(${(w - 1024) / 2} ${(h - 1024) / 2}) translate(512 512) scale(6) translate(-512 -512)">${glyph(10)}</g>`.replace(/translate\(512 512\) scale\(6\) translate\(-512 -512\)/, ''), w, h);
const splash = async (name) => sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732"><rect width="2732" height="2732" fill="${PLUM}"/><g transform="translate(1366 1366) scale(1)">${glyph(11).replace('translate(512 512)', 'translate(0 0)')}</g></svg>`)).removeAlpha().png().toFile(name);
await splash('assets/splash.png'); await splash('assets/splash-dark.png');
console.log('assets written');
