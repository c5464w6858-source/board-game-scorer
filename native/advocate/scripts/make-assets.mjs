// Generates app icons and splash images from the website's icon-512.png (the only full-size icon source).
// Run: npm run assets   (uses sharp). Output goes into android/ and ios/ resource folders.
import sharp from "sharp";
import { mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.env.ADVOCATE_ICON || "/home/user/echp/icon-512.png";
const BG = { r: 28, g: 39, b: 51 };           // #1C2733, the icon's own background
const RES = join(HERE, "android/app/src/main/res");

// The mark (letter A, timeline dots) sits inside this box of the 512px icon; everything else is flat background.
const MARK = { left: 30, top: 70, width: 452, height: 282 };

const base = sharp(SRC);
const mark = () => sharp(SRC).extract(MARK);
const solid = (w, h) => sharp({ create: { width: w, height: h, channels: 3, background: BG } });

async function fullIcon(size) {
  return sharp(SRC).resize(size, size, { kernel: "lanczos3" }).flatten({ background: BG }).removeAlpha().png().toBuffer();
}
async function roundIcon(size) {
  const full = await fullIcon(size);
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);
  return sharp(full).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
}
async function adaptiveForeground(size) {
  // 108dp canvas; the visible area is a 72dp circle, so keep the mark inside about 60% of the width
  const w = Math.round(size * 0.6), h = Math.round(w * MARK.height / MARK.width);
  const m = await mark().resize(w, h, { kernel: "lanczos3" }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: m, left: Math.round((size - w) / 2), top: Math.round((size - h) / 2) }]).png().toBuffer();
}
async function splash(w, h) {
  const mw = Math.round(Math.min(w, h) * 0.42), mh = Math.round(mw * MARK.height / MARK.width);
  const m = await mark().resize(mw, mh, { kernel: "lanczos3" }).png().toBuffer();
  return solid(w, h).composite([{ input: m, left: Math.round((w - mw) / 2), top: Math.round((h - mh) / 2) }]).png().toBuffer();
}

// iOS: 1024x1024, no alpha channel
await sharp(await fullIcon(1024)).removeAlpha().png().toFile(join(HERE, "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"));

// Android launcher icons
const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, k] of Object.entries(dens)) {
  const dir = join(RES, `mipmap-${d}`);
  await sharp(await fullIcon(Math.round(48 * k))).toFile(join(dir, "ic_launcher.png"));
  await sharp(await roundIcon(Math.round(48 * k))).toFile(join(dir, "ic_launcher_round.png"));
  await sharp(await adaptiveForeground(Math.round(108 * k))).toFile(join(dir, "ic_launcher_foreground.png"));
}

// Splash images: reuse the sizes Capacitor created
const splashFiles = {
  "drawable/splash.png": [480, 320],
  "drawable-land-mdpi/splash.png": [480, 320], "drawable-land-hdpi/splash.png": [800, 480],
  "drawable-land-xhdpi/splash.png": [1280, 720], "drawable-land-xxhdpi/splash.png": [1600, 960], "drawable-land-xxxhdpi/splash.png": [1920, 1280],
  "drawable-port-mdpi/splash.png": [320, 480], "drawable-port-hdpi/splash.png": [480, 800],
  "drawable-port-xhdpi/splash.png": [720, 1280], "drawable-port-xxhdpi/splash.png": [960, 1600], "drawable-port-xxxhdpi/splash.png": [1280, 1920],
};
for (const [f, [w, h]] of Object.entries(splashFiles)) {
  const out = join(RES, f);
  if (existsSync(dirname(out))) await sharp(await splash(w, h)).toFile(out);
}
const ios = join(HERE, "ios/App/App/Assets.xcassets/Splash.imageset");
for (const n of ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]) {
  await sharp(await splash(2732, 2732)).toFile(join(ios, n));
}
console.log("assets generated");
