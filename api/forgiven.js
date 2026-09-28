/* /api/forgiven — lets me know she pressed "I forgive you".
   Protected by a shared token in the page + per-IP rate limit. */
const NOTIFY_TO = process.env.FORGIVEN_TO || "shivam12061999@gmail.com";
const TOKEN = process.env.FORGIVEN_TOKEN || "priyam-angel-29";

const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 3;                 // max 3 notifications / 10 min / IP
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { token } = req.body || {};
    if (token !== TOKEN) return res.status(403).json({ error: "no" });

    const ip = String(req.headers["x-forwarded-for"] || "?").split(",")[0];
    if (limited(ip)) return res.status(200).json({ ok: true }); // silent

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "not configured" });

    const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || "Portfolio Contact <contact@shyvam1299.xyz>",
        to: [NOTIFY_TO],
        subject: "💛 She forgave you.",
        html: `<div style="font-family:Georgia,serif;max-width:480px;margin:auto;padding:36px 28px;background:#fff6ec;border-radius:22px;color:#4a3728">
          <p style="font-family:Menlo,monospace;font-size:11px;letter-spacing:2px;color:#e8788a;text-transform:uppercase;margin:0 0 12px">for-her-priyam</p>
          <p style="font-size:22px;margin:0 0 8px;font-weight:600">She forgave you. 🎉</p>
          <p style="font-size:15px;color:#8a7361;margin:0">${when} IST — "I forgive you" pressed on the sorry page.</p>
          <p style="font-size:13px;color:#8a7361;margin:18px 0 0">Go be nice. — your robot assistant</p>
        </div>`,
        text: `She pressed "I forgive you" at ${when} IST.`,
      }),
    });
    if (!r.ok) return res.status(502).json({ error: "send failed" });
    return res.status(200).json({ ok: true });
  } catch (e) { return res.status(500).json({ error: "error" }); }
}
