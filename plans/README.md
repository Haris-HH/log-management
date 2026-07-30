# Animation improvement plans

Produced by the `improve-animations` audit at commit **b13b768** (2026-07-30). The working tree at that point also carried uncommitted nav-position work in `src/layout/`, `src/hooks/useNavPosition.tsx`, `src/components/nav-sidebar/` and `src/components/nav-top-menu/` — plan 012 edits that uncommitted code, so do not discard it.

**Plan numbers match the audit finding numbers**, not the execution order. Execution order is the section below.

Each plan is self-contained: exact file paths, current-code excerpts, exact target values, boundaries and a feel check. An executor needs no other context. Rule catalogue: `.claude/skills/improve-animations/AUDIT.md`.

## Plans

Statuses below were reconciled after the 7-item implementation pass requested on 2026-07-30 (see **Implementation pass** at the bottom).

| # | Title | Severity | Category | Files | Status |
|---|---|---|---|---|---|
| [001](001-main-title-infinite-underline.md) | Stop the infinite underline sweep under every page title | HIGH | Purpose & frequency | `MainTitle.tsx` | **PARTIAL** — gated behind reduced motion only; still loops forever by default |
| [002](002-dock-transition-all.md) | Replace `transition: all` on the dock so theme switching stops animating | HIGH | Performance | `DockDrawer.tsx` | **DONE** |
| [003](003-loading-screen-left-keyframes.md) | Animate the loading dots with `transform`, not `left` | HIGH | Performance | `LoadingScreen.css` | **DONE** (219 → 129 lines, incl. a new reduced-motion block) |
| [004](004-reduced-motion.md) | Add reduced-motion support across every ambient animation | HIGH | Accessibility | new hook + 5 files | **DONE** (wider than planned — 9 call sites + a global CSS block) |
| [005](005-home-hover-durations.md) | Bring the Home menu-card hover inside the duration budget | HIGH | Easing & duration | `Home.tsx`, `App.css` | **PARTIAL** — underline, `transition-all`, fill duration and `mode="wait"` done; submenu 400ms + 80ms stagger still there |
| [006](006-export-progress-bar.md) | Drive the export progress bar with `scaleX`, not `width` | MEDIUM | Performance | `ExportLoadingScreen.tsx` | TODO |
| [007](007-overall-map-filter-panel.md) | Stop the map filter panel collapsing to `scale(0)` | MEDIUM | Physicality | `OverallMap.tsx` | **PARTIAL** — reduced-motion branch added; `scaleX: 0` and the wobbly spring remain on the default path |
| [008](008-cinematic-title-easein-width.md) | Fix `ease-in`, per-character `width` animation and the 90px blur in the login intro | MEDIUM | Easing / Performance | `CinematicTitle.tsx` | **PARTIAL** — reduced-motion branches added; `easeIn`, per-char `width` and `blur(90px)` remain |
| [009](009-login-intro-gate.md) | Play the 5.5-second login intro only once per browser | MEDIUM | Purpose & frequency | `Login.tsx` | **SUPERSEDED** — solved differently: a focusable skip button + Esc/Enter/Space, and the overlay fade cut 1s → 400ms. No `localStorage` flag was added |
| [010](010-dropdown-transform-origin.md) | Make dropdowns and the dock submenu grow from their trigger | MEDIUM | Physicality | `HoverSelectMenu.tsx`, `DockDrawer.tsx` | **PARTIAL** — the trigger's `transition-all` is fixed; `Grow` origin and the dock submenu's bare `Fade` remain |
| [011](011-motion-tokens.md) | Introduce shared motion tokens and a `transitionOf()` helper | MEDIUM | Cohesion & tokens | new `constants/motion.ts` + 9 pages | **DONE** (plus a `MOTION_EASE_ARRAY` export for framer props) |
| [012](012-nav-layout-shift-easing.md) | Use a movement curve for the sidebar layout shift | LOW | Easing & duration | `MainLayout.tsx`, `Navbar.tsx` | **DONE** |
| [013](013-dock-hover-scale.md) | Tone down the dock item hover and gate it to real pointers | LOW | Accessibility / Cohesion | `DockDrawer.tsx` | **DONE** |
| [014](014-map-control-transition-duplication.md) | Give the map search control one owner for its show/hide transition | LOW | Cohesion & tokens | `App.css`, `useOpenStreetMap.tsx` | TODO |
| [015](015-custom-cursor-dead-code.md) | Decide the fate of the disabled custom cursor | LOW | Performance | `CustomCursor.tsx`, `App.tsx` | TODO |
| [016](016-letter-charge-particle-easing.md) | Give the login click particles a launch curve | LOW | Physicality | `LetterChargeEffect.tsx` | **PARTIAL** — particles are suppressed under reduced motion; `easeInOut` on the launch remains |

