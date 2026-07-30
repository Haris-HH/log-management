# 006 — Drive the export progress bar with `scaleX`, not `width`

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file, small
- **Audit finding**: #6

## Problem

```tsx
/* src/components/loading-screen/ExportLoadingScreen.tsx:155-178 — current */
      <div className="absolute bottom-0 w-112.5">
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{
            backgroundColor: "rgba(var(--secondary-color-rgb),0.1)",
          }}
        >
          <motion.div
            animate={{
              width: `${safePercent}%`,
            }}
            transition={{
              duration: 0.3,
            }}
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg,var(--primary-color),#DBD65A)",
              boxShadow:
                "0 0 10px #DBD65A, 0 0 20px #DBD65A, 0 0 40px #DBD65A",
            }}
          />
        </div>
```

Three compounding problems:

1. **`width` is a layout property.** Every frame relayouts the bar and repaints its three-layer glow (`boxShadow` with 10px/20px/40px spreads).
2. **This is the worst possible moment for main-thread work.** The export pipeline in `src/utils/exportData.tsx` and `src/pdf/*Pdf.tsx` runs `exceljs` / `pdfmake` synchronously over up to `CHUNK_SIZE = 1000` rows per file, so the main thread is saturated exactly while this bar is meant to be reassuring the user. framer-motion drives tweens from rAF on the main thread, so the bar stalls with it — the export looks hung.
3. Progress is constant motion, which takes `linear`; framer's default tween easing is not linear, so each chunk's step eases in and out for no reason.

## Target

A compositor-only `scaleX` transform, growing from the left, driven by a plain CSS transition so it keeps moving even when JS is blocked:

```tsx
/* target — src/components/loading-screen/ExportLoadingScreen.tsx */
      <div className="absolute bottom-0 w-112.5">
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{
            backgroundColor: "rgba(var(--secondary-color-rgb),0.1)",
          }}
        >
          {/*
            scaleX แทน width — width ต้องคำนวณ layout ใหม่ทุกเฟรมพร้อม repaint
            เงาเรืองแสงสามชั้น และเป็น CSS transition ไม่ใช่ framer เพราะตอน
            export นั้น exceljs/pdfmake กิน main thread เต็ม แถบที่ขับด้วย rAF
            จะค้างไปกับมัน แต่ CSS transition ยังวิ่งบน compositor ได้
          */}
          <div
            className="h-full w-full rounded-full origin-left"
            style={{
              background:
                "linear-gradient(90deg,var(--primary-color),#DBD65A)",
              boxShadow:
                "0 0 10px #DBD65A, 0 0 20px #DBD65A, 0 0 40px #DBD65A",
              transform: `scaleX(${safePercent / 100})`,
              transition: "transform 300ms linear",
            }}
          />
        </div>
```

Exact values, do not substitute:
- `transform: scaleX(safePercent / 100)` — `safePercent` is already clamped to 0-100 at `src/components/loading-screen/ExportLoadingScreen.tsx:29`.
- `origin-left` (Tailwind for `transform-origin: left`) so the bar grows from the left edge, not from its centre.
- `w-full` replaces the animated width: the element is always full width and is scaled down instead.
- `transition: "transform 300ms linear"` — 300ms matches the old duration; `linear` because progress is constant motion.
- The element becomes a plain `<div>`; `motion.div` is no longer needed here.

The gradient is worth one note: scaling a `linear-gradient(90deg, …)` horizontally squashes the gradient rather than revealing it. At the sizes involved (450px bar, two adjacent yellows) this is imperceptible — confirm it in the feel check, and if it does read badly, the fix is to move the gradient to the *track* `<div>` and make the bar a solid `var(--primary-color)`. Do not preemptively restructure.

## Repo conventions to follow

- Tailwind utilities for layout, `style`/`sx` for themed colour — this file already mixes both (`className="h-3 rounded-full overflow-hidden"` + `style={{ backgroundColor: "rgba(var(--secondary-color-rgb),0.1)" }}`). Keep that split.
- Thai explanatory comments for non-obvious motion decisions match the house style — see the comment style in `src/hooks/useNavPosition.tsx:20-26`.
- framer-motion stays imported in this file for the other animations; only this one element stops using it.

## Steps

1. Open `src/components/loading-screen/ExportLoadingScreen.tsx`.
2. Replace the `<motion.div>` progress bar (lines 163-178) with the plain `<div>` from **Target**, including the comment.
3. Confirm `motion` is still used elsewhere in the file (it is — lines 38, 99, 129, 163 before this edit) so the import must stay. Do not remove the import.
4. Leave the track `<div>`, the `w-112.5` wrapper and `safePercent` untouched.

## Boundaries

- Do NOT touch the pulsing halo at `:38-45` or the counter at `:129-154` — the halo's reduced-motion gate is plan 004's job.
- Do NOT change `src/hooks/useExportProgress.tsx` or any export logic in `src/utils/exportData.tsx` / `src/pdf/*`.
- Do NOT try to make the export itself non-blocking (web workers, chunk yielding) — out of scope, and a much larger change.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx eslint src/components/loading-screen/ExportLoadingScreen.tsx` — no new errors. `npx vitest run` still 198 passing.
- **Feel check**: on any statistic page with enough data to need more than one chunk (>1000 rows), start an Excel export:
  - the bar grows from the **left edge**, smoothly, in steps as each chunk completes — if it grows from the centre outwards, `origin-left` is missing;
  - **the key check** — during the heaviest part of the export (watch the DevTools Performance panel for a long task), the bar must keep animating. Before this change it froze along with the main thread;
  - confirm the yellow gradient still looks like a gradient and not a visibly squashed one at 10%, 50% and 90% progress. If it looks wrong, apply the fallback described at the end of **Target** and say so in your report;
  - the glow around the bar must not flicker or re-render at the edges as it grows.
- **Done when**: `grep -n "width: \`\${safePercent}" src/components/loading-screen/ExportLoadingScreen.tsx` returns nothing.
