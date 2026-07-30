# 002 — Replace `transition: all` on the dock so theme switching stops animating

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 file, small
- **Audit finding**: #2

## Problem

```tsx
/* src/components/dock-drawer/DockDrawer.tsx:95-116 — current */
        sx={{
          mb: 1,
          px: 3,
          py: 2,
          display: "flex",
          gap: 2,
          borderRadius: "24px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background:
            "linear-gradient(135deg, rgba(var(--tertiary-color-rgb),1), rgba(var(--tertiary-color-rgb),0.8))",
          border: "1px solid rgba(var(--tertiary-color-rgb),0.18)",
          boxShadow:
            "0 8px 32px rgba(var(--secondary-color-rgb),0.35), inset 0 1px 0 rgba(var(--tertiary-color-rgb),0.25)",
          transform: open
            ? "translateY(0) scale(1)"
            : "translateY(120%) scale(0.9)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
```

`transition: all` makes the browser watch **every** animatable property on this element, not just the two that actually change on open/close. Because `background`, `border` and `boxShadow` here are all built from CSS custom properties, switching the app theme repaints them through this transition: the dock's colours crawl for 350ms **and overshoot** (the curve has a `1.56` control point) instead of changing instantly. It also animates off the GPU what should be a pure compositor job.

This is the default navigation position (`DEFAULT_NAV_POSITION = "bottom"` in `src/hooks/useNavPosition.tsx:44`), so it is on screen for most users.

The exact fix already exists in the sibling project — `D:\Projects\new_lpr_center\user_management\user-management\src\components\dock-drawer\DockDrawer.tsx:116-121`.

## Target

```tsx
/* target — replace only the `transition` line at src/components/dock-drawer/DockDrawer.tsx:114 */
          /*
            ระบุ property ให้ชัด แทน `all` — เดิมเบราว์เซอร์เฝ้าดูทุก property
            รวมถึงสีพื้นหลังที่มาจาก CSS variable ทำให้ตอนสลับธีมสีของ dock
            ค่อย ๆ ไล่ 0.35 วินาทีพร้อมเด้ง overshoot แทนที่จะเปลี่ยนทันที
          */
          transition: transitionOf(["transform", "opacity"], "slow", "emphasized"),
```

With plan 011's tokens that resolves to `transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms cubic-bezier(0.34, 1.56, 0.64, 1)`.

**If plan 011 has not run yet**, inline the literal instead — same meaning, no import:

```tsx
          transition:
            "transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 250ms cubic-bezier(0.23, 1, 0.32, 1)",
```

Keep the bouncy `cubic-bezier(0.34, 1.56, 0.64, 1)` on `transform`: a dock springing up from the bottom edge is the one place in this dashboard where overshoot is on-brand. Do **not** apply overshoot to anything else.

## Repo conventions to follow

- Motion tokens live in `src/constants/motion.ts` (plan 011). Import as `import { transitionOf } from "../../constants/motion";` under a `// Constants` banner — exemplar of that banner style at `src/components/nav-sidebar/NavSidebar.tsx:15-26`.
- The sibling project's version of this exact file is the reference implementation; match its comment (Thai) verbatim as shown in **Target**.
- All imports relative, no aliases.

## Steps

1. Open `src/components/dock-drawer/DockDrawer.tsx`.
2. If `src/constants/motion.ts` exists, add `import { transitionOf } from "../../constants/motion";` under a `// Constants` banner near the top imports; otherwise skip the import.
3. Replace line 114 (`transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",`) with the block from **Target** — the token version if the import was added, the literal version if not.
4. Leave `transform`, `opacity`, `pointerEvents`, `backdropFilter` and all colour properties exactly as they are.

## Boundaries

- Do NOT touch the per-item hover transition at `src/components/dock-drawer/DockDrawer.tsx:138-141` — that is plan 013.
- Do NOT touch the submenu `<Fade timeout={250}>` at `:188` — that is plan 010.
- Do NOT touch the `useEffect(() => clearCloseTimer, [])` cleanup at `:49-56`.
- Do NOT change `DEFAULT_NAV_POSITION` or anything in `src/hooks/useNavPosition.tsx`.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx eslint src/components/dock-drawer/DockDrawer.tsx` — the pre-existing error at `:130` (`item?.path && navigate(...)`, `no-unused-expressions`) is expected and must not be "fixed" here; no *new* errors.
- **Feel check**: run the app, make sure the menu position is `bottom` (Navbar → the sidebar icon → "ล่าง"), then:
  - hover the bottom edge to open the dock: it should still spring up with a slight overshoot, unchanged in feel;
  - **the key check** — with the dock open, switch the theme from the Navbar palette menu: the dock's background, border and glow must change **instantly**, with no 350ms colour crawl and no bounce. Before this change they eased and overshot;
  - in DevTools → Animations, open/close the dock and confirm only `transform` and `opacity` appear in the animated-properties list.
- **Done when**: `grep -n "transition: \"all" src/components/dock-drawer/DockDrawer.tsx` returns nothing, and theme switching leaves the dock's colours instantaneous.
