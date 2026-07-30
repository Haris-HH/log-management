# 010 — Make dropdowns and the dock submenu grow from their trigger

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 2 files, small
- **Audit finding**: #10

## Problem

**(a)** The Navbar's language / theme / menu-position dropdowns use MUI's `<Grow>`, which scales from the element's **centre** by default. A menu anchored under a small icon should grow out of that icon, otherwise it reads as appearing out of nowhere:

```tsx
/* src/components/select-menu/HoverSelectMenu.tsx:86-95 — current */
      <Popper
        open={openMenu}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        transition
        sx={{ zIndex: 9999 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper
```

With `placement="bottom-start"` the panel hangs below and left-aligned with the trigger, so its origin should be its top-left corner.

**(b)** The same component's trigger animates with `transition: all` for 200ms although only `opacity` changes:

```tsx
/* src/components/select-menu/HoverSelectMenu.tsx:65-69 — current */
      <div
        ref={anchorRef}
        aria-label={iconOnly ? getLabel(selectedItem) : undefined}
        className="flex gap-1 items-center opacity-80 hover:opacity-100 cursor-pointer transition-all duration-200"
      >
```

**(c)** The dock's submenu is a bare cross-fade with no transform at all, so nothing connects it to the icon it belongs to:

```tsx
/* src/components/dock-drawer/DockDrawer.tsx:186-190 — current */
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={250}>
            <Paper
              onMouseEnter={() => {
```

## Target

**(a)** Tell `Grow` where to scale from, and give it an entrance-appropriate timeout. MUI's `Grow` accepts a `style` prop that is merged onto the transitioning element:

```tsx
/* target — src/components/select-menu/HoverSelectMenu.tsx */
        {({ TransitionProps }) => (
          /*
            placement="bottom-start" วางเมนูไว้ใต้ปุ่มโดยชิดซ้าย ดังนั้นต้อง
            ขยายออกจากมุมซ้ายบน ไม่ใช่จากจุดกลาง (ค่า default ของ Grow) ไม่งั้น
            เมนูจะดูเหมือนโผล่มาเฉย ๆ ไม่ได้มาจากปุ่มที่กด
          */
          <Grow {...TransitionProps} timeout={200} style={{ transformOrigin: "top left" }}>
            <Paper
```

**(b)**

```tsx
/* target — src/components/select-menu/HoverSelectMenu.tsx */
        className="flex gap-1 items-center opacity-80 hover:opacity-100 cursor-pointer transition-opacity duration-150"
```

**(c)** Swap `Fade` for `Grow` anchored to the bottom of the panel, since the dock sits at the bottom of the screen and its submenu opens upward (`placement="top"` at `src/components/dock-drawer/DockDrawer.tsx:183`):

```tsx
/* target — src/components/dock-drawer/DockDrawer.tsx */
        {({ TransitionProps }) => (
          /*
            เดิมเป็น Fade เปล่า ๆ ทำให้ submenu ไม่บอกว่ามาจากไอคอนไหน
            placement="top" เปิดขึ้นด้านบน จึงขยายจากขอบล่างของตัวเอง
          */
          <Grow {...TransitionProps} timeout={200} style={{ transformOrigin: "bottom center" }}>
            <Paper
              onMouseEnter={() => {
```

Exact values, do not substitute:
- `timeout={200}` on both — inside the 150-250ms dropdown budget. `Grow`'s default is `"auto"`, which derives duration from element height and can exceed 300ms for a tall menu.
- `transformOrigin: "top left"` for the navbar dropdowns (opens downward, left-aligned).
- `transformOrigin: "bottom center"` for the dock submenu (opens upward, centred on the icon).
- `transition-opacity duration-150` for the trigger.
- MUI `Grow` starts from `scale(0.75)`, not `scale(0)` — so no `scale(0)` violation is introduced by this swap.

`Grow` must be imported in `DockDrawer.tsx`; `Fade` becomes unused there and its import must be removed (`noUnusedLocals` is on, so `npm run build` fails otherwise).

## Repo conventions to follow

- MUI components are imported one per line from their deep paths: `import Grow from "@mui/material/Grow";` — see `src/components/select-menu/HoverSelectMenu.tsx:5` for the existing `Grow` import and `src/components/dock-drawer/DockDrawer.tsx:11` for the `Fade` one being replaced.
- Thai comments for non-obvious motion choices, matching `src/hooks/useNavPosition.tsx:20-26`.
- Tailwind `transition-*` utilities name the property they animate; the repo has no `transition-all` left after this plan and plan 005.

## Steps

1. `src/components/select-menu/HoverSelectMenu.tsx`: replace the trigger `className` (line 68) with the **Target (b)** version.
2. `src/components/select-menu/HoverSelectMenu.tsx`: add `timeout={200}` and the `style` prop to `<Grow>` (line 94), with the comment from **Target (a)**.
3. `src/components/dock-drawer/DockDrawer.tsx`: add `import Grow from "@mui/material/Grow";` next to the other MUI imports and **remove** `import Fade from "@mui/material/Fade";` (line 11).
4. `src/components/dock-drawer/DockDrawer.tsx`: replace `<Fade {...TransitionProps} timeout={250}>` (line 188) with the `<Grow>` from **Target (c)**, including the comment.
5. Verify no other `Fade` usage remains in `DockDrawer.tsx` before deleting its import.

## Boundaries

- Do NOT change `placement` on either `Popper`, or any `zIndex`.
- Do NOT restyle the `<Paper>` panels (border radius, shadow, background, padding).
- Do NOT touch the dock's own open/close transition at `src/components/dock-drawer/DockDrawer.tsx:114` (plan 002) or its item hover at `:138-141` (plan 013).
- Do NOT change `HoverSelectMenu`'s `iconOnly` behaviour or its `anchorRef` (the `anchorRef.current`-during-render eslint error at `:88` is pre-existing and out of scope — do not "fix" it here).
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` exits 0 — this specifically proves the `Fade` import was removed, since `noUnusedLocals` would otherwise fail the build. `npx eslint src/components/select-menu/HoverSelectMenu.tsx src/components/dock-drawer/DockDrawer.tsx` — the two pre-existing errors (`anchorRef.current` at HoverSelectMenu:88, `no-unused-expressions` at DockDrawer:130) are expected; no new ones. `npx vitest run` still 198 passing.
- **Feel check**: run the app:
  - hover the language icon in the Navbar and watch the panel's corner: it must expand out of the **top-left**, i.e. away from the icon and downward. Slow the Animations panel to 10% to see it clearly — before the change it inflated symmetrically from its own middle;
  - repeat for the theme and menu-position dropdowns (all three use this component);
  - set the menu position to `ล่าง` (bottom), hover a dock icon that has a submenu: the panel should now grow **upward out of the icon**, not just fade in place;
  - confirm none of the three navbar dropdowns takes noticeably longer than a quarter second, even the theme one with its ~18 entries (that is the `timeout={200}` replacing `"auto"`);
  - hover on and off the trigger repeatedly: only its opacity should change, with no other property lagging behind.
- **Done when**: `grep -rn "transition-all" src` returns nothing (together with plan 005), and `grep -n "Fade" src/components/dock-drawer/DockDrawer.tsx` returns nothing.
