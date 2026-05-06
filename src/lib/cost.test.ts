import { describe, expect, it } from 'vitest';
import { DEPARTMENTS } from '@/data/departments';
import { HOTEL } from '@/data/hotel';
import { MONTHLY_OCCUPANCY } from '@/data/seasonality';
import {
  DEFAULT_MONTHLY_SALARY,
  annualSavings,
  dailyCost,
  dailySavings,
  groupAnnualSavings,
} from './cost';

describe('dailyCost', () => {
  it('returns monthlySalary / 30', () => {
    expect(dailyCost(900)).toBe(30);
    expect(dailyCost(600)).toBe(20);
  });

  it('uses the default loaded salary when none is provided', () => {
    expect(dailyCost()).toBeCloseTo(DEFAULT_MONTHLY_SALARY / 30, 6);
  });
});

describe('dailySavings', () => {
  it('multiplies the staff differential by the daily cost', () => {
    expect(dailySavings(0, 600)).toBe(0);
    expect(dailySavings(10, 600)).toBeCloseTo(200, 6);
  });
});

describe('annualSavings', () => {
  it('returns 0 at 100% occupancy across the year', () => {
    const fullYear = MONTHLY_OCCUPANCY.map((m) => ({ ...m, occ: 1 }));
    const v = annualSavings({
      departments: DEPARTMENTS,
      monthly: fullYear,
      monthlySalary: DEFAULT_MONTHLY_SALARY,
    });
    expect(v).toBeCloseTo(0, 4);
  });

  it('is strictly positive at the demo seasonality (mostly < 100%)', () => {
    const v = annualSavings({
      departments: DEPARTMENTS,
      monthly: MONTHLY_OCCUPANCY,
      monthlySalary: DEFAULT_MONTHLY_SALARY,
    });
    expect(v).toBeGreaterThan(0);
  });

  it('scales linearly with the monthly salary', () => {
    const a = annualSavings({
      departments: DEPARTMENTS,
      monthly: MONTHLY_OCCUPANCY,
      monthlySalary: 500,
    });
    const b = annualSavings({
      departments: DEPARTMENTS,
      monthly: MONTHLY_OCCUPANCY,
      monthlySalary: 1000,
    });
    expect(b).toBeCloseTo(a * 2, 4);
  });

  it('returns the maximum savings at 0% occupancy across the year', () => {
    const empty = MONTHLY_OCCUPANCY.map((m) => ({ ...m, occ: 0 }));
    const zero = annualSavings({
      departments: DEPARTMENTS,
      monthly: empty,
      monthlySalary: DEFAULT_MONTHLY_SALARY,
    });
    const normal = annualSavings({
      departments: DEPARTMENTS,
      monthly: MONTHLY_OCCUPANCY,
      monthlySalary: DEFAULT_MONTHLY_SALARY,
    });
    expect(zero).toBeGreaterThan(normal);
  });
});

describe('groupAnnualSavings', () => {
  it('equals annualSavings × (totalRooms / baseRooms)', () => {
    const single = annualSavings({
      departments: DEPARTMENTS,
      monthly: MONTHLY_OCCUPANCY,
      monthlySalary: DEFAULT_MONTHLY_SALARY,
    });
    const totalRooms = HOTEL.group.properties.reduce((s, p) => s + p.rooms, 0);
    const expected = single * (totalRooms / HOTEL.rooms);
    const actual = groupAnnualSavings({
      departments: DEPARTMENTS,
      monthly: MONTHLY_OCCUPANCY,
      monthlySalary: DEFAULT_MONTHLY_SALARY,
      group: HOTEL.group,
      baseRooms: HOTEL.rooms,
    });
    expect(actual).toBeCloseTo(expected, 4);
  });

  it('returns single-property savings when the group has only that property', () => {
    const single = annualSavings({
      departments: DEPARTMENTS,
      monthly: MONTHLY_OCCUPANCY,
      monthlySalary: DEFAULT_MONTHLY_SALARY,
    });
    const grouped = groupAnnualSavings({
      departments: DEPARTMENTS,
      monthly: MONTHLY_OCCUPANCY,
      monthlySalary: DEFAULT_MONTHLY_SALARY,
      group: { name: 'Solo', properties: [{ name: 'Royal', rooms: HOTEL.rooms }] },
      baseRooms: HOTEL.rooms,
    });
    expect(grouped).toBeCloseTo(single, 4);
  });
});
