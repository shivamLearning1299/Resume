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
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#12100d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12100d;padding:32px 0">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
  <tr><td style="padding:0 0 18px">
    <span style="font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.25em;color:#e8a33d;text-transform:uppercase">Portfolio · New message</span>
  </td></tr>
  <tr><td style="background:#1a1712;border:1px solid rgba(240,233,219,.1);border-radius:22px;padding:32px 34px">
    <p style="font-family:Georgia,'Iowan Old Style',serif;font-size:24px;color:#f0e9db;margin:0 0 6px;font-weight:600">${escapeHtml(nm || "New message")}</p>
    <p style="font-family:ui-monospace,Menlo,monospace;font-size:13px;color:#b3a995;margin:0 0 4px">
      <a href="mailto:${escapeHtml(em)}" style="color:#e8a33d;text-decoration:none">${escapeHtml(em)}</a>
    </p>
    <p style="font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#7a7260;margin:0 0 22px">${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})} IST</p>
    <div style="border-top:1px solid rgba(240,233,219,.09);padding-top:22px">
      <p style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.6;color:#f0e9db;margin:0;white-space:pre-wrap">${escapeHtml(msg || "(no message)")}</p>
    </div>
  </td></tr>
  <tr><td style="padding:16px 4px 0">
    <p style="font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.15em;color:#7a7260;margin:0">via shyvam1299.xyz — reply directly to respond</p>
  </td></tr>
</table>
</td></tr>
</table></body></html>`,
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
