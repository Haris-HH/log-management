# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Thai-language LPR (license plate recognition) **log-management** web front-end for NSB / police. It renders access logs, usage logs, plate-search logs, per-agency/per-person statistics, checkpoint overviews and maps, all exportable to Excel and PDF. Backend is a separate service reached through `VITE_API_BASE_URL`.

`README.md` is the untouched Vite template — it contains no project information.

## Commands

```bash
npm run dev            # Vite dev server
npm run build          # tsc -b && vite build
npm run lint           # eslint .
npm run preview        # serve dist/
npm test               # vitest
npm run test:watch     # vitest --watch
npm run test:coverage  # vitest --coverage
```

Run a single test: `npx vitest run src/path/File.test.tsx` or `npx vitest -t "test name"`.

Tests run on happy-dom against `src/test/setup.ts`, which mocks `react-i18next` so `t("a.b")` returns `"a.b"` — assert on keys, not translated strings. `t` and `i18n` are module-level singletons there because hooks memoise on `[t, i18n.language]`; returning fresh objects per render would silently break those memos under test only.

Coverage uses v8 with per-directory thresholds (`src/api`, `src/utils`, `src/hooks`) rather than one global number, because the page/pdf layer is still untested and a project-wide floor would be meaningless. Raise a threshold when you add coverage to that area.

`knip` is installed as a devDependency with no script and no config file.

## Environment

`.env` (checked in) holds:

- `VITE_API_BASE_URL` — API root, e.g. `https://nsb-api.corelpr.com/api/v0`
- `VITE_API_SERVICE_CHANNEL` — sent as the `x-service-channel` header and used to filter SSE events

`VITE_IS_DEV` is read by every `features/*/api/*Api.tsx` module: when truthy the API function returns the corresponding fixture from `src/mocks/` instead of calling the network. It is **not** in `.env`, so mocks are off by default — set it to work offline.

## Architecture

React 19 + TypeScript + Vite 8. MUI v9 for components, Tailwind v4 (via `@tailwindcss/vite`) for layout utilities, Redux Toolkit + redux-persist for the small amount of global state, react-router v7, i18next for th/en, Leaflet for maps, Recharts for charts, pdfmake + exceljs for exports.

### Request layer — `src/api/fetchClient.ts`

Every network call goes through `fetchClient<T>(endpoint, options)`. It is the only place that knows about auth:

- Reads `accessToken` from `localStorage`, sends `Authorization: Bearer`, `x-service-channel`, and `x-latitude`/`x-longitude` from `navigator.geolocation` (5s timeout, failures are non-fatal). The position is cached for `LOCATION_TTL_MS` (30s) and concurrent callers share one acquisition — do not reintroduce a per-request fix. Call `clearLocationCache()` on logout.
- On 401/403 it runs a single-flight refresh against `/user-management/users/refresh` (concurrent callers queue in `failedQueue`) and retries once. A second failure dispatches a `window` `"force-logout"` event.
- Options: `skipAuth`, `isFormData`, `isStream`, `queryParams`, `retryCount`.

### Auth flow

`Login.tsx` → `loginApi` → tokens into `localStorage` (`accessToken`, `refreshToken`, `userUid`) + user into the `authUser` slice (the only persisted slice, key `persist:root`). Three independent paths trigger logout, all funnelling into `useForceLogout`:

1. `fetchClient` dispatching the `"force-logout"` window event (listened to in `App.tsx`)
2. `App.tsx` route guard — no token and not on `/login`
3. Server-pushed SSE `force-logout` event via `useSse`

`useSse` (`src/utils/useSse.tsx`) uses `@microsoft/fetch-event-source` against `${VITE_API_BASE_URL}/events`, sending the bearer token and `x-service-channel`. It ignores messages naming a `serviceChannel` other than `VITE_API_SERVICE_CHANNEL`, but **acts on one that names no channel at all** — the stream is already user-scoped, so dropping an untagged event would leave the tab running against a session the server has discarded. `onerror` returns a capped backoff delay (2s → 30s, reset on open) instead of throwing, so a proxy timeout doesn't end force-logout coverage for the session; only a 404 (`FatalSseError`, route not deployed) stops it for good. The access token is re-read from `localStorage` before each retry, since `fetchClient` may have refreshed it. Pass `{ closeOnEvent: true }` for one-shot streams like `force-logout`.

