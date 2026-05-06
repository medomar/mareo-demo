import { describe, expect, it } from 'vitest';
import { DEPARTMENTS, TOTAL_STAFF_AT_PEAK } from '@/data/departments';
import { DEFAULT_CALIBRATION, isCalibrated, scaleDepartments } from './calibration';
import { DEFAULT_MONTHLY_SALARY } from './cost';
import { baselineStaff } from './staffing';

describe('scaleDepartments', () => {
  it('returns the original array when totals match (referentially equal)', () => {
    const out = scaleDepartments(DEPARTMENTS, TOTAL_STAFF_AT_PEAK);
    expect(out).toBe(DEPARTMENTS);
  });

  it('scales each department proportionally to match the new total', () => {
    const target = TOTAL_STAFF_AT_PEAK * 1.5;
    const scaled = scaleDepartments(DEPARTMENTS, target);
    expect(baselineStaff(scaled)).toBeCloseTo(target, 4);
  });

  it('preserves relative shape — ratios between departments are unchanged', () => {
    const scaled = scaleDepartments(DEPARTMENTS, TOTAL_STAFF_AT_PEAK * 0.8);
    expect(scaled.length).toBe(DEPARTMENTS.length);
    for (let i = 1; i < DEPARTMENTS.length; i++) {
      const original = DEPARTMENTS[i]!.staff100 / DEPARTMENTS[0]!.staff100;
      const after = scaled[i]!.staff100 / scaled[0]!.staff100;
      expect(after).toBeCloseTo(original, 6);
    }
  });
});

describe('isCalibrated', () => {
  it('returns false for the default calibration', () => {
    expect(isCalibrated(DEFAULT_CALIBRATION)).toBe(false);
  });

  it('returns true if any field has been changed', () => {
    expect(isCalibrated({ ...DEFAULT_CALIBRATION, monthlySalary: DEFAULT_MONTHLY_SALARY + 1 })).toBe(true);
    expect(isCalibrated({ ...DEFAULT_CALIBRATION, totalStaff: TOTAL_STAFF_AT_PEAK + 1 })).toBe(true);
    expect(isCalibrated({ ...DEFAULT_CALIBRATION, pms: 'Opera' })).toBe(true);
    expect(isCalibrated({ ...DEFAULT_CALIBRATION, painDept: 'fb' })).toBe(true);
  });
});
