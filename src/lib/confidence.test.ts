import { describe, expect, it } from 'vitest';
import { TOTAL_STAFF_AT_PEAK } from '@/data/departments';
import {
  CONFIDENCE_BASE,
  CONFIDENCE_MAX,
  SOURCE_BOOSTS,
  calibConfidenceBoost,
  precisionPercent,
  savingsRefinementMultiplier,
  sourceConfidenceBoost,
  totalConfidence,
} from './confidence';
import { DEFAULT_MONTHLY_SALARY } from './cost';

const defaultCalib = {
  monthlySalary: DEFAULT_MONTHLY_SALARY,
  totalStaff: TOTAL_STAFF_AT_PEAK,
  pms: '',
  painDept: '',
};

describe('sourceConfidenceBoost', () => {
  it('returns 0 when nothing is connected', () => {
    expect(sourceConfidenceBoost({})).toBe(0);
  });

  it('sums the boost weights for connected sources', () => {
    expect(sourceConfidenceBoost({ pms: true })).toBe(SOURCE_BOOSTS.pms);
    expect(sourceConfidenceBoost({ pms: true, occ: true })).toBe(
      SOURCE_BOOSTS.pms + SOURCE_BOOSTS.occ,
    );
    expect(
      sourceConfidenceBoost({ pms: true, occ: true, staffing: true, bookings: true }),
    ).toBe(SOURCE_BOOSTS.pms + SOURCE_BOOSTS.occ + SOURCE_BOOSTS.staffing + SOURCE_BOOSTS.bookings);
  });

  it('ignores explicitly disconnected sources', () => {
    expect(sourceConfidenceBoost({ pms: false, occ: true })).toBe(SOURCE_BOOSTS.occ);
  });
});

describe('calibConfidenceBoost', () => {
  it('returns 0 when no field has been changed', () => {
    expect(calibConfidenceBoost(defaultCalib)).toBe(0);
  });

  it('counts each non-default field as +1', () => {
    expect(
      calibConfidenceBoost({ ...defaultCalib, monthlySalary: DEFAULT_MONTHLY_SALARY + 50 }),
    ).toBe(1);
    expect(calibConfidenceBoost({ ...defaultCalib, totalStaff: TOTAL_STAFF_AT_PEAK + 5 })).toBe(1);
    expect(calibConfidenceBoost({ ...defaultCalib, pms: 'Opera' })).toBe(1);
    expect(calibConfidenceBoost({ ...defaultCalib, painDept: 'spa' })).toBe(1);
  });

  it('caps additivity at the number of fields (4)', () => {
    expect(
      calibConfidenceBoost({
        monthlySalary: 800,
        totalStaff: 220,
        pms: 'Mews',
        painDept: 'fb',
      }),
    ).toBe(4);
  });
});

describe('totalConfidence', () => {
  it('starts at the base when nothing is changed', () => {
    expect(totalConfidence({ connected: {}, calib: defaultCalib })).toBe(CONFIDENCE_BASE);
  });

  it('matches the demo trajectory: 87 → 92 → 96 → 98 → 99 as sources connect', () => {
    expect(totalConfidence({ connected: {}, calib: defaultCalib })).toBe(87);
    expect(totalConfidence({ connected: { pms: true }, calib: defaultCalib })).toBe(92);
    expect(totalConfidence({ connected: { pms: true, occ: true }, calib: defaultCalib })).toBe(96);
    expect(
      totalConfidence({
        connected: { pms: true, occ: true, staffing: true },
        calib: defaultCalib,
      }),
    ).toBe(98);
    expect(
      totalConfidence({
        connected: { pms: true, occ: true, staffing: true, bookings: true },
        calib: defaultCalib,
      }),
    ).toBe(99);
  });

  it('caps at the configured maximum even when calibration adds more', () => {
    const result = totalConfidence({
      connected: { pms: true, occ: true, staffing: true, bookings: true },
      calib: { monthlySalary: 800, totalStaff: 220, pms: 'Mews', painDept: 'fb' },
    });
    expect(result).toBe(CONFIDENCE_MAX);
  });
});

describe('precisionPercent', () => {
  it('returns 10% at the base confidence', () => {
    expect(precisionPercent(CONFIDENCE_BASE)).toBe(10);
  });

  it('returns 2% at the maximum confidence', () => {
    expect(precisionPercent(CONFIDENCE_MAX)).toBe(2);
  });

  it('clamps below the base and above the max', () => {
    expect(precisionPercent(0)).toBe(10);
    expect(precisionPercent(200)).toBe(2);
  });

  it('decreases monotonically as confidence rises', () => {
    let last = precisionPercent(CONFIDENCE_BASE);
    for (let c = CONFIDENCE_BASE + 1; c <= CONFIDENCE_MAX; c++) {
      const v = precisionPercent(c);
      expect(v).toBeLessThanOrEqual(last);
      last = v;
    }
  });
});

describe('savingsRefinementMultiplier', () => {
  it('is 1.0 with no connected sources', () => {
    expect(savingsRefinementMultiplier({})).toBe(1);
  });

  it('is strictly above 1 once any source is connected', () => {
    expect(savingsRefinementMultiplier({ pms: true })).toBeGreaterThan(1);
    expect(savingsRefinementMultiplier({ bookings: true })).toBeGreaterThan(1);
  });

  it('grows as more sources connect', () => {
    const a = savingsRefinementMultiplier({ pms: true });
    const b = savingsRefinementMultiplier({ pms: true, occ: true });
    const c = savingsRefinementMultiplier({ pms: true, occ: true, staffing: true });
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });
});
