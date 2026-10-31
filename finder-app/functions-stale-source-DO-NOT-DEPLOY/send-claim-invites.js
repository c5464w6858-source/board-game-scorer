// Sends claim-invite emails to providers, inviting them to claim their
// existing listing. Admin-only. Sends in the batch the admin selected, each a
// tailored, branded HTML email with a one-click claim link straight to that
// provider's own listing (includeme.uk/?id=<listingId>&claim=1).
//
// Deliverability guardrails:
//   - Admin-only (verified against ADMIN_EMAILS).
//   - Caps a single call at 40 recipients so nothing fires hundreds at once.
//   - Records who's already been invited (claim_invited:<id>) so you don't
//     accidentally re-spam the same provider on a later batch.
//
// REQUIRED env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY,
//               RESEND_API_KEY, SITE_URL (optional, defaults to includeme.uk)

import { createClient } from "@supabase/supabase-js";
import { adminClient, sendEmail } from "./_shared.js";

const ADMIN_EMAILS = ["paul_whitehouse1@yahoo.co.uk"];
const MAX_BATCH = 40;

function claimEmailHtml({ orgName, listingName, location, claimUrl, siteUrl }) {
  const safe = s => String(s || "").replace(/[<>]/g, "");
  const org = safe(orgName) || "there";
  const name = safe(listingName);
  const loc = safe(location);
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Claim your listing on IncludeMe</title></head>
<body style="margin:0;padding:0;background:#EFEDE7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEDE7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(26,23,18,0.08);">

        <!-- Header / brand -->
        <tr><td style="background:#0F6B5C;padding:30px 36px 26px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;">
              <div style="width:44px;height:44px;background:#ffffff;border-radius:12px;text-align:center;line-height:44px;font-size:0;">
                <span style="display:inline-block;width:9px;height:9px;background:#0F6B5C;border-radius:50%;margin:0 1px;"></span>
                <span style="display:inline-block;width:9px;height:9px;background:#2E8C7B;border-radius:50%;margin:0 1px;"></span>
              </div>
            </td>
            <td style="vertical-align:middle;padding-left:12px;">
              <span style="color:#ffffff;font-size:19px;font-weight:700;letter-spacing:-0.3px;">IncludeMe</span>
            </td>
          </tr></table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:34px 36px 10px;">
          <h1 style="margin:0 0 6px;font-size:22px;line-height:1.25;color:#1A1712;font-weight:700;letter-spacing:-0.4px;">Your listing is already live on IncludeMe</h1>
          <p style="margin:0 0 20px;font-size:14px;color:#7A7468;">Claim it for free to manage your details and reach more families.</p>

          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#33302A;">Hi ${org},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#33302A;">
            IncludeMe is a free UK directory that helps parents and carers of children with special educational needs and disabilities (SEND) find activities, therapies, clubs and support near them — all in one place, searchable by location, age and type of need. It was built to fix a problem many families know well: that inclusive provision exists, but it's scattered and genuinely hard to find.
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#33302A;">
            <strong style="color:#0F6B5C;">${name}</strong>${loc ? ` in ${loc}` : ""} is already listed, so families searching the directory can find you right now. We'd love for you to claim your listing so the information stays accurate and you can make the most of it.
          </p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.65;color:#33302A;">Claiming is free and takes under 5 minutes. It lets you:</p>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
            ${[
              ["✏️", "Update your description, photos and contact details"],
              ["🗓️", "Add holiday clubs and session dates families can book"],
              ["🟢", "Show real-time availability so families know when there's space"],
              ["📊", "See how many families have viewed and saved your listing"],
            ].map(([icon, text]) => `
            <tr><td style="padding:5px 0;vertical-align:top;width:26px;font-size:15px;">${icon}</td>
                <td style="padding:5px 0;font-size:14px;line-height:1.5;color:#33302A;">${text}</td></tr>`).join("")}
          </table>

          <!-- CTA -->
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 14px;"><tr>
            <td align="center" style="border-radius:12px;background:#0F6B5C;">
              <a href="${claimUrl}" style="display:inline-block;padding:15px 34px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">Claim ${name} →</a>
            </td>
          </tr></table>
          <p style="margin:0 0 24px;text-align:center;font-size:12.5px;color:#A8A296;">or copy this link: <span style="color:#7A7468;">${claimUrl}</span></p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:0 36px 34px;border-top:1px solid #EFEDE7;padding-top:22px;">
          <p style="margin:0 0 4px;font-size:13px;line-height:1.6;color:#7A7468;">Any questions, just reply to this email — a real person will help.</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#7A7468;">Warm wishes,<br><strong style="color:#33302A;">The IncludeMe team</strong></p>
          <p style="margin:18px 0 0;font-size:11px;color:#B3AEA3;">
            You received this because ${name} is publicly listed on IncludeMe. If you'd prefer we remove your listing or not contact you again, just reply and we'll sort it right away. IncludeMe · ${siteUrl}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function handler(event) {
  const json = (c, b) => ({ statusCode: c, headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });

  let p;
  try { p = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "invalid body" }); }
  const { recipients } = p; // [{id, email, orgName, listingName, location}]
  if (!Array.isArray(recipients) || recipients.length === 0) return json(400, { error: "recipients required" });
  if (recipients.length > MAX_BATCH) return json(400, { error: `Max ${MAX_BATCH} per batch — select fewer.` });

  // Admin only.
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "missing auth token" });
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
  if (userErr || !userData?.user) return json(401, { error: "invalid session" });
  if (!ADMIN_EMAILS.includes((userData.user.email || "").toLowerCase())) return json(403, { error: "admin only" });

  const sb = adminClient();
  const siteUrl = (process.env.SITE_URL || "https://includeme.uk").replace(/\/$/, "");

  let sent = 0, failed = 0, skipped = 0;
  const results = [];

  for (const r of recipients) {
    if (!r.email || !r.id) { skipped++; continue; }
    const claimUrl = `${siteUrl}/?id=${encodeURIComponent(r.id)}&claim=1`;
    const html = claimEmailHtml({
      orgName: r.orgName, listingName: r.listingName || r.name, location: r.location,
      claimUrl, siteUrl,
    });
    const res = await sendEmail({
      to: r.email,
      subject: `Claim your free listing on IncludeMe — ${r.listingName || r.name}`,
      html,
    });
    if (res.ok) {
      sent++;
      // Record the invite so future batches can skip already-contacted providers.
      try { await sb.from("kv").upsert({ key: `claim_invited:${r.id}`, value: { id: r.id, email: r.email, invitedAt: new Date().toISOString() } }, { onConflict: "key" }); } catch {}
      results.push({ id: r.id, ok: true });
    } else {
      failed++;
      results.push({ id: r.id, ok: false, error: res.error });
    }
  }

  return json(200, { sent, failed, skipped, results });
}
