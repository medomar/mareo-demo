import type { SourceCardId } from '@/data/copy';
import { DEFAULT_MONTHLY_SALARY } from './cost';
import { TOTAL_STAFF_AT_PEAK } from '@/data/departments';

export type ConnectedSources = Partial<Record<SourceCardId, boolean>>;

export type CalibrationInputs = {
  monthlySalary: number;
  totalStaff: number;
  pms: string;
  painDept: string;
};

export const SOURCE_BOOSTS: Readonly<Record<SourceCardId, number>> = {
  pms: 5,
  occ: 4,
  staffing: 2,
  bookings: 1,
};

export const CONFIDENCE_BASE = 87;
export const CONFIDENCE_MAX = 99;

export function sourceConfidenceBoost(connected: ConnectedSources): number {
  return (Object.entries(connected) as [SourceCardId, boolean | undefined][]).reduce(
    (s, [k, v]) => s + (v ? SOURCE_BOOSTS[k] : 0),
    0,
  );
}

export function calibConfidenceBoost({
  monthlySalary,
  totalStaff,
  pms,
  painDept,
}: CalibrationInputs): number {
  let n = 0;
  if (monthlySalary !== DEFAULT_MONTHLY_SALARY) n++;
  if (totalStaff !== TOTAL_STAFF_AT_PEAK) n++;
  if (pms) n++;
  if (painDept) n++;
  return n;
}

export function totalConfidence({
  connected,
  calib,
}: {
  connected: ConnectedSources;
  calib: CalibrationInputs;
}): number {
  return Math.min(
    CONFIDENCE_MAX,
    CONFIDENCE_BASE + sourceConfidenceBoost(connected) + calibConfidenceBoost(calib),
  );
}

/** Precision band narrows as confidence rises: ±10% at 87 → ±2% at 99. */
export function precisionPercent(conf: number): number {
  const k = Math.min(1, Math.max(0, (conf - CONFIDENCE_BASE) / (CONFIDENCE_MAX - CONFIDENCE_BASE)));
  return Math.round(10 - k * 8);
}

/** Each connected source nudges the modeled savings up by 1.5–4%. */
export function savingsRefinementMultiplier(connected: ConnectedSources): number {
  const lift =
    (connected.pms ? 0.038 : 0) +
    (connected.occ ? 0.025 : 0) +
    (connected.staffing ? 0.015 : 0) +
    (connected.bookings ? 0.008 : 0);
  return 1 + lift;
}
