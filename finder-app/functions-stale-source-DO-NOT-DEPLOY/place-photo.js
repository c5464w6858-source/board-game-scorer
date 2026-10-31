// Serverless proxy for Google Places (New) listing photos.
// Keeps GOOGLE_PLACES_API_KEY server-side. Deployed automatically by Netlify
// from this folder and exposed at /api/place-photo (see netlify.toml redirect).
//
// Vercel users: move this to /api/place-photo.js and export a default
// (req, res) handler instead — the Google calls below are identical.

export async function handler(event) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const q = (event.queryStringParameters && event.queryStringParameters.q) || "";
  const w = (event.queryStringParameters && event.queryStringParameters.w) || "640";

  const json = (code, body) => ({
    statusCode: code,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" },
    body: JSON.stringify(body),
  });

  if (!key) return json(200, { url: null, note: "GOOGLE_PLACES_API_KEY not set" });
  if (!q) return json(400, { error: "missing q" });

  try {
    const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.photos",
      },
      body: JSON.stringify({ textQuery: q, regionCode: "GB", maxResultCount: 1 }),
    });
    const data = await r.json();
    const photoName = data?.places?.[0]?.photos?.[0]?.name;
    const url = photoName
      ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${encodeURIComponent(w)}&key=${key}`
      : null;
    return json(200, { url });
  } catch (e) {
    return json(200, { url: null, error: String(e) });
  }
}
