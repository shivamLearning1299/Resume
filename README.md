# Shivam Sharma — Portfolio Design System

A personal portfolio design system for **Shivam Sharma**, a backend software developer based in NCR, India, with 4+ years of experience in Node.js, PHP, Python, and AI agent systems. This system powers an interactive, journey-style portfolio website.

## Source Material

The design system was reverse-engineered from a single existing artifact:

- **GitHub repo:** `shivamLearning1299/Resume` (default branch: `main`)
- **Source file:** `source_resume/index.html` — a single-page dark-themed resume/portfolio using Syne, DM Mono, and Inter fonts with a cosmic gradient aesthetic.

The brief for the new portfolio: make it a **journey** — each chapter is an interactive "stop" representing where Shivam worked, what he built there, and what he learned. Every element should feel responsive and alive.

## Brand Personality at a Glance

- **Quietly confident.** Numbers speak: "4+ years", "2.5M docs synced", "75% efficiency boost".
- **Technical but human.** DM Mono labels (`// languages`, `years_experience`) sit next to warm, first-person prose.
- **Cosmic / late-night coder.** Deep navy backgrounds, floating gradient orbs, subtle noise, glowing dots.
- **Understated personality.** Lowercase nav, `SS.` monogram, one emoji flag in the avatar badge — restrained.

---

## Content Fundamentals

### Voice & Tone
- **First person, present-tense.** "I'm a backend-focused software developer…" "I thrive at the intersection…". Warm but direct.
- **Confident, outcome-oriented.** Every experience bullet leads with a verb and closes with a measurable impact: *"Boosted billing team's efficiency by 75% with Xero invoice automation."*
- **No hype words.** Avoids "synergy", "disruptive", "game-changing". Instead uses concrete verbs: built, integrated, engineered, designed, shipped, slashed.
- **Casual section titles, serious content.** Section headings are familiar and conversational: *"Who I am."* — *"Where I've worked."* — *"Tools of the trade."* — *"Let's connect."*

### Casing & Punctuation
- **Nav & micro-labels:** all lowercase (`about`, `experience`, `stack`, `contact`).
- **Section tags:** numbered + lowercase + uppercased via CSS (`01. about`, `02. experience`) with `letter-spacing: 0.15em`.
- **Headings:** Sentence case with a trailing period ("Who I am.", "Let's connect.").
- **Skill group labels:** commented-code style (`// languages`, `// cloud & infra`).
- **Stat labels:** `snake_case` (`years_experience`, `gem_award_winner`, `docs_synced`) — reinforces the "engineer" vibe.

### Writing Patterns
- **Body copy addresses "you" implicitly** — the author speaks *to* the reader without saying "you". ("If you think there's a fit, feel free to reach out.")
- **Em dashes for rhythm.** "…specializing in Node.js, PHP & Python — with hands-on experience…"
- **Technology lists feel like tags, not prose.** Always rendered as pills/chips, never in sentences.
- **Emoji usage is restrained.** Used only: (a) the 🇮🇳 flag pill on the avatar, (b) tech-stack icons (🟨 🐍 🟢 etc.), (c) 🏆 and 🧮 for achievements, (d) ✉️📞💼🧩 for contact links. Never used in body prose.

### Example copy snippets
- Hero tagline: *"Software Developer · Backend Engineer · Ai Systems"* (dot separators, DM Mono).
- Status pill: *"Available for new opportunities"* with a pulsing dot.
- CTA pair: **Get in touch** (primary) / **View experience ↓** (secondary, with arrow).
- Footer: *"Built by Shivam Sharma · 2026 · NCR, India"*.

---

## Visual Foundations

### Palette
The entire system lives on a deep navy (`#050810`) base. A tri-color gradient — **electric blue → violet → mint green** — is the signature motif, used for accents, highlighted words, numerals, and button fills.

| Role | Value | Notes |
|---|---|---|
| `--bg` | `#050810` | Page background, near-black with a blue cast |
| `--surface` | `#0d1117` | Cards, "experience" section bg |
| `--surface2` | `#161b27` | Tags, pills, nested surfaces |
| `--border` | `rgba(255,255,255,0.07)` | Barely-there hairlines |
| `--accent` | `#4f8ef7` | Electric blue — primary |
| `--accent2` | `#7c3aed` | Violet — secondary |
| `--accent3` | `#06d6a0` | Mint green — success / highlights |
| `--text` | `#e8eaf0` | Soft off-white body |
| `--muted` | `#6b7280` | Metadata, labels |

### Typography
Three-family system, each with a precise role:

- **Syne (800)** — display. Hero name, section titles, stat numerals, card titles. Tight tracking (`letter-spacing: -2px` to `-3px`).
- **DM Mono (400)** — mono labels. Nav links, tags, section numbers, stat captions, metadata pills, button text.
- **Inter (300/400/500)** — body copy. Paragraphs, descriptions, everything readable.

Heavy contrast: display sizes scale fluidly `clamp(48px, 7vw, 88px)` for the hero, `clamp(32px, 5vw, 52px)` for section headings.

### Spacing
- Section vertical padding: `120px` top/bottom (80px on mobile).
- Container max-width: `1100px`, padding `0 40px` desktop / `0 24px` mobile.
- Card internal padding: `24px–40px` depending on weight.
- Grid gaps: `16px` (tech grid), `20–32px` (mid), `60–80px` (major grids).

