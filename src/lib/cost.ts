import type { Department } from '@/data/departments';
import type { HotelGroup } from '@/data/hotel';
import type { MonthlyOccupancy } from '@/data/seasonality';
import { baselineStaff, optimizedStaff } from './staffing';

/** Default loaded monthly salary in EUR for the Tunisia 5-star segment. */
export const DEFAULT_MONTHLY_SALARY = 650;

/** Cost per person per day given a monthly loaded salary. */
export function dailyCost(monthlySalary: number = DEFAULT_MONTHLY_SALARY): number {
  return monthlySalary / 30;
}

/** Daily savings (€) from a staff differential. */
export function dailySavings(staffDelta: number, monthlySalary?: number): number {
  return staffDelta * dailyCost(monthlySalary);
}

export type AnnualSavingsArgs = {
  departments: readonly Department[];
  monthly: readonly MonthlyOccupancy[];
  monthlySalary: number;
};

/** Annual savings (€), averaging the differential across the year. */
export function annualSavings({ departments, monthly, monthlySalary }: AnnualSavingsArgs): number {
  const baseline = baselineStaff(departments);
  const dCost = dailyCost(monthlySalary);
  const daysPerMonth = 365 / 12;
  return monthly.reduce((sum, m) => {
    const optim = optimizedStaff(departments, m.occ);
    return sum + (baseline - optim) * dCost * daysPerMonth;
  }, 0);
}

export type GroupAnnualSavingsArgs = AnnualSavingsArgs & {
  group: HotelGroup;
  baseRooms: number;
};

/** Annual savings (€) projected to the whole hotel group, prorated by total rooms. */
export function groupAnnualSavings({
  departments,
  monthly,
  monthlySalary,
  group,
  baseRooms,
}: GroupAnnualSavingsArgs): number {
  const single = annualSavings({ departments, monthly, monthlySalary });
  const totalRooms = group.properties.reduce((s, p) => s + p.rooms, 0);
  return single * (totalRooms / baseRooms);
}
