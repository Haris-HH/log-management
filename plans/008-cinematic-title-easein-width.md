# 008 — Fix `ease-in`, per-character `width` animation and the 90px blur in the login intro

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: MEDIUM
- **Category**: Easing & duration / Performance
- **Estimated scope**: 1 file, medium
- **Audit finding**: #8

## Problem

Three distinct defects in `src/components/cinematic-title/CinematicTitle.tsx`.

**(a) `ease-in` on an entrance** — the logo scales from 5× down to 2× using the one easing that is always wrong for UI, because it starts slow at exactly the moment the user's attention arrives:

```tsx
/* src/components/cinematic-title/CinematicTitle.tsx:62-80 — current */
      <motion.img
        src="/project-logo/logo.png"
        alt="Logo"
        initial={{ 
          scale: 5, 
          opacity: 1, 
          x: 0 
        }}
        animate={{
          scale: 2,
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: skipIntro ? 0.8 : 1.8,
          ease: "easeIn",
        }}
        className="mx-4 w-24 h-24"
      />
```

**(b) Every character animates `width: 0 → auto`** — a layout property, per glyph, staggered 40ms apart. The project title plus subtitle is roughly 60 characters, so this schedules ~60 separate layout passes, each reflowing its whole line:

```tsx
/* src/components/cinematic-title/CinematicTitle.tsx:22-39 — current */
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          transition={{
            delay: delay + index * 0.04,
            duration: 0.08,
          }}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            overflow: "hidden",
          }}
        >
          {char}
        </motion.span>
      ))}
```

Animating to `width: "auto"` also forces framer to measure the element each time, which it cannot do on the compositor.

**(c) A 384px circle with `filter: blur(90px)` scaling forever.** The audit budget for transition-time blur is under 20px; this is 4.5× that, on a large surface, animated infinitely:

```tsx
/* src/components/cinematic-title/CinematicTitle.tsx:104-118 — current */
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: "rgba(var(--primary-color-rgb),0.1)",
          filter: "blur(90px)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />
```

## Target

**(a)** Strong ease-out, and the redundant `opacity`/`x` keys dropped (both are unchanged between `initial` and `animate`):

```tsx
/* target — src/components/cinematic-title/CinematicTitle.tsx */
      <motion.img
        src="/project-logo/logo.png"
        alt="Logo"
        initial={{ scale: 5 }}
        animate={{ scale: 2 }}
        transition={{
          duration: skipIntro ? 0.8 : 1.8,
          ease: [0.23, 1, 0.32, 1],
        }}
        className="mx-4 w-24 h-24"
      />
```

Keep the 1.8s duration: this is a deliberate one-off cinematic entrance, and the audit allows longer durations for that. Only the curve is wrong.

**(b)** Same staggered reveal, but with compositor-only properties. `clip-path` per character gives the "typing" feel without touching layout:

```tsx
/* target — src/components/cinematic-title/CinematicTitle.tsx */
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
          animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
          transition={{
            delay: delay + index * 0.04,
            duration: 0.08,
            ease: "linear",
          }}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
          }}
        >
          {char}
        </motion.span>
      ))}
```

Exact values:
- `inset(0 100% 0 0)` → `inset(0 0% 0 0)` reveals each glyph left-to-right. Percentages, no hardcoded pixels.
- `overflow: "hidden"` is removed from `style` — `clip-path` replaces its role, and leaving both makes the glyph box clip twice.
- `ease: "linear"` on an 80ms per-character reveal: at that length any curve is invisible, and linear keeps the 60 overlapping animations as cheap as possible.
- The characters no longer reserve zero width, so the line no longer reflows as it types — a side benefit worth checking in the feel check.

**(c)** Blur down to the budget, size compensated so the glow looks the same:

```tsx
/* target — src/components/cinematic-title/CinematicTitle.tsx */
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: "rgba(var(--primary-color-rgb),0.1)",
          filter: "blur(20px)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
```

`blur(20px)` is the ceiling from the audit. `ease: "easeInOut"` is added because a looping breathe with no easing specified defaults to a tween that visibly kinks at the keyframe boundaries.

The infinite `repeat` stays here — plan 004 gates it behind `prefers-reduced-motion`, which is the correct handling for an ambient glow on a one-screen intro.

## Repo conventions to follow

- framer easings as arrays (`[0.23, 1, 0.32, 1]`) for custom curves, string names (`"linear"`, `"easeInOut"`) for built-ins. Both forms already appear in this repo — see `src/pages/Home.tsx:122` and `src/components/loading-screen/LoadingScreen.tsx:55`.
- `AnimatedText` is a local component in this file; keep it local.
- Do not extract these into tokens — `src/constants/motion.ts` (plan 011) is for CSS `transition` strings.

## Steps

1. Open `src/components/cinematic-title/CinematicTitle.tsx`.
2. Apply **Target (b)** to the `motion.span` inside `AnimatedText` (lines 23-38), including removing `overflow: "hidden"` from its `style`.
3. Apply **Target (a)** to the `motion.img` (lines 62-80).
4. Apply **Target (c)** to the glow `motion.div` (lines 104-118).
5. Leave the outer `motion.div`'s `exit`/`transition` (lines 49-58) and the text `motion.div`'s delay chain (lines 83-90) alone.

## Boundaries

- Do NOT change the `skipIntro` timings or the `delay` values — the intro's choreography is plan 009's subject, and changing both at once makes the result impossible to attribute.
- Do NOT delete the glow or the per-character effect; this is a deliberate brand moment.
- Do NOT add a `prefers-reduced-motion` branch here — plan 004 adds it to this exact file. If plan 004 has already run, preserve its `prefersReducedMotion` branches and apply these value changes inside them.
- Do NOT touch `src/pages/Login.tsx`.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx eslint src/components/cinematic-title/CinematicTitle.tsx` — no new errors. `npx vitest run` still 198 passing.
- **Feel check**: open `/login` in a fresh tab (the intro plays for 5.5s unless clicked):
  - the logo now starts moving immediately and decelerates into place, instead of creeping then rushing. Compare side by side with `git stash` if unsure — this is the difference between `easeIn` and `ease-out`;
  - the title text still types out character by character at the same rhythm;
  - **watch the line while it types**: the text must not reflow or nudge sideways as characters appear. Before this change each glyph expanded from zero width and pushed the line;
  - the glow still breathes at the same rate and still looks soft — not a hard-edged circle. If it looks too crisp at `blur(20px)`, lower the background alpha rather than raising the blur, and report it;
  - In DevTools → Performance, record the intro. The "Layout" band during the typing phase should be essentially empty; before, it had ~60 entries.
- **Done when**: `grep -n "easeIn\"\|width: 0\|blur(90px)" src/components/cinematic-title/CinematicTitle.tsx` returns nothing (note: `"easeInOut"` is expected and must not match — search for the exact string `easeIn"`).
