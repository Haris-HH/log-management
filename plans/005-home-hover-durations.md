# 005 — Bring the Home menu-card hover inside the duration budget

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: HIGH
- **Category**: Easing & duration
- **Estimated scope**: 2 files, medium
- **Audit finding**: #5

## Problem

`/` (Home) is the landing screen every navigation passes through. Hovering one menu card fires four animations, none of which fits the 150-250ms budget for a hover.

**(a) The title underline takes 900ms and animates `width`:**

```css
/* src/App.css:13-27 — current */
.menu .menu-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 0;
  background-color: white;
  transition: width 0.9s ease;
  border-radius: 9999px;
}

.menu:hover .menu-title::after {
  width: 100%;
}
```

**(b) The radial fill takes 550ms with `easeInOut`, on `clip-path`:**

```tsx
/* src/pages/Home.tsx:60-84 — current */
              <AnimatePresence mode="wait">
                {isHovered && (
                  <motion.div
                    key={`hover-bg-${index}`}
                    initial={{
                      clipPath: `circle(0% at ${pointer.x}% ${pointer.y}%)`,
                      opacity: 1,
                    }}
                    animate={{
                      clipPath: `circle(150% at ${pointer.x}% ${pointer.y}%)`,
                      opacity: 1,
                    }}
                    exit={{
                      clipPath: `circle(0% at ${pointer.x}% ${pointer.y}%)`,
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.55,
                      ease: "easeInOut",
                    }}
```

`mode="wait"` makes it worse: sweeping the mouse across cards queues each card's 550ms exit before the next card's fill may start.

**(c) The submenu reveal is 400ms plus an 80ms-per-item stagger** — with 4 sub-items the last one lands at ~640ms, with 6 at ~800ms:

```tsx
/* src/pages/Home.tsx:115-140 — current */
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut",
                    }}
...
                      <motion.div
                        key={sub.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: subIndex * 0.08,
                        }}
```

Stagger is decorative and must never gate interaction; here it delays the clickable targets the user is reaching for.

**(d) The sub-item buttons use `transition: all` for 300ms:**

```tsx
/* src/pages/Home.tsx:141-150 — current (Tailwind classes) */
                          bg-(--tertiary-bg-color)/10 px-4 py-3
                          backdrop-blur-sm
                          text-(--secondary-color)
                          hover:bg-(--primary-color)
                          hover:text-(--tertiary-color)
                          transition-all duration-300
```

## Target

**(a)** `transform: scaleX()` from the left, 200ms, `ease` (hover/colour band):

```css
/* target — src/App.css */
.menu .menu-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background-color: white;
  border-radius: 9999px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 200ms ease;
}

.menu:hover .menu-title::after {
  transform: scaleX(1);
}
```

Note `width` becomes a static `100%` and the animated property becomes `transform` — the visual result is identical, the cost is compositor-only.

**(b)** 250ms, strong ease-out, and `mode="wait"` removed so cards can cross-fade over each other:

```tsx
/* target — src/pages/Home.tsx */
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    key={`hover-bg-${index}`}
                    initial={{ clipPath: `circle(0% at ${pointer.x}% ${pointer.y}%)`, opacity: 1 }}
                    animate={{ clipPath: `circle(150% at ${pointer.x}% ${pointer.y}%)`, opacity: 1 }}
                    exit={{ clipPath: `circle(0% at ${pointer.x}% ${pointer.y}%)`, opacity: 0 }}
                    transition={{
                      duration: 0.25,
                      ease: [0.23, 1, 0.32, 1],
                    }}
```

The `exit` also drops to `opacity: 0` so a leaving fill fades instead of visibly shrinking back into the cursor.

**(c)** 200ms container, no stagger, and `y: 40` → `y: 8` (a 40px jump is too far for a hover):

```tsx
/* target — src/pages/Home.tsx */
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      ease: [0.23, 1, 0.32, 1],
                    }}
...
                      <motion.div
                        key={sub.label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.15,
                          ease: [0.23, 1, 0.32, 1],
                        }}
```

The `x: -20` slide and the `delay: subIndex * 0.08` are both deleted — every sub-item appears together, in 150ms.

**(d)** Only the two properties that actually change, at 150ms:

```tsx
/* target — src/pages/Home.tsx, replacing `transition-all duration-300` */
                          transition-colors duration-150
```

## Repo conventions to follow

- Tailwind v4 utility classes are used for layout and now for this transition; `transition-colors` is the correct utility when only `background-color` / `color` change. Exemplar of a scoped Tailwind transition: `src/components/select-menu/HoverSelectMenu.tsx:68` (also being narrowed, by plan 010).
- Global CSS for page-level classes lives in `src/App.css`; keep the `.menu` / `.menu-title` selectors there.
- framer easings are arrays in this repo's props (`[0.23, 1, 0.32, 1]`), not strings. Do not import the CSS-string tokens from `src/constants/motion.ts` into framer props.

## Steps

1. `src/App.css`: replace the `.menu .menu-title::after` and `.menu:hover .menu-title::after` rules (lines 13-27) with the **Target (a)** version.
2. `src/pages/Home.tsx`: change `<AnimatePresence mode="wait">` at line 60 to `<AnimatePresence>`.
3. `src/pages/Home.tsx`: apply **Target (b)** to the fill `motion.div` — `exit.opacity` to `0`, `duration` to `0.25`, `ease` to `[0.23, 1, 0.32, 1]`.
4. `src/pages/Home.tsx`: apply **Target (c)** to the submenu container (lines 115-122) and to the per-item `motion.div` (lines 128-138), deleting the `x` keyframes and the `delay`.
5. `src/pages/Home.tsx`: replace `transition-all duration-300` (line 145) with `transition-colors duration-150`.
6. Leave the `onMouseMove` pointer tracking, the `clipPath` circle geometry and all `className` layout utilities alone.

## Boundaries

- Do NOT change the card grid, the `min-h-70`, the border/background styles, or the `navigate(sub.path)` click behaviour.
- Do NOT touch the `setMousePosition` state update in `onMouseMove` (`src/pages/Home.tsx:41-51`). It re-renders per mousemove, which is a separate concern and out of scope here.
- Do NOT add `@media (hover: hover)` gating in this plan — that pattern is applied in plan 013; keep the two plans from editing the same lines.
- Do NOT touch any other `.menu` rule or anything below `src/App.css:29`.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx eslint src/pages/Home.tsx` — no new errors. `npx vitest run` still 198 passing.
- **Feel check**: open `/`:
  - hover one card: the fill reaches the edges in about a quarter second, the underline follows it, and all sub-items are readable and clickable within ~200ms of the hover starting. Time it against a stopwatch if unsure — before this change the last sub-item took roughly four times as long;
  - **sweep the mouse quickly across three cards in a row**: each card's fill should start immediately as you arrive. Before this change the `mode="wait"` queue made later cards feel stuck;
  - the underline: confirm it still grows from the left edge of the title, not from the middle (that is `transform-origin: left` doing its job);
  - In DevTools → Animations, set playback speed to 10% and hover a card: watch that the underline scales rather than the card re-laying out (no shifting of neighbouring text).
- **Done when**: `grep -n "0.55\|delay: subIndex\|transition-all\|width 0.9s" src/pages/Home.tsx src/App.css` returns nothing.
