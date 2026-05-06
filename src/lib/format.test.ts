import { describe, expect, it } from 'vitest';
import { fmtEUR, fmtNum, fmtPct } from './format';

describe('fmtEUR', () => {
  it('formats whole euros with no decimals by default', () => {
    expect(fmtEUR(1300)).toMatch(/€1,300/);
  });

  it('uses compact notation when requested', () => {
    expect(fmtEUR(120_000, { compact: true })).toMatch(/€/);
    expect(fmtEUR(120_000, { compact: true })).not.toMatch(/120,000/);
  });
});

describe('fmtNum', () => {
  it('formats integers without decimals by default', () => {
    expect(fmtNum(1234)).toBe('1,234');
  });

  it('respects the requested decimal precision', () => {
    expect(fmtNum(1.2345, 2)).toBe('1.23');
  });
});

describe('fmtPct', () => {
  it('renders fractional values as percentages', () => {
    expect(fmtPct(0.72)).toBe('72%');
  });

  it('respects decimal precision', () => {
    expect(fmtPct(0.1234, 1)).toBe('12.3%');
  });
});
