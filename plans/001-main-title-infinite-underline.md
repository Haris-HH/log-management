# 001 — Stop the infinite underline sweep under every page title

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: HIGH
- **Category**: Purpose & frequency
- **Estimated scope**: 1 file, small
- **Audit finding**: #1

## Problem

`MainTitle` is the heading component used by 16 pages. Its underline never stops moving:

```tsx
/* src/components/main-title/MainTitle.tsx:29-53 — current */
      {/* Animated Underline */}
      <motion.span
        style={{
          position: "absolute",
          left: 0,
          bottom: "3px",
          height: "3px",
          width: "100%",
          background: "var(--primary-color)",
          border: "0.25px solid var(--tertiary-color)",
          transformOrigin: "left",
          borderRadius: "999px",
          boxShadow: "0 0 8px var(--primary-color)",
        }}
        animate={{
          scaleX: [0, 1, 0],
          x: ["0%", "0%", "100%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        }}
      />
```

This is decorative motion on an element that is on screen 100% of the time an operator is working. The audit rule for that frequency band is unambiguous: no animation. Concretely it costs:

- a permanent framer-motion rAF loop per mounted page, for a purely decorative effect;
- constant peripheral movement competing with the data table the user is actually reading;
- a glowing bar that reads as a progress indicator when nothing is loading.

## Target

Keep the underline as a static element — same size, colour, glow and position — and play the sweep exactly **once** on mount as an entrance, then leave it at rest at full width:

```tsx
/* target — src/components/main-title/MainTitle.tsx */
      {/* Underline — sweeps in once on mount, then stays put. It used to loop
          forever, which put permanent decorative movement beside the data on
          all 16 pages that use this heading. */}
      <motion.span
        style={{
          position: "absolute",
          left: 0,
          bottom: "3px",
          height: "3px",
          width: "100%",
          background: "var(--primary-color)",
          border: "0.25px solid var(--tertiary-color)",
          transformOrigin: "left",
          borderRadius: "999px",
          boxShadow: "0 0 8px var(--primary-color)",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 0.4,
          ease: [0.23, 1, 0.32, 1],
        }}
      />
```

Exact values, do not substitute:
- `duration: 0.4` (400ms — the `slow` tier, appropriate for a full-width reveal).
- `ease: [0.23, 1, 0.32, 1]` — framer's array form of `cubic-bezier(0.23, 1, 0.32, 1)`, the strong ease-out used for anything entering.
- The `x` keyframes are deleted entirely; the bar no longer travels.
- `transformOrigin: "left"` stays — it is what makes `scaleX` grow from the start of the text rather than from its middle.

## Repo conventions to follow

- If plan 011 has already created `src/constants/motion.ts`, import it and use `ease: MOTION_EASING.entrance` — but note framer needs the **array** form for cubic-beziers, and the token is a CSS string. So for this file keep the literal array `[0.23, 1, 0.32, 1]` and do **not** import the token. This is deliberate: the token module is for CSS `transition` strings, not framer props.
- Keep the `// Material UI` / component structure of the file as-is; only the `<motion.span>` block changes.
- framer-motion is already imported at `src/components/main-title/MainTitle.tsx:1`.

## Steps

1. Open `src/components/main-title/MainTitle.tsx`.
2. Replace the `animate` and `transition` props of the `<motion.span>` (lines 43-52) with the `initial` / `animate` / `transition` block from **Target**.
3. Update the `{/* Animated Underline */}` comment to the two-line comment in **Target** so the next reader knows the loop was removed on purpose.
4. Leave every `style` property untouched.
5. Check `src/components/main-title/MainTitleWithBreadcrumbs.tsx` — if that file exists in this repo and duplicates the same animated span, apply the identical change there. (It exists in the sibling project; confirm before assuming.)

## Boundaries

- Do NOT delete the `<motion.span>` or convert it to a plain `<span>` — the one-shot entrance is wanted.
- Do NOT change the title `Typography` styles, `textShadow`, or the `overflow: "hidden"` on the wrapper.
- Do NOT touch the 16 consuming pages.
- Do NOT add dependencies.
- If the `animate` block does not match the excerpt above, STOP and report.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx eslint src/components/main-title/MainTitle.tsx` — no new errors. `npx vitest run` still 198 passing.
- **Feel check**: open `/statistic-usage-person`:
  - the underline draws from left to right once, in under half a second, then holds at full width and never moves again;
  - leave the page open for 30 seconds and confirm nothing in the heading moves;
  - navigate to another statistic page and back — the sweep plays again on each mount (that is correct, it is an entrance);
  - In DevTools → Animations panel, record 5 seconds while idle on the page: there should be **no** active animation entries once the entrance has finished. Before this change there was a permanently running one.
- **Done when**: `grep -n "repeat: Infinity" src/components/main-title/MainTitle.tsx` returns nothing.
