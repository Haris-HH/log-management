# 015 — Decide the fate of the disabled custom cursor

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: LOW
- **Category**: Performance
- **Estimated scope**: 1 file (delete) or 1 file (repair), small
- **Audit finding**: #15

## Problem

`src/components/custom-cursor/CustomCursor.tsx` is **not rendered anywhere** — both its import and its usage are commented out:

```tsx
/* src/App.tsx:8 — current */
// import CustomCursor from "./components/custom-cursor/CustomCursor";

/* src/App.tsx:150 — current */
      {/* <CustomCursor /> */}
```

So it costs nothing at runtime today. But it is 108 lines of dead code carrying three defects that will bite the moment anyone uncomments those lines:

**(a) The two axis springs have wildly different stiffness**, so the dot does not follow the pointer in a straight line — on any diagonal movement X catches up more than three times faster than Y, bending the path:

```tsx
/* src/components/custom-cursor/CustomCursor.tsx:25-35 — current */
  const springX = useSpring(mouseX, {
    stiffness: 4000,
    damping: 40,
    mass: 0.1,
  });

  const springY = useSpring(mouseY, {
    stiffness: 1200,
    damping: 40,
    mass: 0.1,
  });
```

**(b) A forced style recalculation plus a React re-render on every `mousemove` event.** `getComputedStyle()` flushes pending style work synchronously, and `setCursorVariant` is called unconditionally on every event, re-rendering the component hundreds of times a second:

```tsx
/* src/components/custom-cursor/CustomCursor.tsx:37-58 — current */
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX - 5);
      mouseY.set(e.clientY - 5);

      const target = e.target as HTMLElement | null;

      if (!target) {
        setCursorVariant("default");
        return;
      }

      const clickableElement = target.closest(CLICKABLE_SELECTOR);
      const computedCursor = window.getComputedStyle(target).cursor;

      if (clickableElement || computedCursor === "pointer") {
        setCursorVariant("pointer");
      } 
      else {
        setCursorVariant("default");
      }
    };
```

**(c) No pointer-device gate and animated `border`/`backdropFilter`.** On a touch device the dot renders at `(0,0)` and never moves. `border: "0px solid transparent"` → `"2px solid …"` in the variants (lines 67-80) animates a layout-affecting property, and `backdropFilter: "blur(8px)"` (line 89) on an element that moves every frame forces the backdrop to re-composite continuously.

## Target

**Pick one of the two options below and do only that one.** Default to Option A unless the repo owner has said the cursor is coming back.

### Option A — delete it (recommended)

- Delete `src/components/custom-cursor/CustomCursor.tsx`.
- Delete the commented-out import at `src/App.tsx:8` and the commented-out usage at `src/App.tsx:150`.
- Nothing else references it — verify with `grep -rn "CustomCursor" src` before and after.

Rationale: `knip` is already a devDependency in this project for exactly this class of finding. A disabled component with three latent defects is worse than no component, because the next person to uncomment it inherits them silently.

### Option B — repair it, leave it disabled

If it must be kept, all three defects get fixed:

```tsx
/* target (Option B) — matched springs, src/components/custom-cursor/CustomCursor.tsx */
  const SPRING = { stiffness: 1200, damping: 40, mass: 0.1 } as const;

  const springX = useSpring(mouseX, SPRING);
  const springY = useSpring(mouseY, SPRING);
```

```tsx
/* target (Option B) — one state write per change, and no forced style read */
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX - 5);
      mouseY.set(e.clientY - 5);

      const target = e.target as HTMLElement | null;
      const isClickable = !!target?.closest(CLICKABLE_SELECTOR);

      /* setState เฉพาะตอนค่าเปลี่ยนจริง — เดิมเรียกทุก mousemove ทำให้ component
         re-render หลายร้อยครั้งต่อวินาที และ getComputedStyle ยังบังคับให้
         เบราว์เซอร์คำนวณ style ใหม่ทันทีทุกอีเวนต์ด้วย */
      setCursorVariant((prev) => {
        const next = isClickable ? "pointer" : "default";

        return prev === next ? prev : next;
      });
    };
```

The `window.getComputedStyle(target).cursor` check is deleted entirely: `CLICKABLE_SELECTOR` already includes `.cursor-pointer` and `[data-cursor="pointer"]`, which covers the same intent without a synchronous style flush.