## Recommended execution order

Ordered so that foundations land first and no two consecutive plans fight over the same lines.

1. **011** — motion tokens. Every plan below can then use `transitionOf()`; each also carries a literal fallback, so 011 is a soft dependency, not a blocker.
2. **001** — the highest-exposure animation in the app, and a small edit.
3. **003** — loading dots.
4. **002** — dock `transition: all`.
5. **004** — reduced motion. Runs *after* 001/003/008 touch their files so it wraps whatever survives (see Overlaps).
6. **005** — Home hover cluster. The largest single behavioural improvement on a page users pass through constantly.
7. **006** — export progress bar.
8. **007** — map filter panel.
9. **008** — login intro internals.
10. **009** — login intro gating. After 008, so the first-run experience is already correct when you gate it.
11. **010** — dropdown/submenu origins.
12. **012** → **013** → **014** → **015** → **016** — polish, any order.

## Dependencies and overlaps

Soft dependency: plans 002, 005, 011, 012, 013 and 014 reference `src/constants/motion.ts` created by **011**. Each one states its literal fallback, so they can run before 011 — but if 011 runs first they should use the tokens.

**Do not run these pairs in parallel** — they edit the same files:

| Files | Plans | Note |
|---|---|---|
| `src/components/main-title/MainTitle.tsx` | 001, 004 | Run 001 first; 004 then finds the infinite loop already gone and skips its MainTitle step. |
| `src/components/loading-screen/LoadingScreen.css` / `.tsx` | 003, 004 | 003 owns the CSS keyframes, 004 owns the TSX pulse. Different files, but sequence them to keep the feel checks attributable. |
| `src/components/cinematic-title/CinematicTitle.tsx` | 008, 004 | Run 008 first. If 004 ran first, 008 must preserve its `prefersReducedMotion` branches. |
| `src/components/loading-screen/ExportLoadingScreen.tsx` | 006, 004 | 006 owns the progress bar, 004 owns the halo pulse. |
| `src/components/dock-drawer/DockDrawer.tsx` | 002, 010, 013 | Three different line ranges in one file: container transition (002), submenu transition (010), item hover (013). Run strictly in that order. |
| `src/pages/Home.tsx`, `src/App.css` | 005, 014 | Different `App.css` rules (`.menu` vs `#leaflet-search-control-container`), but the same file. |
| `src/layout/Navbar.tsx`, `src/layout/MainLayout.tsx` | 012, 004 | 004 edits MainLayout's `<video>`, 012 edits its `transition`. |
| `src/pages/Login.tsx` | 009 only | 008 and 016 touch the components Login renders, not Login itself. |

## Pre-existing lint state (do not "fix" these)

`npm run lint` reports 294 problems repo-wide at this commit, almost all unrelated to motion. Three sit in files these plans touch and are **expected** — no plan should address them:

- `src/layout/Navbar.tsx:209` — `react-hooks/set-state-in-effect` (language read from `localStorage`).
- `src/components/select-menu/HoverSelectMenu.tsx:88` — `anchorRef.current` read during render.
- `src/components/dock-drawer/DockDrawer.tsx:130` — `no-unused-expressions` (`item?.path && navigate(...)`).

Baseline to preserve: `npm run build` exits 0, `npx vitest run` → 16 files / 198 tests passing.

## Deliberately not planned

- `src/components/text-box/TextBox.tsx:142` — `transition: "background-color 5000s ease-in-out 0s"` is the standard Chrome autofill-highlight suppression trick, not a real animation. By design.
- `animation: move 3s linear infinite` — `linear` is correct for constant marquee motion; only the animated property was wrong (plan 003).
- Modal/dialog `transform-origin: center` — correct for centred overlays, exempt from the trigger-origin rule.
- `src/components/loading-screen/LoadingScreen.tsx:40-76` — two 5s infinite `pathLength` animations over a ~40 KB SVG path. Potentially expensive (SVG stroke animation repaints rather than composites) but it is the brand loading mark. Plan 003 asks the executor to **measure and report** instead of changing it.
- `src/components/matrix-raining-effect/MatrixRainingEffect.tsx` rAF loop — throttled to 25fps and only mounted on `/login`. Plan 004 stops it under reduced motion; otherwise it is within budget.

