# 013 — Tone down the dock item hover and gate it to real pointers

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: LOW
- **Category**: Accessibility / Cohesion
- **Estimated scope**: 1 file, small
- **Audit finding**: #13

## Problem

```tsx
/* src/components/dock-drawer/DockDrawer.tsx:132-142 — current */
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              transition: "transform 0.25s ease",
              "&:hover": {
                transform: "translateY(-10px) scale(1.15)",
              },
            }}
```

Two issues:

1. **It is oversized for this product.** A 10px lift plus a 15% enlargement is macOS-dock playfulness in an application whose job is presenting police access logs. The rest of the app's hover feedback is a subtle background tint (e.g. `src/components/nav-sidebar/NavSidebar.tsx:51-54`), so this one component reads as belonging to a different app.
2. **It is not gated to pointer devices.** On a touch screen, tapping fires a synthetic hover that then **sticks** — the item stays lifted and enlarged after the tap, because nothing ever moves the pointer away. The audit's rule for any hover-driven transform is to wrap it in `@media (hover: hover) and (pointer: fine)`.

## Target

```tsx
/* target — src/components/dock-drawer/DockDrawer.tsx */
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              transition: transitionOf(["transform"], "fast"),
              /*
                ครอบด้วย hover: hover เพราะบนจอสัมผัส การแตะจะยิง hover ปลอม
                แล้วค้างอยู่ — ไอคอนจะยกตัวค้างไว้ตลอดหลังแตะ
              */
              "@media (hover: hover) and (pointer: fine)": {
                "&:hover": {
                  transform: "translateY(-4px) scale(1.06)",
                },
              },
            }}
```

Exact values, do not substitute:
- `translateY(-4px) scale(1.06)` — enough to feel responsive, small enough to belong in a dashboard.
- `transitionOf(["transform"], "fast")` = `transform 150ms ease`. `ease` is the correct curve for hover; `fast` is the correct band. **If plan 011 has not run**, inline `transition: "transform 150ms ease",` instead.
- The media query wraps `&:hover`, not the other way round — MUI's `sx` supports media queries as keys at any level, and this nesting order is what produces `@media (…) { .css-x:hover { … } }`.

## Repo conventions to follow

- `sx` with nested selectors is the established pattern in this file and across the repo — exemplar `src/layout/Navbar.tsx:557-560` (`"&:hover": { … }` inside `sx`).
- Motion tokens from `src/constants/motion.ts` (plan 011); import under a `// Constants` banner. Plan 002 adds that same import to this file — if it is already there, reuse it, do not duplicate.
- Thai comments for non-obvious decisions.

## Steps

1. Open `src/components/dock-drawer/DockDrawer.tsx`.
2. Ensure `import { transitionOf } from "../../constants/motion";` exists (plan 002 may have added it); add it if not, or skip if plan 011 has not run.
3. Replace the `transition` line and the `"&:hover"` block inside the item `sx` (lines 137-141) with the **Target** version.
4. Leave `display`, `flexDirection`, `alignItems`, `cursor`, the `onMouseEnter`/`onClick` handlers and the nested `IconButton`/`Typography` styles untouched.

## Boundaries

- Do NOT touch the dock container's transition at `src/components/dock-drawer/DockDrawer.tsx:114` — that is plan 002.
- Do NOT touch the submenu transition at `:186-190` — that is plan 010.
- Do NOT remove the hover effect entirely; the dock still needs to indicate which item the pointer is on.
- Do NOT add `@media (hover: hover)` anywhere else in this pass.
- Do NOT change the `IconButton`'s 56×56 size or its gradient.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx eslint src/components/dock-drawer/DockDrawer.tsx` — the pre-existing `no-unused-expressions` error at `:130` is expected; no new errors. `npx vitest run` still 198 passing.
- **Feel check**: run the app with the menu position set to `ล่าง` (bottom):
  - hover across the dock items: each lifts slightly and settles in about 150ms. It should feel like a dashboard responding, not a toy bouncing;
  - move the pointer off an item and confirm it returns immediately, with no residual scale;
  - **the touch check** — in DevTools, toggle device emulation to a touch device (Toggle device toolbar, pick a phone) and tap a dock item. The item must **not** stay lifted afterwards. Before this change it did. If it still sticks, the media query is nested the wrong way round;
  - with emulation still on, confirm the dock is otherwise fully usable (items still navigate on tap).
- **Done when**: `grep -n "scale(1.15)" src/components/dock-drawer/DockDrawer.tsx` returns nothing and the item hover block sits inside an `@media (hover: hover) and (pointer: fine)` key.
