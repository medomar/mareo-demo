import type { Season } from './scenarios';

export type SeasonStats = {
  readonly months: readonly number[];
  readonly days: number;
  readonly avgOccupancy: number;
  readonly weekendUplift: number;
};

export const SEASONALITY: Readonly<Record<Season, SeasonStats>> = {
  high:     { months: [6, 7, 8],            days:  92, avgOccupancy: 0.92, weekendUplift: 0.03 },
  shoulder: { months: [4, 5, 9, 10],        days: 122, avgOccupancy: 0.70, weekendUplift: 0.08 },
  low:      { months: [11, 12, 1, 2, 3],    days: 151, avgOccupancy: 0.38, weekendUplift: 0.10 },
};

export type MonthlyOccupancy = {
  readonly month: string;
  readonly occ: number;
  readonly season: Season;
};

export const MONTHLY_OCCUPANCY: readonly MonthlyOccupancy[] = [
  { month: 'Jan', occ: 0.32, season: 'low' },
  { month: 'Feb', occ: 0.36, season: 'low' },
  { month: 'Mar', occ: 0.42, season: 'low' },
  { month: 'Apr', occ: 0.62, season: 'shoulder' },
  { month: 'May', occ: 0.72, season: 'shoulder' },
  { month: 'Jun', occ: 0.88, season: 'high' },
  { month: 'Jul', occ: 0.95, season: 'high' },
  { month: 'Aug', occ: 0.96, season: 'high' },
  { month: 'Sep', occ: 0.78, season: 'shoulder' },
  { month: 'Oct', occ: 0.66, season: 'shoulder' },
  { month: 'Nov', occ: 0.42, season: 'low' },
  { month: 'Dec', occ: 0.40, season: 'low' },
];
