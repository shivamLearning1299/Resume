# Production Blueprint — Time-Travel Career Portfolio

Target stack: **Next.js 15 (App Router) + TypeScript + Tailwind CSS + Framer Motion**. Deploy on Vercel. Content stays a typed TS module (no DB needed) with a protected `/admin` route editing a JSON file via server action.

## 1. Migration map (prototype → production)

| Prototype piece | Production equivalent |
|---|---|
| `data.js` — `SITE` + `TIMELINE` globals | `data/timeline.ts` — typed `SiteConfig` + `TimelineItem[]` exports; single source of truth imported by server components |
| `app.js` engine (scroll spy, scene mounting, progress, era nav) | `components/TimelineProvider.tsx` — client context: active scene id, scroll progress via `useScroll`, era jump API; scene registry maps `item.type` → component |
| Scene DOM building in `app.js` | One component per type in `components/scenes/`: `HeroScene.tsx`, `SkillsScene.tsx`, `ExperienceScene.tsx`, `ProjectScene.tsx`, `EducationScene.tsx`, `AchievementScene.tsx`, `ContactScene.tsx` |
| Palette / quick-nav in `app.js` | `components/CommandMenu.tsx` — `cmd+k`/`/` opens kbar/cmdk-style menu; items derived from `data/timeline.ts` (jump to era, toggle motion, copy email, download resume) |
| Scroll animations in `app.js`/`styles.css` | Framer Motion: `motion.section` with `whileInView`, shared `variants.ts` (fade/slide-up, stagger on tech chips); keep all transforms GPU-only (opacity/transform) |
| `styles.css` design tokens | `tailwind.config.ts` theme extension: colors, fonts (next/font: Inter/Space Grotesk + JetBrains Mono), spacing; timeline rail/spine utilities as plain CSS in `globals.css` |
| `index.html` shell | `app/page.tsx` (server) renders `TimelineProvider` + scenes; `app/layout.tsx` holds font loading, theme bootstrap (inline no-flash script), CommandMenu mount |
| Admin dashboard (admin.html + localStorage overrides) | `app/admin/page.tsx` behind auth (Clerk/Auth.js or basic-auth middleware for single user). Form edits the same schema; submit → **server action** `saveContent()` that zod-validates and writes `content/site.json` (git-committed or on a writable volume), then `revalidatePath('/')` |
| Contact form / mailto | `app/api/contact/route.ts` using **Resend** — see §4 |
| Resume PDF link | Keep in `/public`, serve statically |

## 2. Suggested file tree

```
app/
  layout.tsx            page.tsx
  admin/page.tsx        admin/actions.ts        # saveContent server action
  api/contact/route.ts
  sitemap.ts  robots.ts
components/
  TimelineProvider.tsx  CommandMenu.tsx  MotionGate.tsx
  scenes/{Hero,Skills,Experience,Project,Education,Achievement,Contact}.tsx
data/timeline.ts        lib/schema.ts (zod)   lib/ratelimit.ts
content/site.json                             # written by admin action
public/  (resume pdf, og image)
```

## 3. TimelineProvider sketch

```tsx
// components/TimelineProvider.tsx
"use client";
const Ctx = createContext<{ active: string; go: (id: string) => void } | null>(null);
export function TimelineProvider({ items, children }) {
  const [active, setActive] = useState(items[0].id);
  // one scroll listener or IntersectionObserver over scene refs; update `active`
  const go = (id) => document.getElementById(`scene-${id}`)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  return <Ctx.Provider value={{ active, go }}>{children}</Ctx.Provider>;
}
```
- Renders scenes via registry: `const SCENES = { hero: HeroScene, skills: SkillsScene, experience: ExperienceScene, project: ProjectScene, education: EducationScene, achievement: AchievementScene, contact: ContactScene }`.
- Each scene wrapped in `<motion.section whileInView ... viewport={{ once: true, margin: "-20%" }}>`.
- Era side-nav + progress rail read `active` from context.