The SSE logout records `setLogoutReason("signed-in-elsewhere")` (`src/utils/logoutReason.ts` — module scope, cleared on read) so `Login.tsx` can explain the eviction instead of leaving it looking like an ordinary session timeout, and calls `forceLogout(false)`: the server has already discarded the session, so the logout API call would only fail.

### Permissions

`getUserApi` returns `permissions.ui[<service>]` per console; this app reads only its own entry, `ui["log-management"]` (`LOG_MANAGEMENT_UI_KEY`). Shape: `{ enabled, groups: {page: "none" | "active" | "edit"}, prints: {page: boolean} }`.

- **none** — no menu entry, and the route redirects to `/`.
- **active** — page renders read-only; every create/edit control is hidden.
- **edit** — everything.
- `prints[page]` is a separate axis (a read-only page can still export), bounded by `canView`.
- A key the server never sent resolves to `"none"` — new pages stay hidden until the backend grants them.

The tree is stored on the `authUser` slice as `user.permission`, set at login and **refreshed on every app load** in `App.tsx` so a revoked grant does not wait for the next login. `undefined` means "not known yet" and is distinct from `null` ("none"): gates hold rather than deny while it is undefined, or a reload would bounce the user off the page they were reading.

Three enforcement points, all driven by `PAGE_PERMISSIONS` in `src/constants/permissions.ts` (route path → group key) so menu and router cannot drift:

1. `PermissionRoute` wraps every gated route in `App.tsx`.
2. `useDockItems` filters entries and drops groups it empties — this covers the dock, sidebar, top menu and Home cards at once.
3. `GroupExportButton` checks `canPrint` itself, so pages only pass it a `groupKey`. `OverallReport` has its own download menu and repeats the check inline.

`/` (Home) is deliberately ungated — it is the redirect target for a blocked route. `/chart-external-police` has no key of its own and rides on `chart-internal-police`.

Read grants with `usePermission(groupKey)`; for many keys at once use the pure `resolvePermission(permission, groupKey)`.

### State

`src/store/store.ts` combines only two reducers: `dropdown` and `authUser`. Everything else is component-local `useState`. The `dropdown` slice caches the shared reference lists (area, agency/ou, bh, bk, org, province, deviceStatus, title, lprRegion, …) — `App.tsx` dispatches the `fetchX` thunks once after a user appears, and pages read them via `useSelector((s: RootState) => s.dropdown)`.

Use `useAppDispatch` from `src/store/hooks.ts` (typed); plain `useSelector` is used everywhere for reads.

### Feature API modules

`src/features/<domain>/api/<Name>Api.tsx` — thin, stateless wrappers around `fetchClient`, each with the `if (isDev) return mockX;` shortcut. Only `dropdown` and `auth-user` additionally have a `*Slice.tsx`; the other domains are called directly from pages.

### Page pattern

`src/pages/*.tsx` are large (1000–1400 lines) self-contained screens. The statistic pages all follow the same shape and are the template to copy when adding a new one:

1. `FormData` interface + `useState`, optionally seeded from `location.state.filters` when navigated from another page (`location.state.fromNavigate`).
2. `usePageTitle(t("pages.…"))`.
3. **Cascading dropdowns**: agency (`ou_code`) → bh (`bh_code`) → bk → org. Each level's options are `useMemo`-filtered by the parent's selected code via `buildOptions(list, allLabel, langKey, valueKey)`, where `langKey` switches on `i18n.language`. `"0"` is the sentinel for "all".
4. A single `useEffect` listing every filter field + `page` + `rowsPerPage` + `searchTrigger` re-runs `fetchData`. `searchTrigger` is an incrementing counter used to force a refetch on explicit Search clicks.
5. Row enrichment: the log endpoint returns codes only, so pages build `Map`s from the dropdown slice and join names client-side (`mapAccessLogRows` and friends), often with an extra `getUserApi` lookup batched via `filter: user_id=a|b|c`.
6. `PaginationComponent` + `ROWS_PER_PAGE_OPTIONS` from `src/constants/dropdown.tsx`.

### Export pipeline

Both Excel and PDF exports refetch **all** rows in `REQUEST_LIMIT`-sized pages rather than reusing the table data, and chunk output at `CHUNK_SIZE = 1000` rows per file. Over one chunk, the per-chunk blobs are bundled with JSZip into a single `.zip`. Progress is driven by `useExportProgress` → `ExportLoadingScreen`.

