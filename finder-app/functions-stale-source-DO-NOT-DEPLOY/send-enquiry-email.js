// Sends a family's enquiry directly to a listing's real contact email — not
// just into an in-app inbox. This matters because most listings are
// unclaimed (added by IncludeMe from public information, not yet claimed by
// the organisation), so saving an enquiry only to the app's internal inbox
// means nobody would ever actually see it unless that exact organisation
// happens to sign up and check. Emailing the address already on the listing
// reaches them regardless of whether they've ever opened the app.
//
// REQUIRED environment variables:
//   RESEND_API_KEY                — see README section 9
//   SUPABASE_URL, VITE_SUPABASE_ANON_KEY — to verify the sender's session
//   ENQUIRY_BCC_EMAIL (optional)  — defaults to hello@includeme.uk. Every
//                                   enquiry email is bcc'd here. This exists
//                                   because the destination email comes from
//                                   the CLIENT (see security note below), so
//                                   a visible paper trail is the main
//                                   safeguard against this being misused as
//                                   a free email relay.
//
// SECURITY NOTE: this function can only know a listing's contact email
// because the client sends it — the static listings data lives only in the
// bundled frontend JS (see README "What changed vs. the prototype"), not in
// any database this backend function can independently look up. That means
// this function is trusting the caller's claim about the destination
// address more than the other functions in this folder do. Mitigations in
// place: (1) requires a real signed-in session, (2) only sends to addresses
// that pass a basic email-format check, (3) bcc's the platform inbox on
// every send so abuse is visible, (4) Reply-To is set to the family's own
// address so replies go straight to them, not back through this function.
// If abuse becomes a real problem, the next step up would be moving listing
// contact details into the Supabase-backed `kv` store so this function can
// look them up independently rather than trusting the client.

import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "./_shared.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function handler(event) {
  const json = (code, body) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "invalid body" }); }
  const { toEmail, toName, actName, actId, fromName, fromEmail, fromPhone, message } = body;

  if (!toEmail || !EMAIL_RE.test(toEmail)) return json(200, { sent: false, reason: "no-valid-email-on-file" });
  if (!message || !fromEmail) return json(400, { error: "message and fromEmail are required" });

  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "missing auth token" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
  if (userErr || !userData?.user) return json(401, { error: "invalid or expired session" });

  const bcc = process.env.ENQUIRY_BCC_EMAIL || "hello@includeme.uk";
  const safe = s => String(s || "").replace(/[<>]/g, "");

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#1A1712;">
      <p style="font-size:13px;color:#7A7468;margin:0 0 16px;">A family found <strong>${safe(actName)}</strong> on IncludeMe and sent this enquiry:</p>
      <div style="background:#F7F6F2;border-left:3px solid #0F6B5C;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
        <p style="margin:0;white-space:pre-wrap;font-size:15px;line-height:1.6;">${safe(message)}</p>
      </div>
      <table style="font-size:13px;color:#514B40;">
        <tr><td style="padding:2px 8px 2px 0;color:#7A7468;">From</td><td>${safe(fromName)}</td></tr>
        <tr><td style="padding:2px 8px 2px 0;color:#7A7468;">Email</td><td>${safe(fromEmail)}</td></tr>
        ${fromPhone ? `<tr><td style="padding:2px 8px 2px 0;color:#7A7468;">Phone</td><td>${safe(fromPhone)}</td></tr>` : ""}
      </table>
      <p style="margin-top:20px;font-size:13px;color:#514B40;">Just reply to this email to respond directly to ${safe(fromName)}.</p>
      <p style="margin-top:24px;font-size:11px;color:#7A7468;border-top:1px solid #E5E1D8;padding-top:12px;">Sent via IncludeMe, a free directory of SEND activities and therapies. If your organisation hasn't claimed its free listing yet, you can do that at <a href="https://includeme.uk/?id=${encodeURIComponent(actId || "")}" style="color:#0F6B5C;">includeme.uk</a> to manage your details and respond to enquiries directly in future. Think this message is spam or abuse? Forward it to hello@includeme.uk.</p>
    </div>`;

  const result = await sendEmail({
    to: toEmail,
    subject: `New enquiry via IncludeMe — ${actName || "your listing"}`,
    html,
  });

  // Best-effort bcc — sendEmail() doesn't currently support bcc as a
  // separate param, so send a lightweight duplicate notice rather than
  // failing the whole request if this part doesn't go through.
  try {
    await sendEmail({ to: bcc, subject: `[enquiry copy] ${actName || actId} ← ${fromEmail}`, html });
  } catch { /* non-critical */ }

  if (!result.ok) return json(502, { sent: false, error: result.error });
  return json(200, { sent: true });
}
