import { Suspense, lazy, useEffect, useRef } from 'react';
import { COPY } from '@/data/copy';
import { useAppStore, useCalibrated, useConfidence } from '@/store/appStore';
import { Header } from '@/components/Header';
import { LoadingSplash } from '@/components/LoadingSplash';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AISparkle } from '@/components/AI';
import { CalibrationPanel } from '@/components/CalibrationPanel';
import { HowAI } from '@/components/HowAI';
import Dashboard from '@/pages/Dashboard';

// Lazy-load chart-heavy and secondary pages to keep first paint fast.
const DepartmentDetail = lazy(() => import('@/pages/DepartmentDetail'));
const WeeklyView = lazy(() => import('@/pages/WeeklyView'));
const AnnualProjection = lazy(() => import('@/pages/AnnualProjection'));
const DataSources = lazy(() => import('@/pages/DataSources'));

const RECALIB_MS = 520;
const TOAST_HOLD_MS = 2700;

function PageFallback() {
  return (
    <div className="thal-page-fallback" aria-busy="true">
      <span className="thal-src-spin" aria-hidden="true" />
      <span>Loading…</span>
    </div>
  );
}

export function App() {
  const view = useAppStore((s) => s.view);
  const splashDone = useAppStore((s) => s.splashDone);
  const finishSplash = useAppStore((s) => s.finishSplash);

  const recalibrating = useAppStore((s) => s.recalibrating);
  const setRecalibrating = useAppStore((s) => s.setRecalibrating);
  const toast = useAppStore((s) => s.toast);
  const setToast = useAppStore((s) => s.setToast);
  const bumpRecalc = useAppStore((s) => s.bumpRecalc);

  const calibrated = useCalibrated();
  const { confidence } = useConfidence();

  // Trigger recalibration animation when calibration inputs or sources change.
  const monthlySalary = useAppStore((s) => s.monthlySalary);
  const totalStaff = useAppStore((s) => s.totalStaff);
  const pms = useAppStore((s) => s.pms);
  const painDept = useAppStore((s) => s.painDept);
  const connected = useAppStore((s) => s.connected);
  const occupancy = useAppStore((s) => s.occupancy);

  const firstCalibRef = useRef(true);
  useEffect(() => {
    if (firstCalibRef.current) {
      firstCalibRef.current = false;
      return;
    }
    setRecalibrating(true);
    bumpRecalc();
    const t1 = window.setTimeout(() => setRecalibrating(false), RECALIB_MS);
    const t2 = window.setTimeout(() => setToast(true), RECALIB_MS);
    const t3 = window.setTimeout(() => setToast(false), TOAST_HOLD_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [monthlySalary, totalStaff, pms, painDept, connected, bumpRecalc, setRecalibrating, setToast]);

  useEffect(() => {
    bumpRecalc();
  }, [occupancy, bumpRecalc]);

  // Confidence is displayed via the header — value referenced here keeps the subscription alive
  // for any future page that needs it without remounting, while keeping React DevTools tidy.
  void confidence;
  void calibrated;

  return (
    <div className="thal-app">
      {!splashDone && <LoadingSplash onDone={finishSplash} />}

      <Header />

      <main className={'thal-main ' + (recalibrating ? 'is-recalibrating' : '')}>
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            {view === 'dashboard'   && <Dashboard />}
            {view === 'departments' && <DepartmentDetail />}
            {view === 'weekly'      && <WeeklyView />}
            {view === 'annual'      && <AnnualProjection />}
            {view === 'sources'     && <DataSources />}
          </Suspense>
        </ErrorBoundary>
      </main>

      {recalibrating && (
        <div className="thal-recalib-overlay" role="status" aria-live="polite">
          <AISparkle size={14} /> {COPY.calibration.recalibrating}
        </div>
      )}

      {toast && (
        <div className="thal-toast" role="status" aria-live="polite">
          <span className="thal-toast-check">✓</span> {COPY.calibration.badge}
        </div>
      )}

      <footer className="thal-foot">
        <span>{COPY.app.footer}</span>
        <span>{COPY.app.footerMeta}</span>
      </footer>

      <CalibrationPanel />
      <HowAI />
    </div>
  );
}

export default App;
