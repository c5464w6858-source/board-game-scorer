// Optional: transactional email (welcome / listing alerts) via Resend.
// Deploy:  supabase functions deploy notify
// Secret:  supabase secrets set RESEND_API_KEY=...
//
// This is a TEMPLATE for the notifications beyond Supabase Auth's built-in
// verification + password-reset emails (those work automatically once email is
// configured — you do not need this function for them).
//
// Call it from the app, e.g. after a business signs up or when a listing gets a
// review:  await sb.functions.invoke("notify", { body: { to, subject, html } })

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  try {
    const { to, subject, html } = await req.json();
    if (!to || !subject) return new Response("missing fields", { status: 400 });

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "IncludeMe <hello@your-verified-domain.com>", // verify a domain in Resend
        to, subject, html: html || subject,
      }),
    });
    return new Response(await r.text(), { status: r.status });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});
