import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "store-assets");
const SRC = process.env.ADVOCATE_ICON || "/home/user/echp/icon-512.png";
// 512x512 Play icon (32-bit PNG, full square; Play applies its own mask)
await sharp(SRC).resize(512, 512).ensureAlpha().png().toFile(join(OUT, "play-icon-512.png"));
// 1024x500 feature graphic
const shot = await sharp(join(OUT, "android-phone/02-plan-review.png")).resize({ width: 260 }).extract({ left: 0, top: 0, width: 260, height: 330 }).png().toBuffer();
const mark = await sharp(SRC).resize(120, 120).png().toBuffer();
const svg = `<svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
<rect width="1024" height="500" fill="#17214D"/><rect y="488" width="1024" height="12" fill="#C98A00"/>
<text x="64" y="215" font-family="DejaVu Serif, serif" font-weight="700" font-size="64" fill="#F4F2EC">EHCP <tspan fill="#E3B94E">Tracker</tspan></text>
<text x="64" y="285" font-family="DejaVu Sans, sans-serif" font-size="30" fill="#F4F2EC">Every EHCP deadline and yearly</text>
<text x="64" y="327" font-family="DejaVu Sans, sans-serif" font-size="30" fill="#F4F2EC">review, in one place.</text>
<text x="64" y="395" font-family="DejaVu Sans, sans-serif" font-size="22" fill="#E3B94E">Your case stays on your device.</text></svg>`;
await sharp(Buffer.from(svg)).composite([
  { input: mark, left: 64, top: 36 },
  { input: shot, left: 700, top: 170 },
]).png().toFile(join(OUT, "play-feature-graphic-1024x500.png"));
