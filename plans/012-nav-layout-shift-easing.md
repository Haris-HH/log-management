# 012 — Use a movement curve for the sidebar layout shift

- **Status**: TODO
- **Commit**: b13b768 (the code this plan edits is **uncommitted** working-tree work — see Boundaries)
- **Severity**: LOW
- **Category**: Easing & duration
- **Estimated scope**: 2 files, tiny
- **Audit finding**: #12

## Problem

When the left/right nav sidebar is pinned or unpinned, the page content and the navbar both slide to make room. Both use the bare `ease` keyword:

```tsx
/* src/layout/MainLayout.tsx:56-64 — current */
          /*
            A pinned sidebar reserves space rather than covering the page, so the
            content is inset on whichever side it is anchored to. The transition
            matches the navbar's so the layout shifts as one.
          */
          marginLeft: navPosition === "left" ? sidebarOffset : 0,
          marginRight: navPosition === "right" ? sidebarOffset : 0,
          transition: "margin 0.25s ease",
```

```tsx
/* src/layout/Navbar.tsx:282-293 — current */
        /*
          The pinned sidebar runs the full height of the viewport, so the navbar
          steps aside for it instead of covering it. `left` is set explicitly
          because a fixed AppBar defaults to `left: auto; right: 0`, which would
          silently put the gap on the wrong side for a right-anchored sidebar;
          pinning `left` and `right: auto` makes one rule cover every position.
          The transition matches the page content's so the layout shifts as one.
        */
        width: `calc(100% - ${sidebarOffset}px)`,
        left: navPosition === "left" ? `${sidebarOffset}px` : 0,
        right: "auto",
        transition: "width 0.25s ease, left 0.25s ease",
```

`ease` is the right choice for hover and colour changes. This is neither: it is a sizeable element **moving on screen**, which takes an ease-in-out style curve so it accelerates away and decelerates into its new position. The built-in `ease` keyword is also too weak to read as deliberate at this scale.

Both call sites must stay in step — if they diverge, the navbar and the page content visibly slide at different rates and a seam opens between them.

Separately, these are layout properties (`margin`, `width`, `left`) rather than transforms, so the shift costs layout every frame. That is **not** fixed here: the sidebar genuinely reserves space, and faking it with `transform` would leave the content's real width wrong (breaking table column widths, chart `ResponsiveContainer` measurements and the leaflet map's `invalidateSize`). Accepting layout cost on a rare, deliberate, user-initiated toggle is the correct trade — do not "optimise" it into a transform.

## Target

```tsx
/* target — src/layout/MainLayout.tsx */
          transition: transitionOf(["margin"], "base", "movement"),
```

```tsx
/* target — src/layout/Navbar.tsx */
        transition: transitionOf(["width", "left"], "base", "movement"),
```

Both resolve to `250ms cubic-bezier(0.32, 0.72, 0, 1)` — the iOS-style drawer curve, from `MOTION_EASING.movement` in `src/constants/motion.ts`.

**If plan 011 has not run yet**, inline the identical literal in both files instead:

```tsx
/* MainLayout.tsx */  transition: "margin 250ms cubic-bezier(0.32, 0.72, 0, 1)",
/* Navbar.tsx */      transition: "width 250ms cubic-bezier(0.32, 0.72, 0, 1), left 250ms cubic-bezier(0.32, 0.72, 0, 1)",
```

The duration stays at 250ms (`base`) — unchanged from today, only the curve changes.

## Repo conventions to follow

- `src/constants/motion.ts` from plan 011 is the token source; import as `import { transitionOf } from "../constants/motion";` under a `// Constants` banner. `src/layout/Navbar.tsx` already has such a banner at line 31; `src/layout/MainLayout.tsx` needs one added next to its `// Hooks` banner.
- The two existing explanatory comments above each `transition` are accurate and must be kept as-is.
- Both files are layout-level and hand-edited together by design — the comments in each already say "matches the navbar's" / "matches the page content's". Keep that invariant true.

## Steps

1. `src/layout/MainLayout.tsx`: add the `transitionOf` import (or skip if plan 011 has not run) and replace line 64 with the **Target** version.
2. `src/layout/Navbar.tsx`: add the import under the existing `// Constants` banner (line 31) and replace line 293 with the **Target** version.
3. Use the same variant in both files — either both use the token or both use the literal. Never mix.

## Boundaries

- **The code in these two files is uncommitted working-tree work** (the nav-position feature). Do not `git stash`, `git checkout` or otherwise discard it. If `git status` shows a clean tree and these lines are missing, the work was committed or reverted — STOP and report rather than guessing.
- Do NOT convert `margin` / `width` / `left` to transforms (see the reasoning in **Problem**).
- Do NOT change `NAV_SIDEBAR_WIDTH`, `sidebarOffset`, or anything in `src/hooks/useNavPosition.tsx`.
- Do NOT touch the drawer's own slide animation — that is MUI `<Drawer>`'s built-in transition inside `src/components/nav-sidebar/NavSidebar.tsx`, and it is out of scope.
- Do NOT change the row/group transitions in `src/components/nav-sidebar/NavSidebar.tsx:54` or `:284`, or `src/components/nav-top-menu/NavTopMenu.tsx:112` — those are hover/colour changes where `ease` is already correct.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx eslint src/layout/MainLayout.tsx src/layout/Navbar.tsx` — the pre-existing `react-hooks/set-state-in-effect` error at `Navbar.tsx:209` is expected; no new errors. `npx vitest run` still 198 passing.
- **Feel check**: run the app, set the menu position to `ซ้าย` (left) from the Navbar's sidebar-icon dropdown:
  - close the drawer with its X, then reopen it with the hamburger. The navbar and the page content must move as **one piece** — watch the seam between them at 10% playback speed in the Animations panel; no gap or lag may appear between the two;
  - the movement should now start decisively and settle softly, rather than the flatter feel of `ease`;
  - repeat with position `ขวา` (right) and confirm the gap opens on the correct side;
  - toggle the drawer open/closed five times quickly: because these are CSS transitions they retarget from wherever they are — the motion must never jump or restart from the far edge.
- **Done when**: `grep -rn "0.25s ease" src/layout` returns nothing.
