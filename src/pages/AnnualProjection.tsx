import { COPY } from '@/data/copy';
import { HOTEL } from '@/data/hotel';
import { MONTHLY_OCCUPANCY, SEASONALITY } from '@/data/seasonality';
import type { Season } from '@/data/scenarios';
import { fmtEUR, fmtNum, fmtPct } from '@/lib/format';
import { baselineStaff, optimizedStaff } from '@/lib/staffing';
import { annualSavings, dailyCost, groupAnnualSavings } from '@/lib/cost';
import { useAppStore, useDepartments } from '@/store/appStore';
import { AIBadge, CountUp } from '@/components/AI';
import { Wave } from '@/components/Wave';

const SEASON_COLOR: Record<Season, string> = {
  high: '#c9a25f',
  shoulder: '#7a9080',
  low: '#1f3a5f',
};

export default function AnnualProjection() {
  const departments = useDepartments();
  const monthlySalary = useAppStore((s) => s.monthlySalary);
  const recalcKey = useAppStore((s) => s.recalcKey);

  const C = COPY.annual;
  const dCost = dailyCost(monthlySalary);
  const baseline = baselineStaff(departments);

  const monthly = MONTHLY_OCCUPANCY.map((m) => {
    const opt = optimizedStaff(departments, m.occ);
    const daysInMonth = 365 / 12;
    return { ...m, optim: opt, savings: (baseline - opt) * dCost * daysInMonth };
  });

  const annual = annualSavings({ departments, monthly: MONTHLY_OCCUPANCY, monthlySalary });
  const groupAnnual = groupAnnualSavings({
    departments,
    monthly: MONTHLY_OCCUPANCY,
    monthlySalary,
    group: HOTEL.group,
    baseRooms: HOTEL.rooms,
  });

  const maxSav = Math.max(...monthly.map((m) => m.savings));
  const SE = COPY.annual.seasonLabel;

  return (
    <div className="thal-stack-lg">
      <section className="thal-page-head">
        <div>
          <div className="thal-eyebrow">{C.eyebrow}</div>
          <h2 className="thal-h2">{C.title}</h2>
        </div>
      </section>

      <section className="thal-bignum">
        <div className="thal-bignum-bg" aria-hidden="true">
          <Wave className="thal-hero-wave" />
        </div>
        <div className="thal-bignum-content">
          <div className="thal-eyebrow thal-eyebrow--gold">{C.bigEyebrow} <AIBadge /></div>
          <div className="thal-bignum-value">
            <CountUp
              key={recalcKey + '-annual-big'}
              value={annual}
              duration={750}
              format={(v) => fmtEUR(v)}
            />
          </div>
          <div className="thal-bignum-sub">{C.bigSub(fmtEUR(monthlySalary))}</div>

          <div className="thal-bignum-group">
            <div className="thal-bignum-group-label">{C.groupLabel}</div>
            <div className="thal-bignum-group-value">
              ≈{' '}
              <CountUp
                key={recalcKey + '-grp'}
                value={groupAnnual}
                duration={750}
                format={(v) => fmtEUR(v)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="thal-card">
        <header className="thal-section-head">
          <div>
            <div className="thal-eyebrow">{C.monthsEyebrow}</div>
            <h3 className="thal-h3">{C.monthsTitle}</h3>
          </div>
          <div className="thal-legend">
            <span className="thal-legend-item">
              <span className="thal-legend-sw" style={{ background: SEASON_COLOR.high }} />
              {SE.high}
            </span>
            <span className="thal-legend-item">
              <span className="thal-legend-sw" style={{ background: SEASON_COLOR.shoulder }} />
              {SE.shoulder}
            </span>
            <span className="thal-legend-item">
              <span className="thal-legend-sw" style={{ background: SEASON_COLOR.low }} />
              {SE.low}
            </span>
          </div>
        </header>

        <div className="thal-annual">
          {monthly.map((m, i) => (
            <div key={m.month} className="thal-annual-col">
              <div className="thal-annual-bar-wrap">
                <div
                  className="thal-annual-bar"
                  style={{
                    height: (m.savings / maxSav) * 100 + '%',
                    background: SEASON_COLOR[m.season],
                  }}
                />
              </div>
              <div className="thal-annual-month">{C.months[i]}</div>
              <div className="thal-annual-occ">{fmtPct(m.occ)}</div>
              <div className="thal-annual-sav">{fmtEUR(m.savings, { compact: true })}</div>
            </div>
          ))}
        </div>

        <p className="thal-annual-caption">{C.caption}</p>

        <div className="thal-annual-summary">
          {(Object.entries(SEASONALITY) as [Season, (typeof SEASONALITY)[Season]][]).map(([k, v]) => (
            <div key={k} className="thal-annual-summary-item">
              <span className="thal-legend-sw" style={{ background: SEASON_COLOR[k] }} />
              <div>
                <div className="thal-annual-summary-label">{C.seasonLong[k]}</div>
                <div className="thal-annual-summary-meta">
                  {C.seasonMeta(v.days, fmtPct(v.avgOccupancy))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <span hidden>{fmtNum(monthly.length)}</span>
      </section>
    </div>
  );
}
