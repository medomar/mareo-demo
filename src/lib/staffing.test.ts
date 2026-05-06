import { describe, expect, it } from 'vitest';
import { DEPARTMENTS, type Department } from '@/data/departments';
import {
  baselineStaff,
  dailyStaff,
  optimizedStaff,
  perDeptComparison,
  staffPerShift,
} from './staffing';

const allFixed: Department = {
  id: 'fixed',
  name: 'Fixed',
  staff100: 10,
  variable: 0,
  shifts: { morning: 0.5, afternoon: 0.5, night: 0 },
};

const allVariable: Department = {
  id: 'var',
  name: 'Variable',
  staff100: 10,
  variable: 1,
  shifts: { morning: 0.5, afternoon: 0.5, night: 0 },
};

const halfVariable: Department = {
  id: 'half',
  name: 'Half',
  staff100: 100,
  variable: 0.5,
  shifts: { morning: 1, afternoon: 0, night: 0 },
};

describe('dailyStaff', () => {
  it('returns staff100 when occupancy is 100%', () => {
    expect(dailyStaff(halfVariable, 1)).toBeCloseTo(100, 6);
  });

  it('keeps fixed staff constant regardless of occupancy', () => {
    expect(dailyStaff(allFixed, 0)).toBe(10);
    expect(dailyStaff(allFixed, 0.5)).toBe(10);
    expect(dailyStaff(allFixed, 1)).toBe(10);
  });

  it('scales linearly when fully variable', () => {
    expect(dailyStaff(allVariable, 0)).toBe(0);
    expect(dailyStaff(allVariable, 0.5)).toBeCloseTo(5, 6);
    expect(dailyStaff(allVariable, 1)).toBe(10);
  });

  it('blends fixed + variable correctly at 50% occupancy', () => {
    // (1 - 0.5) + 0.5*0.5 = 0.5 + 0.25 = 0.75 of staff100
    expect(dailyStaff(halfVariable, 0.5)).toBeCloseTo(75, 6);
  });
});

describe('staffPerShift', () => {
  it('distributes daily staff according to shift percentages', () => {
    const shifts = staffPerShift(halfVariable, 1);
    expect(shifts.morning).toBeCloseTo(100, 6);
    expect(shifts.afternoon).toBe(0);
    expect(shifts.night).toBe(0);
  });

  it('preserves the daily total across shifts', () => {
    const dept: Department = {
      id: 'd',
      name: 'D',
      staff100: 30,
      variable: 0.6,
      shifts: { morning: 0.4, afternoon: 0.4, night: 0.2 },
    };
    const occ = 0.7;
    const shifts = staffPerShift(dept, occ);
    const sum = shifts.morning + shifts.afternoon + shifts.night;
    expect(sum).toBeCloseTo(dailyStaff(dept, occ), 6);
  });
});

describe('baselineStaff', () => {
  it('matches the canonical 211-person peak baseline for the demo dataset', () => {
    expect(baselineStaff(DEPARTMENTS)).toBe(211);
  });

  it('returns 0 for an empty list', () => {
    expect(baselineStaff([])).toBe(0);
  });
});

describe('optimizedStaff', () => {
  it('equals baseline at 100% occupancy', () => {
    expect(optimizedStaff(DEPARTMENTS, 1)).toBeCloseTo(baselineStaff(DEPARTMENTS), 6);
  });

  it('is strictly less than baseline at lower occupancy when any dept has variable > 0', () => {
    const baseline = baselineStaff(DEPARTMENTS);
    expect(optimizedStaff(DEPARTMENTS, 0.5)).toBeLessThan(baseline);
    expect(optimizedStaff(DEPARTMENTS, 0)).toBeLessThan(baseline);
  });

  it('preserves fixed staff at 0% occupancy', () => {
    // sum of staff100 for departments where variable === 0
    const fixedTotal = DEPARTMENTS.filter((d) => d.variable === 0).reduce(
      (s, d) => s + d.staff100,
      0,
    );
    expect(optimizedStaff(DEPARTMENTS, 0)).toBeGreaterThanOrEqual(fixedTotal);
  });
});

describe('perDeptComparison', () => {
  it('reports zero delta at 100% occupancy', () => {
    const rows = perDeptComparison(DEPARTMENTS, 1);
    rows.forEach((r) => expect(r.delta).toBeCloseTo(0, 6));
  });

  it('reports a positive delta at lower occupancy for variable departments', () => {
    const rows = perDeptComparison(DEPARTMENTS, 0.5);
    const variableRows = rows.filter((r) => r.variable > 0);
    variableRows.forEach((r) => expect(r.delta).toBeGreaterThan(0));
  });

  it('preserves the original department fields', () => {
    const rows = perDeptComparison(DEPARTMENTS, 0.7);
    rows.forEach((r, i) => {
      const dept = DEPARTMENTS[i];
      expect(dept).toBeDefined();
      expect(r.id).toBe(dept!.id);
      expect(r.name).toBe(dept!.name);
      expect(r.staff100).toBe(dept!.staff100);
    });
  });
});