### Backgrounds & Atmosphere
- **Noise overlay** — fixed SVG fractal noise at `opacity: 0.04`, whole-page `z-index: 0`.
- **Gradient orbs** — three large blurred circles (`filter: blur(120px)`), drifting with a 20s ease-in-out alternating animation. Blue, violet, mint. Positioned top-left / bottom-right / center.
- **Glass nav** — `rgba(5,8,16,0.8)` with `backdrop-filter: blur(20px)` and a hairline border.
- **No hand-drawn illustrations.** Cosmic atmosphere is built entirely from CSS gradients, blurs, and noise.

### Borders, Corners, Shadows
- **Radii:** `6px` (small tags), `8px` (buttons), `12px` (tech cards), `16px` (stats, contact links, edu cards), `20px` (achievement cards), `100px` (pills).
- **Borders:** always `1px solid rgba(255,255,255,0.07)` on cards; hover lifts to `rgba(accent, 0.3–0.4)`.
- **Shadows:** used sparingly. Button hover: `0 8px 30px rgba(79,142,247,0.35)`. Avatar: layered glow `0 0 40px` + `0 0 80px`. No drop shadows on normal cards — depth comes from surface-color steps.
- **Glow dots** — timeline dots use `box-shadow: 0 0 12px <accent>` for a point-of-light effect.

### Motion
- **Entry:** `fadeUp` keyframe — 20px rise + opacity, `0.6s ease`, staggered delays (`0.1s`, `0.2s`, `0.3s`…) to cascade hero elements.
- **Scroll reveal:** IntersectionObserver adds `.visible` which transitions `opacity` + `translateY(30px→0)` over `0.7s ease`. Staggered 60ms per element.
- **Drift:** orbs `translate + scale` over 20s, alternating direction.
- **Pulse:** status dot `0% → 50% → 100%` opacity cycle, 2s.
- **Ring spin:** avatar rings rotate at 12s and 20s (one reversed).
- **Pulse-glow:** avatar aura scales `1 → 1.1 → 1` over 3s.

### Interactive States
- **Hover:**
  - Links: muted → full text color, `0.2s`.
  - Tags: border fades to accent blue, text turns accent.
  - Tech cards: `translateY(-3px)` + accent border + gradient wash appears.
  - Contact links: `translateX(4px)` + accent border + accent text.
  - Primary buttons: `translateY(-2px)` + blue glow shadow.
  - Secondary buttons: border + text shift to accent.
- **Press:** inherits browser defaults; no explicit scale-down.
- **Focus:** uses accent color borders.
- **Active section:** timeline dot glows brighter; section tag always uses `--accent`.

### Layout Rules
- **Fixed nav** (60px side padding desktop, 24px mobile), glass blur.
- **Hero is three-column** on desktop: content / avatar / stats. Collapses to stacked on `<900px`.
- **About is two-column:** prose left, skill groups right.
- **Experience uses a vertical timeline** — 1px gradient rail, dots at each card, `padding-left: 48px`.
- **Tech stack auto-fills** with `minmax(160px, 1fr)`.
- **Two-column achievements + contact**; collapses on mobile.

### Imagery
- **No photos.** The single human element is an SVG cartoon self-portrait inside a circular avatar with two spinning rings (one dashed violet, one solid blue) and a pulsing radial glow.
- **No generic stock.** All "imagery" is CSS-generated atmosphere.
- **Cool palette.** Everything trends blue/violet; mint is used sparingly for positive accents.

---

## Iconography

- **Emoji as tech icons.** The tech stack uses Unicode emoji (🟨 🐍 🟢 🐳 🍃 etc.) — no icon font, no SVG set. This is a stylistic choice: emoji give warmth and personality without requiring an icon license.
- **Unicode symbols for list bullets.** `▸` (U+25B8) with accent color for experience bullets.
- **Text arrow glyphs** for CTAs: "View experience ↓".
- **SVG is used only for the custom self-portrait avatar** — a single inline SVG with gradients, no external icon libraries.
- **No icon font, no Lucide, no Heroicons, no Font Awesome.** If a new icon is needed in a component that should not use emoji (e.g. UI controls), use a simple inline SVG with `stroke: currentColor`, `stroke-width: 1.5`, rounded caps — matching the understated line-work of the avatar's hair-texture strokes. Lucide is the closest CDN match if a full set is needed — flag as a substitution.

---

## Index

Root of this project:

- `README.md` — this file.
- `SKILL.md` — agent-skill manifest (Agent Skills-compatible).
- `colors_and_type.css` — CSS variables for colors, typography, spacing, radii, shadows, motion. **Import this first** in any new artifact.
- `assets/`
  - `avatar-shivam.svg` — the SVG cartoon self-portrait.
  - `logo-ss.svg` — `SS.` monogram in the hero gradient.
  - `noise.svg` — the fractal-noise overlay snippet.
- `source_resume/` — the original resume HTML (read-only reference).
- `preview/` — 21 preview cards feeding the Design System tab (colors, type, spacing, components, brand).
- `ui_kits/portfolio/` — the journey-style portfolio UI kit:
  - `index.html` — interactive demo.
  - `portfolio.css` — kit styles.
  - `data.js` — journey stops, tech stack, contacts.
  - `Components.jsx` — `Nav`, `Avatar`, `Hero`, `JourneyRail`, `Stop`, `StackMap`, `Achievements`, `Now`.
  - `App.jsx` — composition root.
  - `README.md` — component index + usage.

## Font Substitution Note ⚠️

Fonts are served from Google Fonts CDN (Syne, DM Mono, Inter) — no local `.ttf`s are bundled. If you need to ship this offline or use it in PowerPoint/PDF export, please either:

1. Download the three families from [Google Fonts](https://fonts.google.com/) and drop them into `fonts/`, or
2. Let me know and I'll swap to a local fallback (closest matches: Space Grotesk for Syne, JetBrains Mono for DM Mono, system-ui for Inter).
