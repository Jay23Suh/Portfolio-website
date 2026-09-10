# Portfolio Website — CLAUDE.md

## Project

React + TypeScript portfolio at `localhost:3001`. Routes served by React Router v6 inside `App.tsx`. All pages live in `src/pages/`.

## Status

| Feature | Status |
|---|---|
| `/map` interactive story page | ✅ Complete — pushed (`6455d56`) |
| Scroll-driven story mode | ✅ 22 steps (indices 0–21), sticky canvas, camera pan/zoom |
| SVG draw-on animations | ✅ Circle, bracket (strokeDashoffset); arrows, ticks (opacity fade) |
| Card reveal / info card transitions | ✅ Spring + opacity on `show` prop |
| HUD | ✅ ▶/⏸ + "Show all" only |
| End-of-scroll → map mode | ✅ Auto-transitions; matches "Show all" view |

## Key Files

| File | Role |
|---|---|
| `src/pages/MapHome.tsx` | Entire /map page — all data, components, logic |
| `src/App.tsx` | Adds `import MapHome` + `<Route path="/map" element={<MapHome />} />` |

## MapHome.tsx Structure

**Constants**
```
CANVAS_W = 1540   CANVAS_H = 1640
CARD_W   = 255    CARD_H   = 230
MAX_STEP = 22     PX_PER_STEP = 400   (tuned up from 120 — was too sensitive)
```

**Data arrays**
- `CARDS` — 12 project cards (3 rows: HCD, Startup, Fun)
- `INFO_CARDS` — 3 narrative cards (about_me, college_transition, theme_ai_humans)
- `CONNECTIONS` — 8 bezier arrows between cards
- `STEPS[0..21]` — each step adds `cards/infoCards/arrows/svgElements` + a `camera: {cx, cy, zoom}`

**Components**
- `MapCanvas` — shared canvas interior (SVG layer, doodles, info cards, project cards); accepts `VisibleSets & { animated }`
- `MapHUD` — `position: fixed` pill with ▶/⏸ + "Show all"; shown in story mode only
- `MapSection` — branches on `mode`: story = sticky scroll + camera transform; map = scale-to-fit layout
- `MapHome` — root; owns scroll listener, autoplay interval, mode/step/isPlaying state

## Key Decisions

| Decision | Choice | Why |
|---|---|---|
| Story UX | Inline sticky scroll (not modal overlay) | User rejected popup-over-map approach |
| HUD controls | ▶/⏸ + "Show all" only | No step count, no ← → arrows — user's explicit request |
| Default mode | `'story'` | User lands in story, not plain map |
| End-of-scroll | Auto-switches to map mode | Makes scroll-end identical to "Show all" view |
| Step 22 (zoom=-1) | Removed | Was visually broken; auto-transition is cleaner |
| Scroll sensitivity | `PX_PER_STEP = 400` | 120 was too fast — single swipe flew through all steps |
| Arrowhead animation | Opacity fade (not strokeDashoffset) | Arrowheads appear at endpoint regardless of dashoffset; opacity is the right primitive |

## Camera Math (story mode)

```
baseScale  = Math.min(1, vpW / CANVAS_W)
fullZoom   = Math.min(vpW/(CANVAS_W*baseScale), vpH/(CANVAS_H*baseScale)) * 0.90
zoom       = cam.zoom < 0 ? fullZoom : cam.zoom   // -1 is sentinel for full-fit
totalScale = baseScale * zoom
tx         = vpW/2 - cam.cx * totalScale
ty         = vpH/2 - cam.cy * totalScale
transform: translate(tx, ty) scale(totalScale), transformOrigin: '0 0'
```

## Scroll → Step Logic

```
inSection = container.scrollTop - vpH       // 0 when just entered story section
rawStep   = Math.floor(inSection / PX_PER_STEP)
if rawStep >= MAX_STEP → setMode('map')     // auto-transition at the end
else setStep(Math.max(rawStep, 0))
```

## Known Context

- Parent `App.tsx` layout always renders the site header ("projects / fun stuff / about me") and footer — the map page's `position: fixed` container covers them at all story zoom levels
- Dependency security alerts on GitHub are pre-existing (not from map work)
- Fonts in use: `font-patrick` = "Patrick Hand SC", `font-beezee` = "ABeeZee"

## Recent Updates
- Fixed header `z-index` so the top navigation menu (`projects`, `fun stuff`, `about me`) is fully clickable when on `/map`
- Linked `about me` to `/contacts` in the top navigation
- Used `mix-blend-mode: multiply` on the `<header>` so the logo's white background drops out completely over the Aurora gradient on `/map`
- Added `<Typewriter>` effect to the `about_me` InfoCard (now uppercase and black)
- Added "scroll down! ↓ and click each card" annotation text mapping to `visInfo.has('about_me')`
