# Timeline Portfolio — "Time Travel Through My Career"

Interactive horizontal timeline experience. Dark editorial design
(warm paper ink, amber accent, serif display type), squircle cards,
WebGL 3D card world that mirrors the on-screen panes, Cmd+K time-jump
palette, recruiter summary one-pager, password-gated admin dashboard
(content overrides via localStorage), contact form with spam guard.

## Run locally
```bash
cd timeline-portfolio && ./start-site.sh   # serves on http://127.0.0.1:8138
```

## Files
- `index.html` / `app.js` / `styles.css` — timeline engine + design system
- `scenes3d.js` — Three.js squircle-slab world (aligns 3D panels to real DOM cards)
- `data.js` — ALL content (window.SITE + window.TIMELINE); admin overrides merge on top
- `summary.js` — recruiter one-pager overlay
- `character.js`, `enhancements.js` — ambient canvas character + particles
- `admin.html` / `admin.js` / `auth.js` — content editor (local, password-gated)
- `seo.html` — SEO/JSON-LD reference markup
- `ShivamSharma_Python_AgenticAI_4.5+_YOE.pdf` — current resume (committed; small file)
- `PRODUCTION.md` — Next.js production plan
