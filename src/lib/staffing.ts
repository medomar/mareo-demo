import type { Department, ShiftKey } from '@/data/departments';

export type ShiftStaffing = Record<ShiftKey, number>;

export type DeptComparison = Department & {
  baseline: number;
  optimized: number;
  delta: number;
};

/** Daily staff for a department at a given occupancy (0..1). */
export function dailyStaff(dept: Department, occupancy: number): number {
  return dept.staff100 * ((1 - dept.variable) + dept.variable * occupancy);
}

/** Distribute the daily staff across the three shifts using the dept's profile. */
export function staffPerShift(dept: Department, occupancy: number): ShiftStaffing {
  const daily = dailyStaff(dept, occupancy);
  return {
    morning:   daily * dept.shifts.morning,
    afternoon: daily * dept.shifts.afternoon,
    night:     daily * dept.shifts.night,
  };
}

/** Total staff at the peak baseline (sum of staff100). */
export function baselineStaff(departments: readonly Department[]): number {
  return departments.reduce((s, d) => s + d.staff100, 0);
}

/** Total staff optimized for a given occupancy. */
export function optimizedStaff(departments: readonly Department[], occupancy: number): number {
  return departments.reduce((s, d) => s + dailyStaff(d, occupancy), 0);
}

/** Per-department comparison: baseline / optimized / delta. */
export function perDeptComparison(
  departments: readonly Department[],
  occupancy: number,
): DeptComparison[] {
  return departments.map((d) => {
    const baseline = d.staff100;
    const optimized = dailyStaff(d, occupancy);
    return { ...d, baseline, optimized, delta: baseline - optimized };
  });
}
