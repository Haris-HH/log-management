# 004 — Add reduced-motion support across every ambient animation

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 new hook + 5 files, medium
- **Audit finding**: #4

## Problem

`grep -rn "prefers-reduced-motion\|useReducedMotion\|motion-reduce" src index.html` returns **zero hits**. Meanwhile the app runs several permanent, involuntary animations:

```tsx
/* src/layout/MainLayout.tsx:67-73 — current: a 4.5 MB video loops on every page, forever */
{/* Background Video */}
<video
  autoPlay
  loop
  muted
  playsInline
```

```tsx
/* src/components/main-title/MainTitle.tsx:43-52 — current: infinite underline sweep, on 16 pages */
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
```

```tsx
/* src/components/loading-screen/LoadingScreen.tsx:26-27 — current: infinite pulse (same code at ExportLoadingScreen.tsx:40-41) */
animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }}
transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
```

```tsx
/* src/components/cinematic-title/CinematicTitle.tsx:110-117 — current: infinite scaling 90px-blur glow */
animate={{
  scale: [1, 1.3, 1],
  opacity: [0.4, 0.8, 0.4],
}}
transition={{
  duration: 3,
  repeat: Infinity,
}}
```

```tsx
/* src/components/matrix-raining-effect/MatrixRainingEffect.tsx:63-72 — current: unconditional rAF canvas loop */
const animate = () => {
  const currentTime = Date.now();
  const elapsedTime = currentTime - lastFrameTime;

  if (elapsedTime > 1000 / frameRate) {
    draw();
    lastFrameTime = currentTime;
  }

  animationId = requestAnimationFrame(animate);
};
```

A user who has switched on "reduce motion" at the OS level gets none of it honoured. Looping background video and infinite scaling glows are exactly the triggers that setting exists for.

## Target

Create `src/hooks/useReducedMotion.ts` — a verbatim port of `D:\Projects\new_lpr_center\user_management\user-management\src\hooks\useReducedMotion.ts`:

```ts
/* target — src/hooks/useReducedMotion.ts */
// Material UI
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * ผู้ใช้เปิด "ลดการเคลื่อนไหว" ไว้ในระบบปฏิบัติการหรือไม่
 *
 * ใช้ `useMediaQuery` ของ MUI ให้เข้ากับที่โปรเจกต์ใช้อยู่แล้ว และเพื่อให้ทั้ง
 * คอมโพเนนต์ที่ใช้ framer-motion และที่ไม่ใช้ (canvas, วิดีโอพื้นหลัง) อ่านค่า
 * จากแหล่งเดียวกัน
 *
 * แนวทางเมื่อค่านี้เป็น true คือ "เบาลง ไม่ใช่ตัดทิ้ง" — ยังคง opacity และการ
 * เปลี่ยนสีที่ช่วยให้เข้าใจสถานะไว้ แต่ตัดการเคลื่อนที่ การหมุน การซูม และ
 * animation ที่วนไม่รู้จบออก ซึ่งเป็นตัวกระตุ้นอาการเวียนศีรษะ
 */
export const useReducedMotion = (): boolean =>
  useMediaQuery("(prefers-reduced-motion: reduce)");
```

The rule for every call site is **gentler, not zero** — keep opacity and colour feedback, drop movement/scale/rotation and anything infinite.

Per-file end state:

```tsx
/* target — src/layout/MainLayout.tsx: freeze the video on its first frame, keep the still image */
<video
  autoPlay={!prefersReducedMotion}
  loop={!prefersReducedMotion}
  muted
  playsInline
  aria-hidden="true"
```

```tsx
/* target — src/components/loading-screen/LoadingScreen.tsx and ExportLoadingScreen.tsx:
   keep the opacity pulse (it signals "still working"), drop the scale */
animate={
  prefersReducedMotion
    ? { opacity: [0.15, 0.3, 0.15] }
    : { scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }
}
transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
```

```tsx
/* target — src/components/cinematic-title/CinematicTitle.tsx: glow holds still at mid-opacity */
animate={
  prefersReducedMotion
    ? { scale: 1, opacity: 0.6 }
    : { scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }
}
transition={prefersReducedMotion ? { duration: 0 } : { duration: 3, repeat: Infinity }}
```

