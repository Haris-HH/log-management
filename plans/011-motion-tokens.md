# 011 — Introduce shared motion tokens and a `transitionOf()` helper

- **Status**: TODO
- **Commit**: b13b768 (working tree also has uncommitted nav-position work in `src/layout/`, `src/hooks/useNavPosition.tsx`, `src/components/nav-sidebar/`, `src/components/nav-top-menu/`)
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 new file + 9 page edits, small
- **Audit finding**: #11

## Problem

There is no motion token anywhere in this repo. `src/index.css` (40 lines) holds only theme colours. Every duration and curve is hand-typed at its call site, which is why the same interaction feels different on different screens, and why `transition: all` slipped in twice (`src/components/dock-drawer/DockDrawer.tsx:114`, `src/components/select-menu/HoverSelectMenu.tsx:68`).

Durations currently in use: `0.2s`, `0.25s`, `0.3s`, `0.35s`, `0.4s`, `0.55s`, `0.8s`, `0.9s`, `2s`, `3s`, `4s`, `5s`.

The identical row-hover transition string is duplicated verbatim in nine pages:

```tsx
/* src/pages/StatisticUsagePerson.tsx:1189 — current (identical in 8 more files) */
transition: "background-color 0.2s ease",
```

The other eight: `src/pages/StatisticUsageLog.tsx:1200`, `src/pages/StatisticUsageAgency.tsx:962`, `src/pages/StatisticAccessLog.tsx:1228`, `src/pages/StatisticAccessPerson.tsx:1190`, `src/pages/StatisticAccessAgency.tsx:972`, `src/pages/StatisticSearchLogPlate.tsx:1285`, `src/pages/StatisticSearchPersonPlate.tsx:1260`, `src/pages/StatisticSearchAgencyPlate.tsx:1077`.

## Target

Create `src/constants/motion.ts` — a **verbatim port** of the file that already exists in the sibling project `D:\Projects\new_lpr_center\user_management\user-management\src\constants\motion.ts`. Copy it exactly as written below (the Thai comments are part of the file; keep them):

```ts
/* target — src/constants/motion.ts */
/*
  Motion tokens — จังหวะกลางของทั้งแอป

  ก่อนหน้านี้โปรเจกต์มี duration กระจัดกระจาย 12 ค่า (0.2s ถึง 5s) โดยไม่มี
  มาตรฐาน ทำให้ interaction แบบเดียวกันรู้สึกไม่เหมือนกันในแต่ละหน้า สามระดับนี้
  ครอบคลุมทุก transition ที่ไม่ใช่ ambient animation:

    fast  — ผู้ใช้ต้องรู้สึกว่า "ทันที" (hover, toggle, ปุ่ม)
    base  — การเคลื่อนที่ที่ตามองตามได้ (drawer, panel, การ์ด)
    slow  — องค์ประกอบใหญ่ที่กินพื้นที่จอ (overlay, การเปลี่ยนหน้า)
*/
export const MOTION_DURATION = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

export const MOTION_EASING = {
  /** การเปลี่ยนสถานะทั่วไป เช่น สี พื้นหลัง เส้นขอบ */
  standard: "ease",
  /** สิ่งที่กำลังปรากฏ — เข้าเร็วแล้วค่อย ๆ นิ่ง ไม่ใช่ ease-in ที่พุ่งชนตอนจบ */
  entrance: "cubic-bezier(0.23, 1, 0.32, 1)",
  /** การเคลื่อนที่บนจอ เช่น layout ที่เลื่อนหลบ drawer */
  movement: "cubic-bezier(0.32, 0.72, 0, 1)",
  /** สปริงเบา ๆ มี overshoot สำหรับ dock ที่ต้องการความเด้ง */
  emphasized: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

/**
 * สร้างสตริง `transition` จากรายชื่อ property ที่ระบุชัดเจน
 *
 * จงใจบังคับให้ส่ง property เป็น array เพื่อไม่ให้เผลอเขียน `transition: all`
 * ซึ่งทำให้เบราว์เซอร์เฝ้าดูทุก property รวมถึงตัวที่กระทบ layout และยัง
 * ทำให้การเปลี่ยนธีม (ซึ่งเปลี่ยนสีผ่าน CSS variable) ค่อย ๆ ไล่สีตามไปด้วย
 */
export const transitionOf = (
  properties: string[],
  duration: keyof typeof MOTION_DURATION = "base",
  easing: keyof typeof MOTION_EASING = "standard"
): string =>
  properties
    .map(
      (property) =>
        `${property} ${MOTION_DURATION[duration]}ms ${MOTION_EASING[easing]}`
    )
    .join(", ");
```

Two intentional differences from the sibling file — do not "fix" them back:
- `entrance` is `cubic-bezier(0.23, 1, 0.32, 1)`, not the bare `ease-out` keyword (built-in easings are too weak for deliberate motion).
- `movement` is a new fourth key, needed by plan 012.

Then replace the nine duplicated row-hover strings with:

```tsx
/* target — in each of the nine pages */
transition: transitionOf(["background-color"], "fast"),
```

## Repo conventions to follow

- Constants live in `src/constants/` as flat modules — see `src/constants/dropdown.tsx`, `src/constants/language.tsx`. `.ts` (not `.tsx`) is correct here: no JSX.
- Imports are grouped under banner comments. In each page, add the import under the existing `// Constants` banner if present, otherwise create one next to the other banner groups. Exemplar of the banner style: `src/layout/Navbar.tsx:31-32`.
- All imports are relative — from `src/pages/*.tsx` the path is `../constants/motion`.
- `verbatimModuleSyntax` is on, but these are value imports, so a plain `import { transitionOf } from "../constants/motion";` is correct (no `import type`).

## Steps

1. Create `src/constants/motion.ts` with exactly the content in **Target** above.
2. In each of the nine pages listed in **Problem**, add `import { transitionOf } from "../constants/motion";` under the `// Constants` banner (create the banner if the file lacks one).
3. In each of those nine pages, replace the single `transition: "background-color 0.2s ease",` line with `transition: transitionOf(["background-color"], "fast"),`.
4. Do not touch any other transition in those pages.

## Boundaries

- Do NOT migrate any other call site in this pass — the other plans (001-016) each migrate their own file and reference these tokens. Touching them here would collide with those plans.
- Do NOT delete or edit `src/constants/themes.tsx`, `src/index.css`, or any theme code.
- Do NOT add dependencies.
- Do NOT rename `MOTION_DURATION` / `MOTION_EASING` / `transitionOf` — plans 001-016 reference those exact names.
- If a page's row-hover line is not the exact string `transition: "background-color 0.2s ease",`, STOP and report.

## Verification

- **Mechanical**: `npm run build` (runs `tsc -b && vite build`) exits 0. `npx eslint src/constants/motion.ts` reports no errors. `npx vitest run` still shows 16 files / 198 tests passing.
- **Feel check**: open any statistic page (e.g. `/statistic-usage-person`), hover table rows. The row tint should now arrive in 150ms — noticeably crisper than the previous 200ms, and identical on all nine pages. Hover rows on two different statistic pages back to back and confirm they feel the same.
- **Done when**: `grep -rn "background-color 0.2s ease" src/pages` returns nothing, and `src/constants/motion.ts` exists with all four easing keys.
