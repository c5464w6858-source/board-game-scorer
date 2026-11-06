// Generates static, crawlable town pages for the Finder: /activities/<town>/
// Run: node scripts/generate-town-pages.mjs   (reads public listing rows, writes public/activities + sitemap + robots)
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "activities");
const URL_ = "https://ysoxkcuuphaivacqmgwr.supabase.co";
const KEY = "sb_publishable_fiRBs6eA8B8nWuaNthZyJA_Yp9LWyXx"; // public client key, same one the app ships
const SITE = "https://includeme.uk";
const MIN_LISTINGS = 3;

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slug = s => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const clip = (s, n) => { s = String(s || "").replace(/\s*Website:.*$/i, "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s; };

async function fetchAll() {
  const rows = [];
  for (let from = 0; ; from += 500) {
    const r = await fetch(`${URL_}/rest/v1/kv?select=key,value&key=like.activity:*&order=key&limit=500&offset=${from}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
    if (!r.ok) throw new Error("fetch failed " + r.status);
    const part = await r.json();
    rows.push(...part);
    if (part.length < 500) break;
  }
  return rows.map(r => ({ ...r.value, id: r.value?.id || r.key.replace("activity:", "") })).filter(a => a.name && a.location && a.status !== "hidden" && a.status !== "removed" && a.status !== "closed");
}

const style = `body{margin:0;font:16px/1.55 system-ui,-apple-system,Segoe UI,sans-serif;color:#1a2b2a;background:#f6faf9}
header{background:#0F6B5C;color:#fff;padding:14px 20px}header a{color:#fff;text-decoration:none;font-weight:700}
main{max-width:760px;margin:0 auto;padding:22px 18px 60px}h1{font-size:28px;line-height:1.2;margin:.2em 0 .4em}
.lead{color:#3b4f4d}.cta{display:inline-block;background:#E8663C;color:#fff;font-weight:700;padding:12px 20px;border-radius:10px;text-decoration:none;margin:10px 0 22px}
.card{background:#fff;border:1px solid #dbe7e5;border-radius:12px;padding:14px 16px;margin:0 0 12px}.card h2{font-size:18px;margin:0 0 4px}
.card .t{font-size:13px;color:#0F6B5C;font-weight:700;text-transform:uppercase;letter-spacing:.04em}.card p{margin:6px 0 8px}
.card a{color:#0F6B5C;font-weight:600}.towns a{display:inline-block;margin:4px 8px 4px 0;color:#0F6B5C}footer{font-size:13px;color:#5a6b69;margin-top:30px}`;

const page = ({ title, desc, canonical, body, ld }) => `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${canonical}">
<style>${style}</style>${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ""}</head><body>
<header><a href="${SITE}/">IncludeMe · SEND Activity Finder</a></header><main>${body}
<footer>Listings are information only. Check details with each provider before you go. Free to use, no sign-in needed. <a href="https://info.includeme.uk/">About IncludeMe</a> · <a href="${SITE}/privacy.html">Privacy</a></footer></main></body></html>`;

const acts = await fetchAll();
const byTown = new Map();
for (const a of acts) {
  const town = String(a.location).split(",")[0].trim();
  if (/^(nationwide|uk|northern ireland|wales|scotland|england)/i.test(town)) continue;
  if (!byTown.has(town)) byTown.set(town, []);
  byTown.get(town).push(a);
}
const towns = [...byTown.entries()].filter(([, l]) => l.length >= MIN_LISTINGS).sort((a, b) => b[1].length - a[1].length);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const urls = [`${SITE}/activities/`];

for (const [town, list] of towns) {
  const s = slug(town);
  const types = [...new Set(list.map(a => a.type).filter(Boolean))].slice(0, 4).join(", ").toLowerCase();
  const canonical = `${SITE}/activities/${s}/`;
  const title = `SEND activities and support in ${town} | IncludeMe`;
  const desc = `${list.length} clubs, therapies and groups for children with SEND in ${town}${types ? ` — including ${types}` : ""}. Free to search, with contact details.`;
  const cards = list.sort((a, b) => a.name.localeCompare(b.name)).map(a => `<div class="card"><div class="t">${esc(a.type || "Activity")}</div><h2>${esc(a.name)}</h2>
<p>${esc(clip(a.description, 210))}</p>${a.cost ? `<p><b>Cost:</b> ${esc(clip(a.cost, 60))}</p>` : ""}<a href="${SITE}/?id=${encodeURIComponent(a.id)}&utm_source=seo&utm_campaign=town_${s}">See details and contact →</a></div>`).join("\n");
  const others = towns.filter(([t]) => t !== town).slice(0, 14).map(([t]) => `<a href="/activities/${slug(t)}/">${esc(t)}</a>`).join(" ");
  const body = `<h1>SEND activities and support in ${esc(town)}</h1>
<p class="lead">${list.length} clubs, therapies and support services for children and young people with special educational needs and disabilities in and around ${esc(town)}. Use the free Finder to filter by age, need and accessibility, and see them on a map.</p>
<a class="cta" href="${SITE}/?utm_source=seo&utm_campaign=town_${s}">Search all of the UK in the Finder</a>
${cards}
<h2>Other places</h2><p class="towns">${others}</p>`;
  const ld = { "@context": "https://schema.org", "@type": "ItemList", name: title, itemListElement: list.slice(0, 50).map((a, i) => ({ "@type": "ListItem", position: i + 1, name: a.name, url: `${SITE}/?id=${encodeURIComponent(a.id)}` })) };
  mkdirSync(join(OUT, s), { recursive: true });
  writeFileSync(join(OUT, s, "index.html"), page({ title, desc, canonical, body, ld }));
  urls.push(canonical);
}

const hub = page({
  title: "SEND activities and support across the UK | IncludeMe",
  desc: `Find clubs, therapies and groups for children with SEND in ${towns.length} UK towns and cities. Free to search.`,
  canonical: `${SITE}/activities/`,
  body: `<h1>SEND activities and support across the UK</h1><p class="lead">Pick a town, or search everywhere in the free Finder.</p><a class="cta" href="${SITE}/?utm_source=seo&utm_campaign=town_hub">Open the Finder</a>
<p class="towns">${towns.map(([t, l]) => `<a href="/activities/${slug(t)}/">${esc(t)} (${l.length})</a>`).join(" ")}</p>`,
});
writeFileSync(join(OUT, "index.html"), hub);

writeFileSync(join(ROOT, "public", "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc></url>\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(ROOT, "public", "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Wrote ${towns.length} town pages from ${acts.length} listings`);
