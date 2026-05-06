export type Season = 'high' | 'shoulder' | 'low';

export type Scenario = {
  readonly id: string;
  readonly label: string;
  readonly sublabel: string;
  readonly occupancy: number;
  readonly season: Season;
  readonly weekday: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' | 'week';
};

export const SCENARIOS: readonly Scenario[] = [
  { id: 'peak-summer',  label: 'Saturday, August 15', sublabel: 'Peak summer · weekend',     occupancy: 0.98, season: 'high',     weekday: 'sat' },
  { id: 'low-winter',   label: 'Monday, January 22',  sublabel: 'Low season · weekday',      occupancy: 0.30, season: 'low',      weekday: 'mon' },
  { id: 'shoulder-may', label: 'Friday, May 24',      sublabel: 'Shoulder season · weekend', occupancy: 0.72, season: 'shoulder', weekday: 'fri' },
  { id: 'typical-week', label: 'Typical week in May', sublabel: '7 days',                    occupancy: 0.70, season: 'shoulder', weekday: 'week' },
];