```tsx
/* target — src/components/matrix-raining-effect/MatrixRainingEffect.tsx:
   draw one static frame, then stop. No rAF loop at all. */
if (prefersReducedMotion) {
  draw();
  return;   // no requestAnimationFrame, no resize listener needed
}
```

For `MainTitle.tsx`: if plan 001 has already run, the infinite animation is gone and **no change is needed here** — verify and skip. If 001 has not run, gate it:

```tsx
/* target — src/components/main-title/MainTitle.tsx, only if plan 001 has NOT run yet */
animate={prefersReducedMotion ? { scaleX: 1, x: "0%" } : { scaleX: [0, 1, 0], x: ["0%", "0%", "100%"] }}
transition={prefersReducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] }}
```

## Repo conventions to follow

- Hooks live flat in `src/hooks/` and are named `useX`. Exemplar of a one-line media-query hook consumed by many components: `src/hooks/useTheme.tsx` (context) and the `useMediaQuery` usage at `src/hooks/useNavPosition.tsx:128-130`.
- Import banner: add under `// Hooks` (create the banner if absent, matching `src/layout/MainLayout.tsx:56-57`).
- Do NOT use framer-motion's own `useReducedMotion` — the canvas and the `<video>` are not framer components and must read the same source as everything else.
- MatrixRainingEffect's effect currently has `[]` deps (`src/components/matrix-raining-effect/MatrixRainingEffect.tsx:12` .. `:100`). Add `prefersReducedMotion` to the dep array so toggling the OS setting re-runs it.

## Steps

1. Create `src/hooks/useReducedMotion.ts` with exactly the content in **Target**.
2. `src/layout/MainLayout.tsx`: import the hook, add `const prefersReducedMotion = useReducedMotion();` next to the other hook calls, and apply the `<video>` change (including `aria-hidden="true"`). Add a short comment above the `<video>` explaining why it freezes.
3. `src/components/loading-screen/LoadingScreen.tsx`: import the hook and apply the pulse change at lines 26-27. Leave the two `motion.path` `pathLength` animations alone — plan 003 owns those.
4. `src/components/loading-screen/ExportLoadingScreen.tsx`: same change at lines 40-41. Also gate the bottom text pulse at `:99-106` (`opacity: [0.6, 1, 0.6]`) — that one is opacity-only, so it may stay as-is; only confirm it does not also move.
5. `src/components/cinematic-title/CinematicTitle.tsx`: import the hook and apply the glow change at lines 110-117.
6. `src/components/matrix-raining-effect/MatrixRainingEffect.tsx`: import the hook, add the early static-frame return shown in **Target** after `draw` is defined and before `animate()` is called, and add `prefersReducedMotion` to the effect deps.
7. `src/components/main-title/MainTitle.tsx`: check whether the infinite animation still exists. If yes, apply the gate from **Target**. If plan 001 already removed it, change nothing and note that in your report.

## Boundaries

- Do NOT reduce durations, change easings, or restructure any animation here — this plan only adds the reduced-motion branch. Duration/easing fixes belong to plans 001-016.
- Do NOT remove the `<video>` element or its `<source>`; it must still render its first frame as a background.
- Do NOT touch `src/pages/Login.tsx` intro timing (plan 009) or `src/pages/Home.tsx` (plan 005).
- Do NOT add a global `@media (prefers-reduced-motion)` block that nukes all animation — "gentler, not zero".
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx eslint src/hooks/useReducedMotion.ts src/layout/MainLayout.tsx src/components/matrix-raining-effect/MatrixRainingEffect.tsx` — no new errors (`MatrixRainingEffect` may keep pre-existing warnings). `npx vitest run` still 198 passing.
- **Feel check**: with the app running, open DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce", then:
  - any page: the background video is a still frame, not moving; sound was already muted so nothing else changes.
  - trigger a data load: the loading screen still pulses in brightness (you can tell it is alive) but nothing grows or shrinks.
  - `/login`: the glow behind the title sits still at a constant brightness; the matrix rain shows one frozen frame of characters instead of falling.
  - switch the emulation back off and confirm every animation returns to its original behaviour.
- **Done when**: `grep -rn "useReducedMotion" src` lists the hook plus at least 4 call sites, and the reduced-motion emulation above shows no looping movement anywhere in the app.