## 4. Contact API (`app/api/contact/route.ts`)

- **Validation**: zod schema `{ name: 1..100, email: z.string().email(), message: 10..5000, website: z.literal("") }` — `website` is a hidden honeypot field; reject non-empty.
- **Rate limit**: per-IP token bucket. Off-Redis option: in-memory `Map<ip, {tokens, ts}>` (5 tokens / 10 min, refill 0.5/min) fine for one instance; for serverless use Upstash Ratelimit (`@upstash/ratelimit`, sliding window 5/10m).
- **Send**: `resend.emails.send({ from: "portfolio@<YOUR-DOMAIN>", to: SITE.email, subject, text })`; return 200 on honeypot hits (silent drop) so bots learn nothing.
- CORS/method guard (POST only), `Content-Length` cap, strip HTML from message before send.

## 5. Admin route

- Protect with middleware matcher `/admin/:path*` + `/api/admin/*`.
- Load current `data/timeline.ts` defaults + `content/site.json` overrides; form edits site fields and timeline entries; submit calls `saveContent(unknown)` server action: zod-parse → atomic write (tmp + rename) → `revalidatePath("/")`.
- Keep the "never invent numbers" rule; surface a diff preview before save.

## 6. Performance checklist

- [ ] Lazy scenes: `next/dynamic` (`ssr:false` only for decorative canvas/WebGL bits), IntersectionObserver-gated heavy effects; keep text SSR'd for crawlability.
- [ ] Reduced motion: wrap animations in `MotionGate` honoring `prefers-reduced-motion` (`useReducedMotion()`); also `@media (prefers-reduced-motion: reduce)` in CSS disabling smooth-scroll; page must read fine fully static.
- [ ] Semantic HTML: one `<h1>`, `<header>/<main>/<section>/<nav>/<footer>`, timeline eras as `<ol>`, tech chips as `<ul>`, buttons real `<button>`.
- [ ] Metadata: `metadata` export in layout (title template, description, canonical), `openGraph` + `twitter` cards, 1200×630 `og-image.png` via `next/og` or static, JSON-LD Person (reuse `seo.html`).
- [ ] `sitemap.ts` + `robots.ts` (allow all, point to sitemap); add anchors per scene (`#now`, `#trajector`...) — include as URL fragments in sitemap only if they render server-side content.
- [ ] Images: `next/image`, explicit width/height, AVIF; resume PDF preloaded only on hover of the link.
- [ ] Fonts: `next/font/google`, subset latin, `display: swap`.
- [ ] Bundle: keep framer-motion out of the initial chunk where possible (`LazyMotion` + `domAnimation`); audit with `@next/bundle-analyzer`; target < 150 KB first-load JS.
- [ ] No layout thrash: single rAF/observer in provider; transforms only; `content-visibility: auto` on off-screen scenes if measured beneficial.
- [ ] Lighthouse ≥ 95 performance / 100 best-practices / SEO in CI (lhci).

## 7. Accessibility checklist

- [ ] Full keyboard operability: era nav as `<a href="#id">`, command menu with roving `aria-activedescendant`, visible `:focus-visible` ring.
- [ ] `prefers-reduced-motion` respected everywhere (both JS and CSS paths).
- [ ] Focus management on CommandMenu open/close (return focus to trigger); `Esc` closes; `role="dialog" aria-modal="true"`.
- [ ] Color contrast ≥ 4.5:1 body text, ≥ 3:1 large text/UI (check the accent color on dark bg).
- [ ] Labels on all form fields; errors via `aria-describedby`; status messages `role="status" aria-live="polite"`.
- [ ] Skip-to-content link; landmarks labeled (`aria-label="Timeline"` on the era nav).
- [ ] `lang="en"`, meaningful `alt` (decorative = empty alt), no text in images.
- [ ] Test with keyboard-only + VoiceOver/NVDA smoke pass; headless axe in CI (`@axe-core/playwright`).
