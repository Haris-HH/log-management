# 014 — Give the map search control one owner for its show/hide transition

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 2 files, small
- **Audit finding**: #14

## Problem

The same transition is declared twice for the same element — once in CSS, once as an inline style written by JS:

```css
/* src/App.css:159-170 — current */
#leaflet-search-control-container {
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s !important;
  opacity: 1;
  visibility: visible;
  transform: scale(1);
}

#leaflet-search-control-container.is-hidden {
  opacity: 0;
  visibility: hidden;
  transform: scale(0.8);
}
```

```ts
/* src/hooks/useOpenStreetMap.tsx:192-201 — current */
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control custom-search-filter-control');
            container.id = 'leaflet-search-control-container';

            container.style.transition = 'opacity 0.3s ease, transform 0.3s ease, visibility 0.3s';
            if (config.showFilter) {
              container.style.opacity = '0';
              container.style.visibility = 'hidden';
              container.style.transform = 'scale(0.8)';
            }
```

Three smaller problems on top of the duplication:

1. Two copies of one value drift apart. The CSS copy already carries `!important` specifically to win against the inline one — a fight that only exists because both exist.
2. `visibility 0.3s` in the transition list does nothing useful: `visibility` is a discrete property, so it simply flips at the end of the duration. Harmless but misleading.
3. `ease` on an element that is appearing/disappearing should be a strong ease-out.

Note the JS also sets `container.style.display = 'none'` at `src/hooks/useOpenStreetMap.tsx:207` when starting hidden, which defeats the transition entirely for that path. That is existing behaviour — see Boundaries.

## Target

CSS owns the transition; JS only toggles the class. The initial hidden state becomes the same `is-hidden` class the rest of the code already uses.

```css
/* target — src/App.css */
#leaflet-search-control-container {
  transition:
    opacity 250ms cubic-bezier(0.23, 1, 0.32, 1),
    transform 250ms cubic-bezier(0.23, 1, 0.32, 1);
  opacity: 1;
  visibility: visible;
  transform: scale(1);
}

#leaflet-search-control-container.is-hidden {
  opacity: 0;
  visibility: hidden;
  transform: scale(0.8);
}
```

```ts
/* target — src/hooks/useOpenStreetMap.tsx */
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control custom-search-filter-control');
            container.id = 'leaflet-search-control-container';

            /* transition อยู่ที่ #leaflet-search-control-container ใน App.css
               ที่เดียว — ที่นี่แค่ตั้งสถานะเริ่มต้นด้วย class เดียวกับที่ใช้
               ซ่อน/แสดงตอนรันไทม์ */
            if (config.showFilter) {
              container.classList.add('is-hidden');
            }
```

Exact values, do not substitute:
- `250ms cubic-bezier(0.23, 1, 0.32, 1)` — the dropdown/appearing band with the strong ease-out curve.
- `visibility` is dropped from the transition list but **kept** as a declared property in both rules; it is what removes the hidden control from the tab order.
- `!important` is removed — with the inline style gone there is nothing left to out-specify.
- `scale(0.8)` stays; it is not `scale(0)`, so it is within the rules.
- The three inline `opacity` / `visibility` / `transform` assignments are replaced by the single `classList.add('is-hidden')`.

`src/constants/motion.ts` (plan 011) is TypeScript and cannot be referenced from `App.css`, so this file keeps literals. Do not introduce a parallel set of CSS custom properties for motion just for this one rule.

## Repo conventions to follow

- Leaflet control styling lives in `src/App.css` under `.custom-*-control` / `#leaflet-*` selectors — see `src/App.css:130-157` for the sibling `.custom-search-filter-control` rule.
- The `is-hidden` class is already the runtime mechanism for this control; search the repo for `is-hidden` and follow whatever toggles it (it is toggled outside the creation callback).
- Leaflet's `L.DomUtil.create` + `classList` is the idiomatic pattern in `src/hooks/useOpenStreetMap.tsx`.

## Steps

1. `src/App.css`: replace the `#leaflet-search-control-container` rule (lines 159-164) with the **Target** version. Leave the `.is-hidden` rule (lines 166-170) unchanged.
2. `src/hooks/useOpenStreetMap.tsx`: replace lines 195-201 with the **Target** version (the comment, and the `classList.add` in place of the three inline style writes).
3. `grep -rn "is-hidden" src` and confirm whatever toggles the class at runtime still works with the class-only initial state — the element now starts with `is-hidden` instead of inline styles, so a toggler that only adds/removes the class continues to function.
4. Leave `container.style.display = 'none'` at line 207 exactly as it is.

## Boundaries

- Do NOT remove or change `container.style.display = 'none'` (line 207). It short-circuits the transition on first render, which looks like a bug, but changing display handling risks the leaflet control's layout and click-through behaviour. Report it as a follow-up instead.
- Do NOT touch any other control in `src/hooks/useOpenStreetMap.tsx` (zoom, fullscreen, current-location, style).
- Do NOT touch `src/pages/OverallMap.tsx` — the filter panel's own animation is plan 007.
- Do NOT convert other `src/App.css` rules to tokens or add CSS custom properties for motion.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx eslint src/hooks/useOpenStreetMap.tsx` — no new errors. `npx vitest run` still 198 passing.
- **Feel check**: open `/overall-map`:
  - the search-filter control in the top-left appears and disappears when you open/close the filter panel, scaling from 80% with a fade, in about a quarter second;
  - it should now feel slightly snappier than before (250ms strong ease-out vs 300ms plain `ease`);
  - in DevTools, inspect `#leaflet-search-control-container`: its `style` attribute must no longer contain `transition`, `opacity` or `transform`. All of those come from `App.css` now;
  - toggle the panel five times in a row — the control's fade must retarget mid-flight, never restart from fully hidden;
  - confirm the control cannot be reached by Tab while hidden (that is `visibility: hidden` still doing its job).
- **Done when**: `grep -n "container.style.transition" src/hooks/useOpenStreetMap.tsx` returns nothing and `grep -n "!important" src/App.css:159` no longer matches on that rule.
