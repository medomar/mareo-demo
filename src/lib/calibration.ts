import { DEPARTMENTS, TOTAL_STAFF_AT_PEAK, type Department } from '@/data/departments';
import { DEFAULT_MONTHLY_SALARY } from './cost';
import type { CalibrationInputs } from './confidence';

/**
 * Scale every department's `staff100` so the new total matches `totalStaff`,
 * keeping each department's relative weight constant. Returns the original
 * array (referentially equal) when no scaling is needed, to keep useMemo cheap.
 */
export function scaleDepartments(
  departments: readonly Department[],
  totalStaff: number,
  baseTotal: number = TOTAL_STAFF_AT_PEAK,
): readonly Department[] {
  if (totalStaff === baseTotal) return departments;
  const ratio = totalStaff / baseTotal;
  return departments.map((d) => ({ ...d, staff100: d.staff100 * ratio }));
}

export const DEFAULT_CALIBRATION: CalibrationInputs = {
  monthlySalary: DEFAULT_MONTHLY_SALARY,
  totalStaff: TOTAL_STAFF_AT_PEAK,
  pms: '',
  painDept: '',
};

/** True when any calibration field has been changed from defaults. */
export function isCalibrated(calib: CalibrationInputs): boolean {
  return (
    calib.monthlySalary !== DEFAULT_MONTHLY_SALARY ||
    calib.totalStaff !== TOTAL_STAFF_AT_PEAK ||
    calib.pms !== '' ||
    calib.painDept !== ''
  );
}

/** Convenience: calibrated departments from a calibration record. */
export function calibratedDepartments(calib: CalibrationInputs): readonly Department[] {
  return scaleDepartments(DEPARTMENTS, calib.totalStaff);
}
