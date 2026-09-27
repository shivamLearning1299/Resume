/* ============================================================
   /api/contact — serverless email endpoint (Vercel)
   POST { email, name, message, website(honeypot), filledAt }
   Sends via Resend. Key lives ONLY in env var RESEND_API_KEY.
   Protections: honeypot, time-trap, size cap, per-IP rate limit,
   per-email rate limit, disposable-domain blocklist.
   ============================================================ */

// --- naive in-memory rate limit (per serverless instance) ---
const hits = new Map();
function rateLimited(key, windowMs, max) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}

const BLOCKED_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
  "yopmail.com", "trashmail.com", "temp-mail.org", "sharklasers.com",
]);

const TO = process.env.CONTACT_TO || "shivam12061999@gmail.com";
const FROM = process.env.CONTACT_FROM || "Portfolio Contact <onboarding@resend.dev>";

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, name, message, website, filledAt } = req.body || {};

    // --- trap 1: honeypot. Humans never see/fill #cfWebsite; bots do.
    if (website) return res.status(200).json({ ok: true }); // silently drop

    // --- trap 2: time-trap. Real humans need ≥3s to fill the form.
    const dt = Date.now() - (Number(filledAt) || 0);
    if (!Number.isFinite(dt) || dt < 3000) return res.status(200).json({ ok: true });

    // --- validation ---
    const em = String(email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))
      return res.status(400).json({ error: "Enter a valid email address." });
    if (BLOCKED_DOMAINS.has(em.split("@")[1]))
      return res.status(400).json({ error: "Please use a real email address." });
    const nm = String(name || "").trim().slice(0, 80);
    const msg = String(message || "").trim().slice(0, 4000);

    // --- rate limits ---
    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "?").split(",")[0];
    if (rateLimited("ip:" + ip, 10 * 60 * 1000, 5))       // 5 msgs / 10 min / IP
      return res.status(429).json({ error: "Too many messages. Try again later." });
    if (rateLimited("em:" + em, 60 * 60 * 1000, 2))       // 2 msgs / hour / email
      return res.status(429).json({ error: "This email already sent a message recently." });

    // --- send via Resend ---
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Email service not configured." });

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: em,
        subject: `Portfolio contact — ${nm || em}`,
        text: `From: ${nm || "(no name)"} <${em}>\nTime: ${new Date().toISOString()}\n\n${msg || "(no message)"}`,
        html: `<div style="font-family:system-ui;max-width:520px">
          <h3 style="margin:0 0 6px">Portfolio contact</h3>
          <p style="color:#666;margin:0 0 14px">${escapeHtml(nm || "Unknown")} &lt;${escapeHtml(em)}&gt;</p>
          <p style="white-space:pre-wrap">${escapeHtml(msg || "(no message)")}</p></div>`,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: "Email send failed.", detail: detail.slice(0, 200) });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error." });
  }
}
