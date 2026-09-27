# CONTENT-TODO — real values needed from Shivam

All content lives in `data.js` (`window.SITE` + `window.TIMELINE`). Rule from the file: **never invent numbers**. Items below are placeholders or unverified and must be confirmed with Shivam before launch.

## Identity / links (`window.SITE`, top of data.js)

- [ ] **Email address** — `SITE.email` (line ~13). Currently `shivam@gmail.com` (explicit placeholder comment). Needed for: contact scene, `seo.html` JSON-LD, `/api/contact` recipient.
- [ ] **GitHub URL** — `SITE.github` (~line 14). Currently `https://github.com/` (bare placeholder). Need real profile URL.
- [ ] **Phone (optional)** — not present in `SITE`. Only add if Shivam wants it public; otherwise omit (email + LinkedIn is enough).
- [ ] **LinkedIn** — `SITE.linkedin` set to `linkedin.com/in/shivamsharma3ab` — confirm it resolves and is current.
- [ ] **Domain / canonical URL** — not in data.js yet. Needed for SEO meta (`seo.html`), OG URLs, `sitemap.ts` in the Next.js version. Pick the production domain.
- [ ] **Resume filename** — `SITE.resumeUrl` = `ShivamSharma_Python_AgenticAI_4.5+_YOE.pdf`. Confirm this is the final/current PDF in the folder.

## Experience accuracy

- [ ] **Trajector start date** — entry `id: "trajector"`, `date: "APR 2023 — NOW"`, `year: "2023"`. Confirm April 2023 is correct vs. the resume; this is the "2023 assumption" flagged in the brief (Acefone ends APR 2023, so it was inferred).
- [ ] **Acefone dates** — entry `id: "acefone"`, `date: "FEB 2021 — APR 2023"`. Confirm, and confirm title progression "Software Developer I → II".
- [ ] **Total experience** — `SITE.experience` = "4.5+ years", also restated in `id: "now"` hero body ("4.5 years"). Confirm current figure; it ages.

## Metrics / numbers (verify or delete — do not ship guesses)

All claims below need Shivam's confirmation (real measurement, correct order of magnitude):

- [ ] `trajector` points:
  - "thousands of client files/day" (EFS → S3 cron pipeline)
  - "6-hour manual review → 1-hour automated pipeline" (XHR interception)
  - "measurably faster API responses" — any concrete % or latency numbers?
- [ ] `proj-prreview`: "handles 50+ PRs / week".
- [ ] `acefone` points:
  - "billing errors to near 0%" (Stripe/Revolut)
  - "25K+ daily active users" (MMS/SMS over WebSockets)
  - "Azure AD SSO across 5+ internal systems"
  - "Xero … hours of manual finance effort weekly" — quantify if possible.
- [ ] `achievements`: "12th grade — 95%" and "International Mathematics Olympiad — All India Rank 105" — verify both.
- [ ] `education`: "Jaypee Institute of Information Technology (JIIT), Noida", "Graduated May 2021" — confirm.

## Project links

- [ ] **Demo / repo links** for projects `proj-nova`, `proj-rag`, `proj-prreview`, `proj-paygate` — none have URLs in data.js. Decide per project: public repo link, private-but-describable (company IP), or case-study write-up. If any stay private, keep as-is but confirm that's intended.
- [ ] Confirm project dates (`2024`, `2024`, `2025`, `2022`) are accurate.
- [ ] `proj-nova` title "NOVA VBMS" — confirm OK to name VBMS / the client context publicly; otherwise genericize.

## Positioning copy

- [ ] Hero `tagline` / `subline` and contact-scene `body` ("Targeting Senior SDE / AI Engineer roles…") — final wording sign-off.
- [ ] Skills clusters (`id: "skills"`) — confirm no missing or overstated tech before public launch.