- Excel: `generateExcelBlob` / `exportExcel` in `src/utils/exportData.tsx` (`headers` + `mapRow` + optional `columnStyles`).
- PDF: one file per page in `src/pdf/<Page>Pdf.tsx`, each exporting `generate<Name>PdfBlob(data, t, i18n)` and `download<Name>Pdf(...)`.

Both heavy libraries are **dynamically imported** — `exceljs` (~1.1 MB) inside `exportData.tsx` and `pdfmake` (~2.8 MB) inside `getConfiguredPdfMake()` — which keeps roughly half the JS out of the initial bundle. Keep them out of module-level imports. `getConfiguredPdfMake()` resolves a configured `pdfMake` instance (memoised, failures not cached); use its return value rather than importing pdfmake directly:

```ts
const pdfMake = await getConfiguredPdfMake();
const pdfDocGenerator = pdfMake.createPdf(docDefinition);
```

Fonts are not bundled either — Sarabun TTFs are fetched from `/public/fonts` at runtime into `pdfMake.vfs`.

### Theming — two overlapping systems

1. `src/hooks/useTheme.tsx` — the real one. `ThemeProvider` wraps the app in `main.tsx`, ~18 named palettes built by `buildTheme(name, bg, primary, secondary, tertiary, isDark)`, persisted under `localStorage["wd2-theme"]`, applied by writing CSS custom properties onto `document.documentElement` plus a `data-theme` attribute.
2. `src/constants/themes.tsx` — a legacy 5-entry `THEMES` list read from `localStorage["theme"]` in `App.tsx`, which also writes `--theme-accent` / `--primary-color-rgb`.

Components style against the CSS variables (`var(--primary-color)`, `rgba(var(--primary-color-rgb), .5)`, `var(--tertiary-color-rgb)`, chart status colors), declared in `src/index.css`. Prefer these over Tailwind color classes so theme switching keeps working.

### i18n and Thai dates

`fallbackLng: 'th'`, namespace `trans`, loaded over XHR from `public/locales/{th,en}/trans.json` — translations are static assets, not bundled, so new keys go in both JSON files. Language is persisted in `localStorage["language"]` as `{"code": "th"}`.

Thai UI shows Buddhist-era years: `dayjs` + the `buddhistEra` plugin with `BBBB` in format strings, and `src/utils/buddhistEraAdapter.tsx` (an `AdapterDayjs` subclass) for MUI date pickers via the `DatePickerBuddhist` component.

## Conventions

- No path aliases — all imports are relative (`../../../types/response`).
- Imports are grouped with `// Material UI`, `// Components`, `// Types`, `// i18n`, `// Utils`, `// Hooks`, `// Store`, `// API` comment banners. Match this in new files.
- Components live in `src/components/<kebab-case-dir>/PascalCase.tsx`, default-exported.
- `verbatimModuleSyntax` is on: type imports must be `import type { … }`.
- `noUnusedLocals` / `noUnusedParameters` are on, so `npm run build` fails on dead locals even when the dev server is happy. `strict` is **off**.
- SVGs are imported as components with the svgr query: `import Icon from "../assets/svg/x.svg?react"`.
- `__APP_VERSION__` is a Vite `define` fed from `package.json` version.
- API response shapes live in `src/types/response.ts`, row/entity shapes in `src/types/common.ts`.

- **Leaflet popups are an XSS sink.** `divIcon`, `bindPopup` and `bindTooltip` assign their content via `innerHTML`, and `useMarkerManager.tsx` builds that HTML with template literals. Every server-supplied value interpolated there must go through `escapeHtml()` from `src/utils/commonFunctions.tsx`. `src/hooks/useMarkerManager.test.tsx` covers this; extend it when you add a field.

## Gotchas

- Backend field names are inconsistent (`ou`/`agency`, `bh`/`bk`/`org` codes vs ids, `latitude`/`longitude` vs `lat`/`lng` — the latter was recently normalized to `latitude`/`longitude`). Check `src/types/` before assuming.
- Access tokens live in `localStorage`, so any XSS is a full session compromise — this is why the popup-escaping rule above is not optional.
- Forced logout must clear `persist:root` alongside the token keys, or the previous user's name/agency stays visible in the navbar and watermark. `clearAuthStorage()` and `useForceLogout` both do this; keep them in step.
