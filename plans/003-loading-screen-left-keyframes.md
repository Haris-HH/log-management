# 003 — Animate the loading dots with `transform`, not `left`

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 CSS file, medium (mostly deletion)
- **Audit finding**: #3

## Problem

`LoadingScreen` is shown on every data fetch on every page (16 call sites, e.g. `src/pages/StatisticUsageLog.tsx:893`, `src/layout/Navbar.tsx:296`). Its travelling letters animate `left`:

```css
/* src/components/loading-screen/LoadingScreen.css:17-31 — current */
#load div {
  position: absolute;
  width: 20px;
  height: 36px;
  opacity: 0;
  animation: move 3s linear infinite;
  -o-animation: move 3s linear infinite;
  -moz-animation: move 3s linear infinite;
  -webkit-animation: move 3s linear infinite;
  transform: rotate(180deg);
  -o-transform: rotate(180deg);
  -moz-transform: rotate(180deg);
  -webkit-transform: rotate(180deg);
  color: var(--primary-color);
}
```

```css
/* src/components/loading-screen/LoadingScreen.css:103-135 — current */
@keyframes move {
  0%   { left: 0;     opacity: 0; }
  35%  { left: 41%;   transform: rotate(0deg);    opacity: 1; }
  65%  { left: 59%;   transform: rotate(0deg);    opacity: 1; }
  100% { left: 100%;  transform: rotate(-180deg); opacity: 0; }
}
```

Two problems:

1. **`left` is a layout property.** Ten `#load div` elements each animate it continuously, so every frame costs layout + paint + composite instead of a compositor-only transform. This runs precisely when the main thread is busiest — during API calls, JSON parsing and, on export, `exceljs`/`pdfmake` work.
2. **Dead vendor prefixes.** `@-moz-keyframes`, `@-webkit-keyframes` and `@-o-keyframes` duplicate the same 33-line block three times (lines 137-219) and `-o-`/`-moz-` prefixed `animation`/`transform` properties are needed by no browser this app supports. ~120 lines of the 219-line file are dead weight.

Note the `linear` timing is **correct** for this kind of constant marquee motion — do not change it.

## Target

One keyframe block, driven by `translateX` percentages, with the rotation folded into the same `transform`. Because `translateX(%)` resolves against the element's own width (20px) and the old `left: %` resolved against the 600px `#load` container, the percentages must be converted: `41%` of 600px = 246px = `1230%` of 20px. Use the pixel values directly to avoid the confusion — `#load` is a fixed 600px wide (`src/components/loading-screen/LoadingScreen.css:1-15`), so hardcoding is safe here and much easier to verify:

```css
/* target — src/components/loading-screen/LoadingScreen.css */
#load div {
  position: absolute;
  left: 0;
  width: 20px;
  height: 36px;
  opacity: 0;
  animation: move 3s linear infinite;
  color: var(--primary-color);
}

@keyframes move {
  0% {
    transform: translateX(0) rotate(180deg);
    opacity: 0;
  }

  35% {
    transform: translateX(246px) rotate(0deg);
    opacity: 1;
  }

  65% {
    transform: translateX(354px) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translateX(600px) rotate(-180deg);
    opacity: 0;
  }
}
```

Deleted entirely: every `-o-`, `-moz-`, `-webkit-` prefixed property, and the `@-moz-keyframes` / `@-webkit-keyframes` / `@-o-keyframes` blocks (lines 137-219). The `animation-delay` rules for `:nth-child(2)` through `:nth-child(11)` keep their unprefixed line and lose their three prefixed twins each.

The static `transform: rotate(180deg)` on `#load div` is dropped because the `0%` keyframe now sets it.

## Repo conventions to follow

- This is the only component-local CSS file in the repo (`src/components/loading-screen/LoadingScreen.css`, imported at `src/components/loading-screen/LoadingScreen.tsx:2`). Keep it in place; do not move the styles into `sx` or Tailwind.
- Colours come from CSS custom properties (`var(--primary-color)`) so theme switching keeps working — keep that.
- Plan 011's motion tokens are TypeScript, not CSS variables, so they do **not** apply to this file. Keep the literal `3s linear`.

## Steps

1. Open `src/components/loading-screen/LoadingScreen.css`.
2. Replace the `#load div` rule (lines 17-31) with the version in **Target**.
3. For each of the ten `#load div:nth-child(N)` rules (lines 33-101), keep only the unprefixed `animation-delay` line and delete the `-o-`, `-moz-` and `-webkit-` lines. Note line 42-44 currently has `-webkit-animation-delay` twice and no `-moz-` — after this step every rule has exactly one line, so that inconsistency disappears.
4. Replace the `@keyframes move` block (lines 103-135) with the version in **Target**.
5. Delete `@-moz-keyframes move` (lines 137-163), `@-webkit-keyframes move` (165-191) and `@-o-keyframes move` (193-219) entirely.
6. Leave the `#load` container rule (lines 1-15) untouched — the 600px width the new pixel offsets depend on lives there.

## Boundaries

- Do NOT touch `src/components/loading-screen/LoadingScreen.tsx` in this plan. Its two `motion.path` `pathLength` animations (`:40-76`) are a separate concern: they are 5s infinite SVG stroke animations over a ~40 KB path, which repaint rather than composite. They are the brand loading mark and changing them is a judgement call — **measure first, do not touch here**. Record what you observe in DevTools → Performance (see Verification) and report it; a follow-up plan can decide.
- Do NOT change `3s`, `linear`, or `infinite`.
- Do NOT change the letters or the Thai/English branches in the TSX.
- Do NOT add a `prefers-reduced-motion` block here — plan 004 owns accessibility, and it gates the TSX-level animations.
- Do NOT add dependencies or a PostCSS/autoprefixer step.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx vitest run` still 198 passing. `wc -l src/components/loading-screen/LoadingScreen.css` should drop from 219 to roughly 60-70 lines.
- **Feel check**: trigger any load (open `/statistic-usage-log` and hit Search):
  - the letters must travel along exactly the same path as before, at the same speed, still flipping from upside-down to upright and back — visually identical, only cheaper;
  - the middle of the sweep (35%-65%) is still the slow, readable, upright section;
  - In DevTools → Performance, record 3 seconds while the loading screen is up. Compare against `main` before the change: the "Layout" / "Recalculate Style" bands for `#load div` should be gone. Note in your report whether any remaining long frames trace back to the two `motion.path` `pathLength` animations mentioned in Boundaries.
- **Done when**: `grep -c "left:" src/components/loading-screen/LoadingScreen.css` returns 1 (the static `left: 0`), and `grep -c "keyframes" src/components/loading-screen/LoadingScreen.css` returns 1.
