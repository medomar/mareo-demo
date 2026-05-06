import { create } from 'zustand';
import type { SourceCardId } from '@/data/copy';
import {
  DEFAULT_CALIBRATION,
  calibratedDepartments,
  isCalibrated,
} from '@/lib/calibration';
import {
  precisionPercent,
  savingsRefinementMultiplier,
  totalConfidence,
  type ConnectedSources,
} from '@/lib/confidence';
import type { Department } from '@/data/departments';

export type ViewId = 'dashboard' | 'departments' | 'weekly' | 'annual' | 'sources';

type ProcessingMap = Partial<Record<SourceCardId, number>>;

type AppState = {
  // Navigation
  view: ViewId;
  setView: (view: ViewId) => void;

  // Splash
  splashDone: boolean;
  finishSplash: () => void;

  // Drawers
  calibOpen: boolean;
  howOpen: boolean;
  setCalibOpen: (v: boolean) => void;
  setHowOpen: (v: boolean) => void;

  // Calibration
  monthlySalary: number;
  totalStaff: number;
  pms: string;
  painDept: string;
  setMonthlySalary: (v: number) => void;
  setTotalStaff: (v: number) => void;
  setPms: (v: string) => void;
  setPainDept: (v: string) => void;
  resetCalibration: () => void;

  // Scenario / occupancy
  scenarioId: string;
  occupancy: number;
  setScenario: (id: string, occupancy: number) => void;
  setOccupancy: (v: number) => void;

  // Data sources
  connected: ConnectedSources;
  processing: ProcessingMap;
  setConnected: (id: SourceCardId, value: boolean) => void;
  setProcessing: (id: SourceCardId, step: number | null) => void;
  resetSources: () => void;

  // Recalibration animation
  recalcKey: number;
  bumpRecalc: () => void;
  recalibrating: boolean;
  setRecalibrating: (v: boolean) => void;
  toast: boolean;
  setToast: (v: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  view: 'dashboard',
  setView: (view) => set({ view }),

  splashDone: false,
  finishSplash: () => set({ splashDone: true }),

  calibOpen: false,
  howOpen: false,
  setCalibOpen: (calibOpen) => set({ calibOpen }),
  setHowOpen: (howOpen) => set({ howOpen }),

  monthlySalary: DEFAULT_CALIBRATION.monthlySalary,
  totalStaff: DEFAULT_CALIBRATION.totalStaff,
  pms: DEFAULT_CALIBRATION.pms,
  painDept: DEFAULT_CALIBRATION.painDept,
  setMonthlySalary: (monthlySalary) => set({ monthlySalary }),
  setTotalStaff: (totalStaff) => set({ totalStaff }),
  setPms: (pms) => set({ pms }),
  setPainDept: (painDept) => set({ painDept }),
  resetCalibration: () =>
    set({
      monthlySalary: DEFAULT_CALIBRATION.monthlySalary,
      totalStaff: DEFAULT_CALIBRATION.totalStaff,
      pms: DEFAULT_CALIBRATION.pms,
      painDept: DEFAULT_CALIBRATION.painDept,
    }),

  scenarioId: 'shoulder-may',
  occupancy: 0.72,
  setScenario: (scenarioId, occupancy) => set({ scenarioId, occupancy }),
  setOccupancy: (occupancy) => set({ occupancy }),

  connected: {},
  processing: {},
  setConnected: (id, value) =>
    set((s) => ({ connected: { ...s.connected, [id]: value } })),
  setProcessing: (id, step) =>
    set((s) => {
      const next: ProcessingMap = { ...s.processing };
      if (step === null) delete next[id];
      else next[id] = step;
      return { processing: next };
    }),
  resetSources: () => set({ connected: {}, processing: {} }),

  recalcKey: 0,
  bumpRecalc: () => set((s) => ({ recalcKey: s.recalcKey + 1 })),
  recalibrating: false,
  setRecalibrating: (recalibrating) => set({ recalibrating }),
  toast: false,
  setToast: (toast) => set({ toast }),
}));

// Selectors / derived helpers — keep components free of derivation logic.
export type CalibrationSlice = {
  monthlySalary: number;
  totalStaff: number;
  pms: string;
  painDept: string;
};

export function useCalibration(): CalibrationSlice {
  return useAppStore((s) => ({
    monthlySalary: s.monthlySalary,
    totalStaff: s.totalStaff,
    pms: s.pms,
    painDept: s.painDept,
  }));
}

export function useDepartments(): readonly Department[] {
  const totalStaff = useAppStore((s) => s.totalStaff);
  return calibratedDepartments({ ...DEFAULT_CALIBRATION, totalStaff });
}

export function useCalibrated(): boolean {
  const calib = useCalibration();
  return isCalibrated(calib);
}

export function useConfidence(): { confidence: number; precision: number; savingsMult: number } {
  const calib = useCalibration();
  const connected = useAppStore((s) => s.connected);
  const confidence = totalConfidence({ connected, calib });
  return {
    confidence,
    precision: precisionPercent(confidence),
    savingsMult: savingsRefinementMultiplier(connected),
  };
}