```tsx
/* target (Option B) — variants without layout-affecting properties */
  const variants = {
    default: {
      scale: 1,
      opacity: 1,
      backgroundColor: "var(--primary-color)",
      boxShadow: "0 0 8px rgba(var(--tertiary-color-rgb),0.8)",
    },
    pointer: {
      scale: 2,
      opacity: 0.9,
      backgroundColor: "rgba(var(--primary-color-rgb), 0.15)",
      boxShadow: "0 0 18px rgba(var(--primary-color-rgb), 0.8), inset 0 0 0 2px rgba(var(--primary-color-rgb), 1)",
    },
  }
```

The `border` is replaced by an `inset` box-shadow, which paints a ring without changing the element's box. Delete `backdropFilter: "blur(8px)"` from the `style` prop (line 89) and delete the now-duplicated `boxShadow` there (lines 90-93) since the variants own it.

And the pointer gate, at the top of the component:

```tsx
/* target (Option B) — src/components/custom-cursor/CustomCursor.tsx */
// Material UI
import useMediaQuery from "@mui/material/useMediaQuery";

// Hooks
import { useReducedMotion } from "../../hooks/useReducedMotion";

  const isFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const prefersReducedMotion = useReducedMotion();

  /* ไม่มี pointer จริง (จอสัมผัส) จุดจะค้างที่ (0,0) และถ้าผู้ใช้ขอลดการ
     เคลื่อนไหว เคอร์เซอร์ที่วิ่งตามแบบมีหน่วงก็ไม่ควรมี */
  if (!isFinePointer || prefersReducedMotion) return null;
```

Note the early return must come **after** all hook calls (`useMotionValue`, `useSpring`, `useState`, `useEffect`) to keep hook order stable — put it immediately before the `return (` of the JSX.

## Repo conventions to follow

- `useMediaQuery` from `@mui/material/useMediaQuery` is how this repo reads media queries — exemplar `src/hooks/useNavPosition.tsx:128-130`.
- `useReducedMotion` comes from plan 004. If plan 004 has not run and you chose Option B, inline `useMediaQuery("(prefers-reduced-motion: reduce)")` instead.
- Import banners (`// Material UI`, `// Hooks`) per `src/layout/MainLayout.tsx`.

## Steps (Option A)

1. `grep -rn "CustomCursor" src` and record every hit (expected: `src/App.tsx:8`, `src/App.tsx:150`, and the component file itself).
2. Delete `src/components/custom-cursor/CustomCursor.tsx` and its now-empty `src/components/custom-cursor/` directory.
3. Delete the two commented-out lines in `src/App.tsx`.
4. Re-run the grep and confirm zero hits.

## Steps (Option B)

1. Apply the four **Target (Option B)** edits to `src/components/custom-cursor/CustomCursor.tsx`: matched springs, the `moveCursor` rewrite, the variants, and the pointer/reduced-motion gate.
2. Remove `backdropFilter` and the duplicated `boxShadow` from the `style` prop.
3. Leave `src/App.tsx` commented out — this plan does not enable the cursor.

## Boundaries

- Do NOT uncomment `<CustomCursor />` in `src/App.tsx`. Enabling a global custom cursor is a product decision, not a motion fix.
- Do NOT do both options.
- Do NOT touch anything else in `src/App.tsx` (routing, the `force-logout` listener, the dropdown thunks).
- Do NOT add dependencies.
- If `src/App.tsx:150` is already uncommented (i.e. the cursor is live), STOP and report — the severity and the correct fix both change.

## Verification

- **Mechanical**: `npm run build` exits 0 (`noUnusedLocals` will catch a stray import if Option A missed one). `npx eslint src` shows no *new* errors. `npx vitest run` still 198 passing. For Option A, `npx knip` should no longer list `CustomCursor` (knip has no config in this repo, so expect unrelated noise — just check that entry is gone).
- **Feel check (Option A)**: run the app and confirm nothing changed visually anywhere — the component was never rendered, so any visible difference means something else was edited by mistake.
- **Feel check (Option B)**: temporarily uncomment `<CustomCursor />` locally (do **not** commit that), then:
  - move the pointer in a diagonal sweep across the screen: the dot must track a straight line behind the pointer, not bow off to one side. This is the matched-stiffness fix;
  - hover a button: the ring should appear without the dot's box changing size in layout terms (no neighbouring reflow);
  - in DevTools → Performance, record 5 seconds of continuous mouse movement: there must be no "Recalculate Style" entry per `mousemove` and no React commit per event;
  - switch on touch emulation and confirm the dot does not render at all;
  - re-comment the usage before finishing.
- **Done when**: Option A — `grep -rn "CustomCursor" src` returns nothing. Option B — the springs share one config object, `getComputedStyle` is gone from the file, and the component returns `null` on touch/reduced-motion.
