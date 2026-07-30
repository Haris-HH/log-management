# 007 — Stop the map filter panel collapsing to `scale(0)`

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 1 file, small
- **Audit finding**: #7

## Problem

```tsx
/* src/pages/OverallMap.tsx:320-332 — current */
        <AnimatePresence>
          {showFilter && (
            <motion.div 
              initial={{ x: -100, opacity: 0, scaleX: 0.5, originX: 0 }}
              animate={{ x: 0, opacity: 1, scaleX: 1 }}
              exit={{ x: -50, opacity: 0, scaleX: 0, transition: { duration: 0.2 } }}
              transition={{ 
                type: "spring", 
                stiffness: 100,
                damping: 15,
                mass: 1
              }}
              className="absolute top-0 left-0 z-1000"
            >
```

Three separate problems:

1. **`scaleX: 0` on exit.** Nothing in the physical world shrinks to literally nothing. The panel collapses into a line before disappearing.
2. **`scaleX` distorts the content.** This panel is 700px wide (`width: 700` at `src/pages/OverallMap.tsx:341`) and full of labels and inputs. Animating `scaleX` alone squashes and stretches every glyph horizontally — text visibly compresses on the way in and out. A uniform `scale` does not have this problem.
3. **The spring is slow and wobbly for a dashboard panel.** `stiffness: 100, damping: 15, mass: 1` gives a soft, visibly oscillating settle of roughly 0.8-1s. This is a crisp data tool, not a playful consumer app.

## Target

```tsx
/* target — src/pages/OverallMap.tsx */
        <AnimatePresence>
          {showFilter && (
            <motion.div 
              initial={{ x: -24, opacity: 0, scale: 0.96 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -24, opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }}
              transition={{
                type: "spring",
                duration: 0.5,
                bounce: 0.2,
              }}
              style={{ transformOrigin: "top left" }}
              className="absolute top-0 left-0 z-1000"
            >
```

Exact values, do not substitute:
- `scale: 0.96` (uniform) replaces `scaleX: 0.5` / `scaleX: 1` / `scaleX: 0` — no horizontal-only distortion, and the panel never reaches zero.
- `x: -24` in and out. The old `-100` in / `-50` out was a large asymmetric slide; 24px is enough to read as "it came from the left edge".
- `{ type: "spring", duration: 0.5, bounce: 0.2 }` — the Apple-style spring config. Framer Motion 12 supports `duration`+`bounce` springs; delete `stiffness`, `damping` and `mass` rather than trying to convert them.
- `transformOrigin: "top left"` replaces the old `originX: 0`, and now covers both axes so the panel grows out of the corner it is anchored to (the button that opens it is the top-left map control at `src/hooks/useOpenStreetMap.tsx:188-215`).
- `exit` keeps its own 200ms tween — exits should be quicker than entrances, and a spring on exit fights `AnimatePresence` unmount timing.

## Repo conventions to follow

- framer easings are arrays in this codebase, not strings: `[0.23, 1, 0.32, 1]`.
- Panel/overlay styling stays in the inner `<Box sx={{…}}>` (`src/pages/OverallMap.tsx:334-346`); only the outer `motion.div` animation props change.
- `AnimatePresence` is already imported here (`src/pages/OverallMap.tsx`), and the same import pattern appears at `src/pages/Home.tsx:2` and `src/pages/Login.tsx:4`.

## Steps

1. Open `src/pages/OverallMap.tsx`.
2. Replace the `initial`, `animate`, `exit` and `transition` props of the filter `motion.div` (lines 322-330) with the block in **Target**.
3. Add the `style={{ transformOrigin: "top left" }}` prop shown in **Target**. Keep the existing `className="absolute top-0 left-0 z-1000"` exactly as is.
4. Do not touch the inner `<Box>` or anything inside the panel.

## Boundaries

- Do NOT change the filter panel's layout, width (700px), padding, or any of the form controls inside it.
- Do NOT change `showFilter` state handling, `onSearchFilterClick`, or `BaseMap` props.
- Do NOT touch the leaflet control's own show/hide transition (`src/App.css:159-170` and `src/hooks/useOpenStreetMap.tsx:195`) — that is plan 014.
- Do NOT add dependencies.
- If the `initial`/`exit` props do not match the excerpt, STOP and report.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx eslint src/pages/OverallMap.tsx` — no new errors. `npx vitest run` still 198 passing.
- **Feel check**: open `/overall-map` and click the search-filter control in the top-left corner:
  - the panel grows out of the **top-left corner** toward the bottom-right, not from its own centre;
  - **read the label text while it animates** (slow the Animations panel to 25% if needed): the characters must keep their proportions. Before this change they were horizontally squashed;
  - close the panel: it shrinks slightly and fades — it must never flatten into a line or vanish from a zero size;
  - the settle should feel firm, with at most a hint of overshoot. If it visibly wobbles more than once, `bounce` was not applied — check that `stiffness`/`damping`/`mass` are gone;
  - open and close it rapidly five times: the spring should retarget from wherever it is, never jump.
- **Done when**: `grep -n "scaleX" src/pages/OverallMap.tsx` returns nothing.