## Missed opportunities (additive, not yet planned)

Not part of #1-#16. Raise them as new plans if wanted:

1. **Table data swaps teleport.** Every statistic page replaces its rows instantly on Search / page change, with no transition and no skeleton (this repo has no `TableSkeleton`, unlike the sibling `user-management`). A 150ms `opacity` change with a `filter: blur(2px)` mask would cover the seam.
2. **Switching menu position is a hard cut.** `sidebar ↔ top ↔ dock` swaps instantly. The outgoing shape should leave toward the edge it lived on, so the user can see where the menu went.
3. **Export completion is silent.** A job that runs for minutes ends with no acknowledgement — a rare, high-emotion moment with the full delight budget available.

## Implementation pass (2026-07-30)

A 7-item list was implemented directly rather than plan-by-plan, so the mapping is not 1:1 with the plan numbers:

| Item | What landed | Plans affected |
|---|---|---|
| 1. Reduced motion, app-wide | `src/hooks/useReducedMotion.ts` + a `@media (prefers-reduced-motion: reduce)` block in `src/index.css` (stops infinite iteration, caps transitions at 120ms) + JS branches in MainLayout (video), MainTitle, LoadingScreen (halo + both `pathLength` paths), ExportLoadingScreen, CinematicTitle, MatrixRainingEffect (one static frame, no rAF), LetterChargeEffect (no particles), Login (skips the intro entirely), Home, OverallMap. A dedicated block in `LoadingScreen.css` keeps the loading letters visible instead of ending on `opacity: 0` | 004 done; 001/007/008/016 partially |
| 2. Home pointer tracking | `onMouseMove` writes to a `useRef` instead of state (no re-render per event), and the fill origin is written to `--fill-x` / `--fill-y` **once** at hover start. The reveal is now a pure CSS `clip-path` transition (`.menu .menu-fill` in `App.css`), which also fixed the bug where the circle's centre chased the cursor mid-animation, and removed the `mode="wait"` queue | 005 partially |
| 3. Login intro | Focusable "ข้ามอินโทร" button + Esc/Enter/Space handler; overlay fade 1s → 400ms; reduced motion skips the intro outright | 009 superseded |
| 4. Loading a11y | `role="status"` / `aria-live="polite"` / `aria-busy` on both loading screens, `aria-hidden` on the decorative SVG/logo/letters (they spelled "GNIDAOL" to a screen reader), and a real `role="progressbar"` with `aria-valuenow` on the export bar | new |
| 5. Matrix canvas | `getComputedStyle` hoisted out of the draw loop (was 2 forced style reads × 25 fps) and invalidated by a `MutationObserver` on `<html>`'s `data-theme` / `style` | new |
| 6. Loading dots | `left` → `translateX`, all `-moz-`/`-o-`/`-webkit-` keyframes and properties deleted | 003 done |
| 7. `transition: all` + tokens | `src/constants/motion.ts` created; both `transition: all` sites fixed; the 9 duplicated row-hover strings migrated; nav layout shift moved to the movement curve; dock item hover retuned and gated to `hover: hover`; the 900ms `width` underline on Home converted to a 200ms `scaleX` | 002/011/012/013 done, 010 partially |

Verified in a browser at the end of the pass: the Home fill origin stays locked while the pointer moves inside a card, `clip-path` transitions over 250ms, the underline uses `transform`/200ms, the navbar and page content share `cubic-bezier(0.32, 0.72, 0, 1)`, both reduced-motion media blocks parse into the CSSOM, and Escape dismisses the login intro. `npm run build` and all 198 tests pass; the only console errors were SSE 403s from the fake dev token.

## Executing a plan

These plans do not modify code by themselves. Hand one to any agent, or run:

```
improve-animations execute plans/001-main-title-infinite-underline.md
```

which dispatches an executor in an isolated worktree and reviews the resulting diff. Update the **Status** column here (and the `- **Status**:` line in the plan) to `DONE` as each lands; `improve-animations reconcile` re-checks the whole directory against the current code.
