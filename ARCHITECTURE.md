# Architecture

A compact reference for anyone extending Mareo.

## Folder structure

```
src/
  App.tsx              Root: view router, recalibration animation, drawers
  main.tsx             ReactDOM mount + global stylesheet imports
  index.css            Tailwind directives
  styles.css           Design system (CSS variables, hand-authored)

  data/                Static, typed data (no runtime mutation)
  lib/                 Pure functions — the single source of truth for math
  store/               Zustand store + derived-state hooks
  components/          Shared UI (badges, header, drawers, splash, error boundary)
  pages/               One file per top-level view — all lazy-loaded except Dashboard
  test/setup.ts        @testing-library/jest-dom setup
```

## State management

All state lives in `src/store/appStore.ts` (Zustand). Components subscribe to slices:

```ts
const occupancy = useAppStore((s) => s.occupancy);
const setView   = useAppStore((s) => s.setView);
```

Derived state — calibrated department ratios, confidence, refinement multiplier — is produced by **selectors that call pure functions** in `src/lib/`:

- `useDepartments()` → calls `calibratedDepartments()` from `lib/calibration.ts`
- `useConfidence()` → calls `totalConfidence()`, `precisionPercent()`, `savingsRefinementMultiplier()` from `lib/confidence.ts`
- `useCalibrated()` → calls `isCalibrated()` from `lib/calibration.ts`

This split keeps components free of math and lets us unit-test the math directly.

### Recalibration animation

When a calibration field or a connected source changes, `App.tsx` runs a brief `useEffect`:
1. Sets `recalibrating: true` for ~520ms (CSS shimmer on `<main>`)
2. Bumps `recalcKey` — `<CountUp>` instances key off this to re-run their tween
3. Pops a "Model calibrated" toast for ~2.2s

## Calculation model

All math is in `src/lib/`:

```
dailyStaff(dept, occ)        = dept.staff100 * ((1 - dept.variable) + dept.variable * occ)
staffPerShift(dept, occ)     = dailyStaff × dept.shifts.{morning,afternoon,night}
baselineStaff(depts)         = Σ dept.staff100                              (peak headcount)
optimizedStaff(depts, occ)   = Σ dailyStaff(d, occ)                         (current)
dailyCost(monthlySalary)     = monthlySalary / 30
annualSavings(...)           = Σ over 12 months: (baseline - optim) × dCost × 30.4
groupAnnualSavings(...)      = annualSavings × (totalGroupRooms / baseRooms)
```

Confidence:

```
SOURCE_BOOSTS = { pms: 5, occ: 4, staffing: 2, bookings: 1 }
totalConfidence = clamp(99, 87 + sum(boosts of connected) + count(non-default calib fields))
precisionPercent(c) = round(10 - clamp01((c - 87) / 12) * 8)   // ±10% → ±2%
savingsRefinementMultiplier ∈ [1.000, 1.086]
```

## How to extend

### Add a new department

1. Append an entry to `DEPARTMENTS` in `src/data/departments.ts`. Required: `id`, `name`, `staff100`, `variable` (0–1), `shifts` (sums to ~1).
2. Add an optional tooltip in `COPY.ai.deptTooltips` keyed by `id` (`src/data/copy.ts`); fallback `_default` is used otherwise.
3. Update tests in `src/lib/staffing.test.ts` if the new dept changes `TOTAL_STAFF_AT_PEAK`. The test `'matches the canonical 211-person peak baseline'` will fail and prompt you.
4. The dashboard, departments table, weekly bars, and annual columns pick up the new dept automatically — no component changes.

### Add a new data source

1. Append an entry to `COPY.sources.cards` (`src/data/copy.ts`). Required: `id` (extend the `SourceCardId` type), `title`, `desc`, `boost`, `action` (`'modal' | 'upload' | 'upload-or-manual' | 'connect'`).
2. Add a confidence boost weight in `SOURCE_BOOSTS` (`src/lib/confidence.ts`) and a savings refinement weight in `savingsRefinementMultiplier` if needed.
3. Add `procSteps[id]` in `COPY.sources.procSteps` — 2+ strings; the first delays before processing starts, the last is the success state.
4. (Optional) Add `insights[id]` for a post-connection insights list.

The `DataSources` page picks it up automatically.

### Tweak calculation parameters

- **Department ratios / variability** — edit the per-row values in `DEPARTMENTS`. Re-run tests.
- **Loaded salary range** — change the slider's `min/max/step` in `CalibrationPanel.tsx`, and the `DEFAULT_MONTHLY_SALARY` in `lib/cost.ts`.
- **Shift profile** — adjust `shifts: { morning, afternoon, night }` per dept; should sum to ~1. The heatmap renders directly off `staffPerShift`.
- **Seasonality** — `MONTHLY_OCCUPANCY` in `data/seasonality.ts` is the 12-row source of truth for the annual chart and `annualSavings`.

### Add a new top-level view

1. Add `'newView'` to the `ViewId` union in `src/store/appStore.ts`.
2. Create `src/pages/NewView.tsx` with a default export.
3. Lazy-load and route it in `src/App.tsx`:
   ```tsx
   const NewView = lazy(() => import('@/pages/NewView'));
   // ...
   {view === 'newView' && <NewView />}
   ```
4. Add the tab to `TABS` in `src/components/Header.tsx` and to `COPY.nav`.

## Performance notes

- **Code splitting** — every page except the Dashboard is lazy-loaded; bundle is ~12 KB gzipped before any chart code lands.
- **React vendor split** — Zustand and React are in their own chunks for long-term caching.
- **Recalibration animation** — uses the GPU (`filter: brightness()`), not layout properties.
- **Slider debounce** — the occupancy slider stores local state and pushes to Zustand 80 ms after the last input event so dragging stays smooth at 60 fps.
- **Reduced motion** — global `prefers-reduced-motion` rule disables transitions/animations.

## Testing

- 50 unit tests over `src/lib/` (Vitest). Coverage: 98.7% statements / 100% branches.
- No component tests yet — the brief was to focus tests on `lib/`. Add `@testing-library/react` specs as the surface area grows.

## Known limitations / V2 follow-ups

- No real backend; sources are timer-driven mocks. A real PMS connector would replace `runMockFlow` in `pages/DataSources.tsx`.
- Charts are static SVG. If interactivity/tooltips become important, swap in Recharts (Vite alias was kept; see `vite.config.ts` `manualChunks`).
- `Suspense` fallback is a minimal spinner — Lighthouse may flag a brief blank moment when first navigating to a lazy page on slow networks.
- A11y: tabs are buttons rather than ARIA tablist items. If accessibility audits are part of the demo, upgrade `Header.tsx`'s nav to a roving tabindex.
- No analytics / consent banner — add only if the demo is shared publicly to GDPR-bound visitors.
