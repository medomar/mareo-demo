import { useState } from 'react';
import { COPY } from '@/data/copy';
import { fmtEUR, fmtNum, fmtPct } from '@/lib/format';
import { perDeptComparison } from '@/lib/staffing';
import { dailyCost } from '@/lib/cost';
import { useAppStore, useDepartments } from '@/store/appStore';
import { AIBadge, AIInfo, CountUp } from '@/components/AI';
import { HourlyHeatmap } from '@/components/HourlyHeatmap';

export default function DepartmentDetail() {
  const departments = useDepartments();
  const occupancy = useAppStore((s) => s.occupancy);
  const monthlySalary = useAppStore((s) => s.monthlySalary);
  const recalcKey = useAppStore((s) => s.recalcKey);

  const C = COPY.departments;
  const tips = COPY.ai.deptTooltips;
  const [mode, setMode] = useState<'optim' | 'base'>('optim');

  const rows = perDeptComparison(departments, occupancy);
  const dCost = dailyCost(monthlySalary);
  const totalBase = rows.reduce((s, r) => s + r.baseline, 0);
  const totalOpt = rows.reduce((s, r) => s + r.optimized, 0);
  const totalDelta = totalBase - totalOpt;
  const totalEur = totalDelta * dCost;

  return (
    <div className="thal-stack-lg">
      <section className="thal-page-head">
        <div>
          <div className="thal-eyebrow">{C.eyebrow}</div>
          <h2 className="thal-h2">{C.title(fmtPct(occupancy))}</h2>
        </div>
        <div className="thal-tot">
          <div className="thal-tot-item">
            <div className="thal-tot-label">{C.totals.savings}</div>
            <div className="thal-tot-val">
              <CountUp key={recalcKey + '-tot-eur'} value={totalEur} format={(v) => fmtEUR(v)} />
            </div>
          </div>
          <div className="thal-tot-item">
            <div className="thal-tot-label">{C.totals.delta}</div>
            <div className="thal-tot-val">
              <CountUp key={recalcKey + '-tot-d'} value={totalDelta} format={(v) => fmtNum(v, 1)} />
            </div>
          </div>
        </div>
      </section>

      <section className="thal-card">
        <div className="thal-dtable-wrap">
          <table className="thal-dtable">
            <thead>
              <tr>
                <th>{C.table.dept}</th>
                <th className="ta-r">{C.table.current}</th>
                <th className="ta-r">{C.table.optimized} <AIBadge /></th>
                <th className="ta-r">{C.table.delta}</th>
                <th className="ta-r">{C.table.dailyEur}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isFixed = r.variable === 0;
                const tip = tips[r.id] ?? tips._default ?? '';
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="thal-dtable-name">{r.name}</div>
                      <div className="thal-dtable-meta">
                        {isFixed ? C.table.fixed : C.table.variable(fmtPct(r.variable))}
                      </div>
                    </td>
                    <td className="ta-r mono">{fmtNum(r.baseline)}</td>
                    <td className="ta-r mono">
                      <strong>{fmtNum(r.optimized, 1)}</strong>
                      <AIInfo tip={tip} />
                    </td>
                    <td className="ta-r mono">
                      {r.delta > 0.05 ? (
                        <span className="thal-pill thal-pill--save">−{fmtNum(r.delta, 1)}</span>
                      ) : (
                        <span className="thal-pill thal-pill--neutral">—</span>
                      )}
                    </td>
                    <td className="ta-r mono">
                      {r.delta > 0.05 ? fmtEUR(r.delta * dCost) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th>{C.table.total}</th>
                <th className="ta-r mono">{fmtNum(totalBase)}</th>
                <th className="ta-r mono">{fmtNum(totalOpt, 1)}</th>
                <th className="ta-r mono">−{fmtNum(totalDelta, 1)}</th>
                <th className="ta-r mono">{fmtEUR(totalEur)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="thal-card">
        <header className="thal-section-head">
          <div>
            <div className="thal-eyebrow">{C.heatmap.eyebrow}</div>
            <h3 className="thal-h3">{C.heatmap.title}</h3>
          </div>
          <div className="thal-toggle" role="tablist">
            <button
              role="tab"
              aria-selected={mode === 'base'}
              className={'thal-toggle-btn ' + (mode === 'base' ? 'is-active' : '')}
              onClick={() => setMode('base')}
            >
              {C.heatmap.toggle.current}
            </button>
            <button
              role="tab"
              aria-selected={mode === 'optim'}
              className={'thal-toggle-btn ' + (mode === 'optim' ? 'is-active' : '')}
              onClick={() => setMode('optim')}
            >
              {C.heatmap.toggle.optim}
            </button>
          </div>
        </header>
        <HourlyHeatmap departments={departments} occupancy={occupancy} mode={mode} />
      </section>
    </div>
  );
}
