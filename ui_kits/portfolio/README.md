# Portfolio UI Kit — Journey Edition

An interactive, scroll-driven portfolio website for Shivam Sharma. The site is structured as a **journey**: each career stop is a chapter with a short narrative and a clickable *"what I did here"* panel.

## Files

- `index.html` — entry point. Loads React + Babel, data, components, and app.
- `portfolio.css` — kit-specific styles; imports `colors_and_type.css` tokens.
- `data.js` — journey stops, tech stack, contact data.
- `Components.jsx` — `Nav`, `Avatar`, `Hero`, `JourneyRail`, `Stop`, `StackMap`, `Achievements`, `Now`.
- `App.jsx` — composition root.

## Interactions
- **Journey rail** — sticky left-edge rail with numbered dots; advances as you scroll and click to jump.
- **Did-here panels** — accordion items; click a row to reveal details.
- **Tilting avatar** — follows the mouse on hover, 3D perspective tilt.
- **Stack filters** — click `// languages`, `// cloud & infra`, etc. to filter the stack map.
- **Hover states** everywhere — tags glow, cards lift, contact links slide right.

## Stops
1. **JIIT Noida** (2018–2022) — the start.
2. **Acefone** (2022–2025) — three years of backend plumbing.
3. **Trajector** (2025–present) — AI agents, S3 pipelines, GitHub automation.
