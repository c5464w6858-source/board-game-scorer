// Scheduled function: sends the admin's own daily digest (new sign-ups,
// pending claims, suggestions, enquiries) — configured via the "Digest" tab
// in the in-app admin panel.
//
// NOTE ON TIMING: the admin panel lets you pick a "send time" (e.g. 08:00),
// but Netlify's schedule is fixed at deploy time, not driven by data in the
// database. This function runs once daily at 08:00 UTC regardless of what's
// saved — if you want a different fixed time, change the cron expression
// below and redeploy. This is a deliberate MVP simplification, not a bug.
//
// REQUIRED environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// RESEND_API_KEY (see send-weekly-digest.js for details on each).

import { adminClient, kvGet, kvListByPrefix, sendEmail } from "./_shared.js";

export const config = { schedule: "0 8 * * *" }; // daily at 08:00 UTC

function isToday(d) {
  if (!d) return false;
  const x = new Date(d), t = new Date();
  return x.toDateString() === t.toDateString();
}

function section(title, items) {
  if (!items.length) return `<p style="color:#7A7468;font-size:13px;"><strong>${title}:</strong> none today</p>`;
  return `<div style="margin-bottom:14px;"><strong style="color:#0F6B5C;">${title} (${items.length})</strong>
    <ul style="margin:6px 0 0;padding-left:18px;color:#514B40;font-size:13px;">
      ${items.map(i => `<li>${i}</li>`).join("")}
    </ul></div>`;
}

export async function handler() {
  const sb = adminClient();
  const sub = await kvGet(sb, "admin_email_sub");
  if (!sub || !sub.email) return { statusCode: 200, body: "skipped: no admin digest configured" };

  const [userRows, claimRows, suggestionRows, enquiryRows] = await Promise.all([
    kvListByPrefix(sb, "user:"),
    kvListByPrefix(sb, "claim:"),
    kvListByPrefix(sb, "suggestion:"),
    kvListByPrefix(sb, "enquiries:"),
  ]);

  const include = sub.include || { newSignups: true, claimRequests: true, suggestions: true, enquiries: true };
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#1A1712;">
      <h2 style="color:#0F6B5C;">IncludeMe — daily digest</h2>
      ${include.newSignups ? section("New sign-ups today", userRows.map(r => r.value).filter(u => isToday(u?.createdAt)).map(u => `${u.name || u.email} (${u.accountType})`)) : ""}
      ${include.claimRequests ? section("Pending claim requests", claimRows.map(r => r.value).filter(c => c?.status === "pending").map(c => `${c.actName} — ${c.claimantName}`)) : ""}
      ${include.suggestions ? section("New suggestions today", suggestionRows.map(r => r.value).filter(s => isToday(s?.at) && s?.status === "new").map(s => s.name || s.activityName || "Suggestion")) : ""}
      ${include.enquiries ? section("Enquiries today", enquiryRows.map(r => r.value || []).flat().filter(e => isToday(e?.sentAt)).map(e => `${e.actName} — from ${e.fromName}`)) : ""}
      <p style="margin-top:20px;font-size:12px;color:#7A7468;">Sent automatically by IncludeMe's daily digest function.</p>
    </div>`;

  const result = await sendEmail({ to: sub.email, subject: "IncludeMe — daily digest", html });
  return { statusCode: result.ok ? 200 : 500, body: result.ok ? "sent" : result.error };
}
