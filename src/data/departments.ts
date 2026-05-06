export type ShiftKey = 'morning' | 'afternoon' | 'night';

export type ShiftDistribution = Readonly<Record<ShiftKey, number>>;

export type Department = {
  readonly id: string;
  readonly name: string;
  /** Headcount required to operate at 100% occupancy. */
  readonly staff100: number;
  /** Fraction of staff that scales with occupancy (0..1). 0 = fully fixed, 1 = fully variable. */
  readonly variable: number;
  /** Distribution across day shifts. Should sum to ~1. */
  readonly shifts: ShiftDistribution;
};

// Total at 100% = 211 staff
export const DEPARTMENTS: readonly Department[] = [
  { id: 'housekeeping', name: 'Housekeeping',          staff100: 36, variable: 0.90, shifts: { morning: 0.75, afternoon: 0.25, night: 0.00 } },
  { id: 'fb',           name: 'Restaurant & Bars',     staff100: 36, variable: 0.75, shifts: { morning: 0.35, afternoon: 0.60, night: 0.05 } },
  { id: 'kitchen',      name: 'Kitchen',               staff100: 26, variable: 0.55, shifts: { morning: 0.45, afternoon: 0.50, night: 0.05 } },
  { id: 'spa',          name: 'Spa & Thalassotherapy', staff100: 36, variable: 0.80, shifts: { morning: 0.40, afternoon: 0.60, night: 0.00 } },
  { id: 'reception',    name: 'Front Desk',            staff100: 16, variable: 0.25, shifts: { morning: 0.35, afternoon: 0.35, night: 0.30 } },
  { id: 'pool',         name: 'Pool & Beach',          staff100: 10, variable: 0.60, shifts: { morning: 0.50, afternoon: 0.50, night: 0.00 } },
  { id: 'animation',    name: 'Entertainment',         staff100: 10, variable: 0.50, shifts: { morning: 0.15, afternoon: 0.75, night: 0.10 } },
  { id: 'maintenance',  name: 'Maintenance',           staff100: 10, variable: 0.30, shifts: { morning: 0.80, afternoon: 0.20, night: 0.00 } },
  { id: 'gardens',      name: 'Landscaping',           staff100: 10, variable: 0.40, shifts: { morning: 0.90, afternoon: 0.10, night: 0.00 } },
  { id: 'security',     name: 'Security',              staff100:  8, variable: 0.00, shifts: { morning: 0.33, afternoon: 0.33, night: 0.34 } },
  { id: 'management',   name: 'Management',            staff100: 13, variable: 0.00, shifts: { morning: 0.70, afternoon: 0.30, night: 0.00 } },
];

export const TOTAL_STAFF_AT_PEAK = DEPARTMENTS.reduce((s, d) => s + d.staff100, 0);
