import type { ReactNode } from 'react';

type Accent = 'navy' | 'gold' | 'terra';

type Props = {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  accent?: Accent;
};

export function KpiCard({ label, value, sub, accent = 'navy' }: Props) {
  return (
    <div className={`thal-kpi thal-kpi--${accent}`}>
      <div className="thal-kpi-label">{label}</div>
      <div className="thal-kpi-value">{value}</div>
      {sub && <div className="thal-kpi-sub">{sub}</div>}
    </div>
  );
}
