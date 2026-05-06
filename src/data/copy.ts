import type { ShiftKey } from './departments';
import type { Season } from './scenarios';

export type SourceCardId = 'pms' | 'occ' | 'staffing' | 'bookings';
export type SourceAction = 'modal' | 'upload' | 'upload-or-manual' | 'connect';

export type SourceCard = {
  readonly id: SourceCardId;
  readonly title: string;
  readonly desc: string;
  readonly boost: number;
  readonly action: SourceAction;
  readonly options?: readonly string[];
};

export type ShiftCopy = { readonly key: ShiftKey; readonly label: string; readonly hours: string };

export const COPY = {
  app: {
    brandName: 'Mareo',
    brandTagline: 'Hospitality staffing intelligence',
    poweredBy: 'Powered by AI estimation engine',
    contactCta: 'Schedule a call',
    footer: 'Mareo · POC demo for Royal Thalassa Monastir',
    footerMeta: 'Model initialized on public data · ±10%',
  },
  nav: {
    dashboard: 'Dashboard',
    departments: 'Departments',
    weekly: 'Week',
    annual: 'Year',
    sources: 'Data Sources',
    calibration: 'Calibration',
  },
  loading: {
    title: 'AI is estimating your staffing requirements',
    lines: [
      'Analyzing hotel category: 5-star thalassotherapy resort',
      'Computing department ratios: 11 departments',
      'Calibrating intra-day shift profiles',
      'Cross-referencing industry benchmarks (200+ properties)',
    ],
    done: 'Estimation complete — Confidence',
  },
  hotel: {
    eyebrow: 'Property',
    tags: ['Thalassotherapy', 'Beachfront', 'Group: Thalassa Hotels Tunisia'],
    rooms: 'rooms',
  },
  kpi: {
    staff: {
      label: 'Staff today',
      sub: (delta: string, pct: string): string => `${delta} fewer staff (${pct}) vs. peak baseline`,
    },
    daily: {
      label: 'Daily savings',
      sub: (rate: string): string => `at ${rate} per person per day`,
    },
    annual: {
      label: 'Projected annual savings',
      sub: '365 days, modeled on Tunisia seasonality',
    },
  },
  scenarios: {
    eyebrow: 'Quick scenarios',
    title: 'Which day would you like to project?',
    occupancyBadge: 'Occupancy',
    sliderLabel: 'Adjust occupancy manually',
    occupancySuffix: 'occupancy',
  },
  rank: {
    eyebrow: 'Breakdown',
    title: 'Top 5 departments to optimize today',
    seeAll: 'See all 11 departments →',
  },
  departments: {
    eyebrow: 'Departmental view',
    title: (occ: string): string => `11 departments · ${occ} occupancy`,
    totals: { savings: 'Daily savings', delta: 'People saved' },
    table: {
      dept: 'Department',
      current: 'Current',
      optimized: 'Optimized',
      delta: 'Delta',
      dailyEur: 'Daily savings',
      total: 'Total',
      fixed: 'Fixed staffing',
      variable: (p: string): string => `${p} variable`,
    },
    heatmap: {
      eyebrow: 'Time slots',
      title: 'Staff per shift × department',
      toggle: { current: 'Current (peak)', optim: 'Optimized' },
      shifts: [
        { key: 'morning',   label: 'Morning',   hours: '6 AM – 2 PM' },
        { key: 'afternoon', label: 'Afternoon', hours: '2 PM – 10 PM' },
        { key: 'night',     label: 'Night',     hours: '10 PM – 6 AM' },
      ] as readonly ShiftCopy[],
      total: 'Total',
    },
  },
  weekly: {
    eyebrow: 'Rolling week',
    title: 'Staff per department × day',
    cumLabel: '7-day cumulative savings',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const,
    baselineLabel: (n: string): string => `Today's flat staffing — ${n} people every day`,
  },
  annual: {
    eyebrow: '12-month projection',
    title: 'Tunisia seasonality · full cycle',
    bigEyebrow: 'Annual savings',
    bigSub: (salary: string): string => `Royal Thalassa Monastir · 365 days · loaded salary ${salary}/month`,
    groupLabel: 'With Sousse (483 rooms) + Mahdia (~257 rooms), projected group savings',
    monthsEyebrow: 'Annual cycle',
    monthsTitle: 'Estimated monthly savings',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const,
    seasonLabel: { high: 'High', shoulder: 'Shoulder', low: 'Low' } as Record<Season, string>,
    seasonLong: { high: 'High season', shoulder: 'Shoulder season', low: 'Low season' } as Record<Season, string>,
    seasonMeta: (days: number, occ: string): string => `${days} days · avg occupancy ${occ}`,
    caption:
      "Savings are highest in low season — that's when the gap between static peak staffing and optimized variable staffing is widest. In summer, occupancy is near full capacity, so there's less room to optimize.",
  },
  calibration: {
    eyebrow: 'Calibration',
    title: 'Refine the model',
    intro:
      'This model was initialized from the public characteristics of Royal Thalassa Monastir (5-star, 260 rooms, thalassotherapy services). Estimated precision: ±10%. Calibrate below to refine — the AI learns from your inputs.',
    badge: 'Model calibrated with your data',
    recalibrating: 'Model recalibrating…',
    fields: {
      total: {
        label: 'Total staff at 100% occupancy',
        hint: (n: string): string => `Current estimate: ${n} people (sum of 11 departments)`,
        suffix: 'people',
      },
      salary: {
        label: 'Average loaded monthly salary',
        hint: 'All levels combined, contributions included',
      },
      pms: {
        label: 'PMS used',
        hint: 'For future integration of real data',
      },
      pain: {
        label: 'Most painful department',
        hint: 'Where over-staffing weighs heaviest today',
        placeholder: '— Select —',
      },
    },
    reset: 'Reset',
    apply: 'Apply',
    pmsList: ['Opera', 'Mews', 'Cloudbeds', 'Custom', 'Other'] as const,
  },
  ai: {
    badge: 'AI',
    badgeLong: 'AI estimate',
    confidenceLabel: 'Estimation confidence',
    confidenceTooltip:
      'How confident the AI is in its current estimates. Confidence increases as you validate parameters in the calibration panel or connect your historical data.',
    howTitle: 'How did the AI estimate this?',
    how: {
      profileTitle: 'Hotel profile analyzed',
      profile: [
        ['Category', '5-star'],
        ['Rooms', '260'],
        ['Type', 'Thalassotherapy resort'],
        ['Services', 'Multiple F&B outlets, full spa, private beach, entertainment program, landscaped grounds'],
        ['Region', 'Mediterranean Tunisia'],
      ] as ReadonlyArray<readonly [string, string]>,
      methodTitle: 'Methodology',
      method: [
        'Matched profile against 200+ comparable luxury wellness properties in the Mediterranean region.',
        'Derived department-level staffing ratios per 100 rooms.',
        'Estimated variability coefficients (% of staff that scales with occupancy) per department.',
        'Generated intra-day activity profiles based on resort type and guest behavior patterns.',
      ],
      footer: 'Confidence: ±10%. The model improves as you validate or correct parameters in the calibration panel.',
    },
    deptTooltips: {
      housekeeping: 'AI estimate: industry standard is 1 housekeeper per ~7 rooms in 5-star properties.',
      spa: 'AI estimate based on full thalasso treatment menu and 260-room capacity.',
      kitchen: 'AI estimate: brigade size for multi-restaurant 5-star property.',
      reception: 'AI estimate: 24/7 coverage with concierge and bell desk for luxury segment.',
      _default: 'AI estimate based on 5-star Mediterranean hospitality benchmarks.',
    } as Readonly<Record<string, string>>,
    disclaimer:
      'Model initialized from public hotel characteristics (5-star, 260 rooms, thalassotherapy). Estimated precision: ±10%. Refine via the calibration panel.',
  },
  sources: {
    eyebrow: 'Connectors',
    title: 'Data sources',
    summary0:
      'Your AI model is currently estimating from public hotel characteristics. Connect data sources below to refine accuracy and unlock more precise projections.',
    summaryN: (n: number, conf: number, savings: string, prec: number): string =>
      `Your AI model is calibrated with ${n} data source${n > 1 ? 's' : ''}. Confidence: ${conf}%. Estimated annual savings refined to ${savings} ±${prec}%.`,
    badgeBase: (conf: number, savings: string): string =>
      `Confidence: ${conf}% · Estimated annual savings: ${savings} ±10%`,
    boost: (n: number): string => `+${n}% confidence`,
    statusNot: 'Not connected',
    statusProc: 'Processing…',
    statusConn: 'Connected',
    actionConnect: 'Connect',
    actionUpload: 'Upload file',
    actionManual: 'Enter manually',
    disconnect: 'Disconnect',
    resetAll: 'Reset all sources',
    procSteps: {
      pms:      ['Authenticating…', 'Syncing last 12 months…', 'Connected'],
      occ:      ['Reading file…', 'Analyzing 12 months of data…', 'Connected'],
      staffing: ['Reading records…', 'Calibrating department ratios…', 'Connected'],
      bookings: ['Authorizing calendar…', 'Indexing forward bookings…', 'Connected'],
    } as Readonly<Record<SourceCardId, readonly string[]>>,
    cards: [
      {
        id: 'pms',
        title: 'PMS Integration',
        desc: 'Connect your PMS to automatically sync occupancy, bookings, and room status.',
        boost: 5,
        action: 'modal',
        options: ['Opera', 'Mews', 'Cloudbeds', 'Custom API'],
      },
      {
        id: 'occ',
        title: 'Historical Occupancy Data',
        desc: 'Upload 12 months of past occupancy data (CSV or Excel). The AI learns your seasonality patterns.',
        boost: 4,
        action: 'upload',
      },
      {
        id: 'staffing',
        title: 'Past Staffing Records',
        desc: 'Provide your historical headcount per department per month. The AI calibrates department-specific ratios to your actual operations.',
        boost: 2,
        action: 'upload-or-manual',
      },
      {
        id: 'bookings',
        title: 'Booking Calendar',
        desc: 'Sync upcoming reservations and group bookings for forward-looking forecasts.',
        boost: 1,
        action: 'connect',
      },
    ] as readonly SourceCard[],
    insights: {
      occ: [
        'Detected weekend uplift of +8% (matches industry standard for resort properties).',
        'Identified 3 historical anomalies (likely events) — excluded from baseline.',
        'Refined seasonality curve: peaks 2 weeks earlier than industry default.',
        'Model variability for Spa department reduced from ±12% to ±4%.',
      ],
      staffing: [
        'Housekeeping ratio refined: 1 per 6.8 rooms (vs industry estimate 1 per 7).',
        'Front Desk overstaffing detected on Tuesday afternoons (avg surplus: 2.1 FTE).',
        'Spa capacity bottleneck identified: occupancy >85% triggers wait times.',
      ],
    } as Readonly<Partial<Record<SourceCardId, readonly string[]>>>,
    insightsTitle: 'AI insights from your data',
  },
} as const;

export type Copy = typeof COPY;
