# Mareo — AI Workforce Intelligence for Hospitality

Production demo for **Royal Thalassa Monastir** (5★, 260 rooms, Thalassa Hotels Tunisia group). Mareo estimates department-level staffing from public hotel characteristics, then refines as the operator connects real data sources — no historical data required to start.

The demo is **client-side only** (JSON-mocked), bundles to ~70 KB gzipped excluding the React runtime, and ships as a static SPA on GitHub Pages.

> **Demo URL** — set after the first successful deploy. Typical pattern: `https://<github-username>.github.io/mareo-demo/`.

---

## Tech stack

- **Vite 6** + **React 18** + **TypeScript** (strict, `noUncheckedIndexedAccess`)
- **Tailwind CSS** alongside the project's hand-tuned design system in `src/styles.css`
- **Zustand** for app state (calibration, sources, scenario, recalibration animation)
- **Vitest** + **@testing-library/jest-dom** for unit tests against the pure functions in `src/lib/`
- **GitHub Actions** → **GitHub Pages** for deployment

Charts are lean custom SVG (heatmap, weekly stacked bars, annual columns); we removed Recharts during port — the bespoke charts are <2 KB each and pixel-match the designer's intent.

---

## Setup

```bash
npm install
npm run dev          # dev server (default http://localhost:5173)
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then production build |
| `npm run preview` | Serve the production build locally at the GitHub Pages base path |
| `npm test` | Vitest run (50 unit tests over `src/lib/`) |
| `npm run test:coverage` | Vitest with v8 coverage on `src/lib/` |
| `npm run typecheck` | `tsc --noEmit` only |
| `npm run lint` | ESLint, fails on any warning |

## Deploying to GitHub Pages

The repo ships with `.github/workflows/deploy.yml`. On every push to `main` it lints, type-checks, tests, builds, and deploys `dist/` to GitHub Pages via `actions/deploy-pages@v4`.

One-time GitHub setup:

1. **Create the repo** (e.g. `mareo-demo`).
2. Repo → **Settings → Pages** → **Build and deployment → Source: GitHub Actions**.
3. If the repo is **not** named `mareo-demo`, add a repo variable `VITE_BASE` set to `/<repo-name>/` (e.g. `/thalassa-workforce-poc/`). Custom domain? Set `VITE_BASE=/`.
4. Push to `main` — first run takes ~90s.

The workflow also writes a `404.html` mirror of `index.html` so a hard refresh on any client-side path still renders.

### Local preview against the Pages base path

```bash
npm run build
npm run preview
# → http://localhost:4173/mareo-demo/
```

---

## Key file locations

```
src/
  App.tsx              Root layout, view router, recalibration effects
  main.tsx             ReactDOM entry
  styles.css           Mediterranean design system (CSS variables)
  index.css            Tailwind directives only

  data/
    hotel.ts           HOTEL constant + group properties
    departments.ts     11 departments × ratios × shift profiles (TOTAL_STAFF_AT_PEAK = 211)
    scenarios.ts       4 quick scenarios + Season type
    seasonality.ts     SEASONALITY map + 12-month occupancy curve
    copy.ts            All UI strings (typed `as const`)

  lib/
    staffing.ts        dailyStaff, staffPerShift, baseline/optimized/comparison
    cost.ts            dailyCost, dailySavings, annualSavings, groupAnnualSavings
    confidence.ts      Confidence model: 87 → 99 with sources & calibration
    calibration.ts     scaleDepartments, isCalibrated, DEFAULT_CALIBRATION
    format.ts          Intl helpers (en-US, EUR)
    *.test.ts          Vitest specs (50 tests, 98.7% coverage)

  store/
    appStore.ts        Zustand store + selector hooks (useDepartments, useConfidence)

  components/          Shared UI (Header, AI badges, KpiCard, Wave, etc.)
  pages/               Lazy-loaded route screens (Dashboard, DepartmentDetail, ...)
```

## Demo features

- **5 tabs**: Dashboard · Departments · Week · Year · Data Sources
- **Calibration drawer** (4 inputs): total staff, loaded salary, PMS, painful department — values propagate live, "Model calibrated" badge appears, recalibration shimmer + toast
- **"How did the AI estimate this?"** methodology drawer
- **Estimation Confidence** circular gauge: 87% → 99% as sources connect
- **4 quick scenarios** + manual occupancy slider (debounced)
- **Data Sources** page: 4 mockable connections (PMS · Historical occupancy · Past staffing · Booking calendar) with progressive confidence boost and AI insights panels

## Customizing for V2

See `ARCHITECTURE.md` for how to add a new department, data source, or tweak the calculation parameters.
