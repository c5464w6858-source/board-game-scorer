// Usage: node inject-shim.mjs <index.html in www>
// Adds the native shim <script> as the first thing in <head>, in the COPY only.
import { readFileSync, writeFileSync } from "node:fs";
const f = process.argv[2];
let html = readFileSync(f, "utf8");
if (html.includes("native-shim.js")) process.exit(0);
const tag = '<script src="native-shim.js"></script>';
if (!/<head>/i.test(html)) { console.error("inject-shim: no <head> found in " + f); process.exit(1); }
html = html.replace(/<head>/i, "<head>\n" + tag);
writeFileSync(f, html);
console.log("inject-shim: added " + tag + " to " + f);
