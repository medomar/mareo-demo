import { COPY } from '@/data/copy';
import { fmtEUR, fmtNum } from '@/lib/format';
import { baselineStaff, dailyStaff } from '@/lib/staffing';
import { dailyCost } from '@/lib/cost';
import { useAppStore, useDepartments } from '@/store/appStore';
import { AIBadge } from '@/components/AI';

const PALETTE = [
  '#1f3a5f', '#2a4f7c', '#365f8e', '#5d7a9a', '#86a3bd',
  '#c9a25f', '#d4b276', '#e0c490', '#b56b3e', '#cc8b5d', '#7a9080',
] as const;

const WEEKEND_BOOST = 0.07;
const WEEKDAY_DIP = -0.02;

export default function WeeklyView() {
  const departments = useDepartments();
  const occupancy = useAppStore((s) => s.occupancy);
  const monthlySalary = useAppStore((s) => s.monthlySalary);

  const C = COPY.weekly;
  const week = C.days.map((d, i) => {
    const isWeekend = i >= 5;
    const occ = Math.min(0.99, Math.max(0.05, occupancy + (isWeekend ? WEEKEND_BOOST : WEEKDAY_DIP)));
    return { day: d, isWeekend, occ };
  });

  const dCost = dailyCost(monthlySalary);
  const baseline = baselineStaff(departments);

  const stacked = week.map((w) => {
    const perDept = departments.map((dep) => ({
      id: dep.id,
      name: dep.name,
      val: dailyStaff(dep, w.occ),
    }));
    const total = perDept.reduce((s, x) => s + x.val, 0);
    return { ...w, perDept, total, savings: (baseline - total) * dCost };
  });

  const cumulative = stacked.reduce((s, x) => s + x.savings, 0);
  const maxTotal = Math.max(baseline, ...stacked.map((s) => s.total));
  const deptColor = (id: string): string => {
    const idx = departments.findIndex((d) => d.id === id);
    return PALETTE[idx % PALETTE.length] ?? PALETTE[0]!;
  };

  return (
    <div className="thal-stack-lg">
      <section className="thal-page-head">
        <div>
          <div className="thal-eyebrow">{C.eyebrow}</div>
          <h2 className="thal-h2">{C.title} <AIBadge /></h2>
        </div>
        <div className="thal-tot">
          <div className="thal-tot-item">
            <div className="thal-tot-label">{C.cumLabel}</div>
            <div className="thal-tot-val">{fmtEUR(cumulative)}</div>
          </div>
        </div>
      </section>

      <section className="thal-card">
        <div className="thal-week">
          <div className="thal-week-yaxis">
            <span>{fmtNum(Math.ceil(maxTotal))}</span>
            <span>{fmtNum(Math.ceil(maxTotal / 2))}</span>
            <span>0</span>
          </div>
          <div className="thal-week-chart">
            <div
              className="thal-week-baseline"
              style={{ bottom: (baseline / maxTotal) * 100 + '%' }}
            >
              <span className="thal-week-baseline-label">{C.baselineLabel(fmtNum(baseline))}</span>
            </div>
            {stacked.map((s) => (
              <div key={s.day} className={'thal-week-col ' + (s.isWeekend ? 'is-weekend' : '')}>
                <div className="thal-week-col-bars">
                  {s.perDept.map((p) => (
                    <div
                      key={p.id}
                      className="thal-week-seg"
                      style={{ height: (p.val / maxTotal) * 100 + '%', background: deptColor(p.id) }}
                      title={`${p.name}: ${fmtNum(p.val, 1)}`}
                    />
                  ))}
                </div>
                <div className="thal-week-col-foot">
                  <div className="thal-week-day">{s.day}</div>
                  <div className="thal-week-total">{fmtNum(s.total, 0)}</div>
                  <div className="thal-week-save">{fmtEUR(s.savings, { compact: true })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="thal-week-legend">
          {departments.map((d) => (
            <div key={d.id} className="thal-week-legend-item">
              <span className="thal-week-legend-sw" style={{ background: deptColor(d.id) }} />
              <span>{d.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
