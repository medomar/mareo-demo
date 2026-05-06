import { useMemo } from 'react';
import { COPY } from '@/data/copy';
import { HOTEL } from '@/data/hotel';
import { MONTHLY_OCCUPANCY } from '@/data/seasonality';
import { SCENARIOS } from '@/data/scenarios';
import { fmtEUR, fmtNum, fmtPct } from '@/lib/format';
import { baselineStaff, optimizedStaff, perDeptComparison } from '@/lib/staffing';
import { annualSavings, dailyCost } from '@/lib/cost';
import { useAppStore, useDepartments } from '@/store/appStore';
import { AIBadge, AISparkle, CountUp } from '@/components/AI';
import { KpiCard } from '@/components/KpiCard';
import { ScenarioPicker } from '@/components/ScenarioPicker';
import { Wave } from '@/components/Wave';

export default function Dashboard() {
  const departments = useDepartments();
  const occupancy = useAppStore((s) => s.occupancy);
  const monthlySalary = useAppStore((s) => s.monthlySalary);
  const scenario = useAppStore((s) => s.scenarioId);
  const recalcKey = useAppStore((s) => s.recalcKey);
  const setScenario = useAppStore((s) => s.setScenario);
  const setOccupancy = useAppStore((s) => s.setOccupancy);
  const setView = useAppStore((s) => s.setView);

  const baseline = baselineStaff(departments);
  const optim = optimizedStaff(departments, occupancy);
  const delta = baseline - optim;
  const dCost = dailyCost(monthlySalary);
  const daily = delta * dCost;

  const annual = useMemo(
    () => annualSavings({ departments, monthly: MONTHLY_OCCUPANCY, monthlySalary }),
    [departments, monthlySalary],
  );

  const C = COPY;

  return (
    <div className="thal-stack-lg">
      <section className="thal-hero">
        <div className="thal-hero-bg" aria-hidden="true">
          <Wave className="thal-hero-wave" />
        </div>
        <div className="thal-hero-content">
          <div className="thal-eyebrow thal-eyebrow--gold">{C.hotel.eyebrow}</div>
          <h1 className="thal-hero-title">{HOTEL.name}</h1>
          <div className="thal-hero-meta">
            <span>{HOTEL.rooms} {C.hotel.rooms}</span>
            <span className="thal-dot" />
            <span>{'★'.repeat(HOTEL.category)}</span>
            <span className="thal-dot" />
            <span>{HOTEL.location}</span>
          </div>
          <div className="thal-hero-tags">
            {C.hotel.tags.map((t) => (
              <span key={t} className="thal-tag">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="thal-kpis">
        <KpiCard
          accent="navy"
          label={C.kpi.staff.label}
          value={
            <span>
              <span className="thal-kpi-strike">{fmtNum(baseline)}</span>
              <span className="thal-kpi-arrow">→</span>
              <span className="thal-kpi-emph">
                <CountUp
                  key={recalcKey + '-staff'}
                  value={Math.round(optim)}
                  format={(v) => fmtNum(Math.round(v))}
                />
              </span>
              <AIBadge />
            </span>
          }
          sub={C.kpi.staff.sub(fmtNum(Math.round(delta)), fmtPct(delta / baseline, 1))}
        />
        <KpiCard
          accent="gold"
          label={C.kpi.daily.label}
          value={
            <span>
              <CountUp key={recalcKey + '-daily'} value={daily} format={(v) => fmtEUR(v)} />{' '}
              <AIBadge />
            </span>
          }
          sub={C.kpi.daily.sub(fmtEUR(dCost))}
        />
        <KpiCard
          accent="terra"
          label={C.kpi.annual.label}
          value={
            <span>
              <CountUp
                key={recalcKey + '-annual'}
                value={annual}
                duration={700}
                format={(v) => fmtEUR(v, { compact: true })}
              />{' '}
              <AIBadge />
            </span>
          }
          sub={C.kpi.annual.sub}
        />
      </section>

      <section className="thal-card thal-card--ivory">
        <ScenarioPicker
          currentId={scenario}
          occupancy={occupancy}
          onPick={(s) => setScenario(s.id, s.occupancy)}
          onOccupancy={setOccupancy}
        />
        {/* Read SCENARIOS list for keyed re-render parity */}
        <span hidden>{SCENARIOS.length}</span>
      </section>

      <DashboardDeptSnapshot
        departments={departments}
        occupancy={occupancy}
        monthlySalary={monthlySalary}
        onSeeAll={() => setView('departments')}
      />

      <p className="thal-disclaimer">
        <AISparkle size={10} /> &nbsp;{C.ai.disclaimer}
      </p>
    </div>
  );
}

type SnapshotProps = {
  departments: ReturnType<typeof useDepartments>;
  occupancy: number;
  monthlySalary: number;
  onSeeAll: () => void;
};

function DashboardDeptSnapshot({ departments, occupancy, monthlySalary, onSeeAll }: SnapshotProps) {
  const C = COPY.rank;
  const rows = perDeptComparison(departments, occupancy);
  const dCost = dailyCost(monthlySalary);
  const top = [...rows].sort((a, b) => b.delta - a.delta).slice(0, 5);

  return (
    <section className="thal-card">
      <header className="thal-section-head">
        <div>
          <div className="thal-eyebrow">{C.eyebrow}</div>
          <h3 className="thal-h3">{C.title}</h3>
        </div>
        <a
          className="thal-link"
          href="#departments"
          onClick={(e) => {
            e.preventDefault();
            onSeeAll();
          }}
        >
          {C.seeAll}
        </a>
      </header>
      <ul className="thal-rank">
        {top.map((d, i) => {
          const pct = d.baseline > 0 ? d.delta / d.baseline : 0;
          return (
            <li key={d.id} className="thal-rank-item">
              <span className="thal-rank-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="thal-rank-name">{d.name}</span>
              <div className="thal-rank-bar">
                <div className="thal-rank-bar-fill" style={{ width: pct * 100 + '%' }} />
              </div>
              <span className="thal-rank-delta">−{fmtNum(d.delta, 1)}</span>
              <span className="thal-rank-eur">{fmtEUR(d.delta * dCost)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
