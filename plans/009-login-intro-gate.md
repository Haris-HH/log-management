# 009 — Play the 5.5-second login intro only once per browser

- **Status**: TODO
- **Commit**: b13b768
- **Severity**: MEDIUM
- **Category**: Purpose & frequency
- **Estimated scope**: 1 file, small
- **Audit finding**: #9

## Problem

```tsx
/* src/pages/Login.tsx:51-78 — current */
  const [introDone, setIntroDone] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);
...
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroDone(true);
    }, 5500);

    return () => clearTimeout(timer);
  }, []);

  const finishIntro = () => {
    setSkipIntro(true);
    setIntroDone(true);
  };
```

The login form is hidden behind a 5.5-second cinematic overlay (`src/pages/Login.tsx:146-161`) on **every** visit to `/login`. Clicking anywhere skips it (`onClick={finishIntro}` at `src/pages/Login.tsx:132`), but nothing on screen says so.

Logging in is a daily, purely functional task. A 5.5s gate in front of it is motion with no purpose for the 2nd through 500th viewing — and every forced logout (`useForceLogout`, SSE `force-logout`, expired refresh token) drops the user back here, so it is hit more often than "once a day".

This is a deliberate brand moment, so the fix is **not** deletion — it is to spend the delight budget where it belongs: the first time.

## Target

Remember that the intro has been seen, in `localStorage`, and skip straight to the fast path afterwards. `skipIntro` already exists and already shortens every stage of `CinematicTitle` (`src/components/cinematic-title/CinematicTitle.tsx:56, 76, 87, 93, 98`), so the mechanism is in place — it just needs a persisted trigger.

```tsx
/* target — src/pages/Login.tsx */
/*
  คนที่เคยเห็น intro แล้วไม่ควรต้องรอ 5.5 วินาทีทุกครั้งที่ login ใหม่ (รวมถึง
  ตอนที่ถูก force-logout กลับมา) จำไว้ใน localStorage แล้วครั้งต่อไปข้ามไปที่
  ฟอร์มทันที — เก็บโมเมนต์ cinematic ไว้ให้ครั้งแรกครั้งเดียว
*/
const INTRO_SEEN_KEY = "wd2-login-intro-seen";

/* ...inside the component, replacing the two useState calls at :51-52 */
  const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY) === "true";

  const [introDone, setIntroDone] = useState(hasSeenIntro);
  const [skipIntro, setSkipIntro] = useState(hasSeenIntro);

/* ...replacing the useEffect at :68-74 */
  useEffect(() => {
    localStorage.setItem(INTRO_SEEN_KEY, "true");

    if (hasSeenIntro) return;

    const timer = setTimeout(() => {
      setIntroDone(true);
    }, 5500);

    return () => clearTimeout(timer);
  }, [hasSeenIntro]);
```

Exact behaviour:
- First ever visit: `hasSeenIntro` is `false`, the full 5.5s intro plays exactly as today, and the flag is written immediately on mount (not after the intro finishes) so a user who reloads mid-intro is not made to sit through it again.
- Every later visit: `introDone` and `skipIntro` both start `true`, so the overlay never mounts and the login card is visible immediately. `AnimatePresence` at `src/pages/Login.tsx:146` simply renders nothing.
- The existing click-to-skip stays untouched as the escape hatch for the first run.
- Key name follows the repo's existing `wd2-` prefix convention (`wd2-theme` in `src/hooks/useTheme.tsx`, `wd2-nav-position` / `wd2-nav-sidebar-open` in `src/hooks/useNavPosition.tsx`).

## Repo conventions to follow

- `localStorage` keys in this repo use the `wd2-` prefix for UI preferences — exemplar: `const POSITION_KEY = "wd2-nav-position";` at `src/hooks/useNavPosition.tsx:40`.
- Module-level `const` for the key, above the component — same shape as `src/hooks/useNavPosition.tsx:40-41`.
- Reading `localStorage` during a `useState` initialiser is the established pattern here (`src/hooks/useNavPosition.tsx:72-80`). Reading it once into `hasSeenIntro` before both `useState` calls keeps the two flags consistent.
- Thai comments for non-obvious product decisions match the house style.

## Steps

1. Open `src/pages/Login.tsx`.
2. Add the `INTRO_SEEN_KEY` const with its comment above the component definition.
3. Add `const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY) === "true";` immediately before the `introDone` state, and seed both `useState` calls from it (lines 51-52).
4. Replace the intro `useEffect` (lines 68-74) with the version in **Target**, including the dep array change.
5. Leave `finishIntro` (lines 76-79), `onClick={finishIntro}` and everything inside the overlay alone.

## Boundaries

- Do NOT delete the intro, the overlay, `CinematicTitle`, `MatrixRainingCode` or `LetterChargeEffect`.
- Do NOT change the 5.5s value — it is still the first-run duration.
- Do NOT change any timing inside `src/components/cinematic-title/CinematicTitle.tsx` (that is plan 008) or the `skipIntro ? … : …` branches it already contains.
- Do NOT put this flag in Redux or `persist:root`. Note that `clearAuthStorage()` / `useForceLogout` deliberately clear `persist:root` and the token keys on logout; this key must survive logout, which is exactly why it is a plain `localStorage` entry with its own name. Do NOT add it to any clearing routine.
- Do NOT add a "skip intro" button — out of scope.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` exits 0. `npx eslint src/pages/Login.tsx` — the pre-existing `react-hooks/set-state-in-effect` error in this file's sibling `src/layout/Navbar.tsx` is unrelated; this file should report no new errors. `npx vitest run` still 198 passing.
- **Feel check**:
  - clear the key (`localStorage.removeItem("wd2-login-intro-seen")` in the console) and reload `/login`: the full intro plays, unchanged;
  - reload again without clearing: the login form is **there immediately** — no overlay, no flash of the cinematic title, no 5.5s wait;
  - log in, then log out (or trigger a forced logout): you land on `/login` with the form immediately available;
  - clear the key, reload, and click during the intro: it still skips instantly, and reloading after that does not replay it;
  - confirm `localStorage.getItem("wd2-login-intro-seen")` is `"true"` after the first mount, even if you reload one second into the intro.
- **Done when**: a second visit to `/login` shows the login card with zero intro delay, and the first visit is byte-for-byte the old experience.
