# 016 — Give the login click particles a launch curve

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: LOW
- **Category**: Physicality & origin
- **Estimated scope**: 1 file, tiny
- **Audit finding**: #16

## Problem

Clicking anywhere on the login screen throws a few characters outward from the cursor (`src/components/letter-charge-effect/LetterChargeEffect.tsx`, mounted at `src/pages/Login.tsx:143`). The particles use `easeInOut`:

```tsx
/* src/components/letter-charge-effect/LetterChargeEffect.tsx:61-82 — current */
          <motion.span
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 0,
              scale: 1.8,
              rotate: Math.random() * 360,
            }}
            animate={{
              x: particle.dx,
              y: particle.dy,
              opacity: [0, 1, 1, 0],
              scale: [1.8, 1.2, 0.3],
              rotate: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
```

`easeInOut` starts slowly, which is wrong for something being flung: a thrown object leaves fast and decelerates as it loses energy. The current curve makes the particles look like they are being *placed* along a path rather than launched from the click.

This is a rare, decorative, first-impression-only effect, so the fix is small and the duration stays generous.

## Target

```tsx
/* target — src/components/letter-charge-effect/LetterChargeEffect.tsx */
            transition={{
              duration: 0.8,
              ease: [0.23, 1, 0.32, 1],
            }}
```

Exact values, do not substitute:
- `[0.23, 1, 0.32, 1]` — framer's array form of `cubic-bezier(0.23, 1, 0.32, 1)`, the strong ease-out. The particle now leaves the cursor at speed and drifts to a stop.
- `duration: 0.8` is unchanged. A rare delight moment is allowed to run long; only the curve was wrong.
- Every other prop stays exactly as it is, including the random `rotate`, the `scale` keyframe array and the `opacity` fade sequence.

## Repo conventions to follow

- Custom framer easings are arrays in this codebase; built-ins are strings. Both appear already — see `src/pages/Home.tsx:122` (`ease: "easeOut"`) and `src/components/loading-screen/LoadingScreen.tsx:55` (`ease: "easeInOut"`).
- Do not import `src/constants/motion.ts` here — those tokens are CSS `transition` strings and cannot be passed to a framer `ease` prop.

## Steps

1. Open `src/components/letter-charge-effect/LetterChargeEffect.tsx`.
2. Change `ease: "easeInOut"` to `ease: [0.23, 1, 0.32, 1]` in the `transition` prop (line 80).
3. Change nothing else.

## Boundaries

- Do NOT change the particle count, spawn geometry (`particle.dx` / `particle.dy`), the `setTimeout(..., 900)` cleanup at `:52`, or the `AnimatePresence` wrapper.
- Do NOT touch the full-screen click catcher at `:55-58` (`className="fixed inset-0 pointer-events-auto z-20"`). Worth noting in your report if you observe it intercepting clicks meant for the login form — but do not change it here; that is a layering question, not a motion one.
- Do NOT add a reduced-motion branch here; this effect only fires on a deliberate user click, and plan 004 covers the ambient animations. If the repo owner later wants it gated, that is a follow-up.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx eslint src/components/letter-charge-effect/LetterChargeEffect.tsx` — no new errors. `npx vitest run` still 198 passing.
- **Feel check**: open `/login`, wait for (or click through) the intro, then click on empty areas of the screen:
  - the characters must shoot away from the click point immediately and slow as they fade, instead of easing gently into motion first;
  - set the Animations panel to 25% and watch a single particle's first 100ms: most of its travel should happen early. If it creeps at the start, the old curve is still in place;
  - the fade-out and shrink timing must be unchanged from before;
  - click rapidly ten times and confirm particles overlap without stuttering, and that none linger after ~1 second.
- **Done when**: `grep -n "easeInOut" src/components/letter-charge-effect/LetterChargeEffect.tsx` returns nothing.
