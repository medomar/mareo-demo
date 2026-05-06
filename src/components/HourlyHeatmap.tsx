import type { CSSProperties } from 'react';
import { COPY } from '@/data/copy';
import type { Department } from '@/data/departments';
import { staffPerShift } from '@/lib/staffing';
import { fmtNum } from '@/lib/format';

type HeatmapMode = 'optim' | 'base';

type Props = {
  departments: readonly Department[];
  occupancy: number;
  mode: HeatmapMode;
};

type IntensityStyle = CSSProperties & { '--intensity': string };

export function HourlyHeatmap({ departments, occupancy, mode }: Props) {
  const C = COPY.departments.heatmap;
  const shifts = C.shifts;

  const rows = departments.map((d) => ({
    dept: d,
    optim: staffPerShift(d, occupancy),
    base: staffPerShift(d, 1.0),
  }));

  const maxVal = Math.max(
    ...rows.flatMap((r) => shifts.map((s) => Math.max(r.optim[s.key], r.base[s.key]))),
  );

  const valueOf = (r: (typeof rows)[number], key: typeof shifts[number]['key']): number =>
    mode === 'optim' ? r.optim[key] : r.base[key];

  return (
    <div className="thal-heatmap">
      <table className="thal-heatmap-table">
        <thead>
          <tr>
            <th className="thal-heatmap-corner" />
            {shifts.map((s) => (
              <th key={s.key} className="thal-heatmap-h">
                <div className="thal-heatmap-h-label">{s.label}</div>
                <div className="thal-heatmap-h-hours">{s.hours}</div>
              </th>
            ))}
            <th className="thal-heatmap-h thal-heatmap-h--total">{C.total}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const total = shifts.reduce((s, sh) => s + valueOf(r, sh.key), 0);
            return (
              <tr key={r.dept.id}>
                <th className="thal-heatmap-row-h">{r.dept.name}</th>
                {shifts.map((s) => {
                  const v = valueOf(r, s.key);
                  const intensity = maxVal > 0 ? v / maxVal : 0;
                  const style: IntensityStyle = {
                    '--intensity': intensity.toFixed(3),
                    opacity: v < 0.05 ? 0.25 : 1,
                  };
                  return (
                    <td key={s.key} className="thal-heatmap-cell">
                      <div className="thal-heatmap-pill" style={style}>
                        {v < 0.05 ? '–' : fmtNum(v, 1)}
                      </div>
                    </td>
                  );
                })}
                <td className="thal-heatmap-cell thal-heatmap-cell--total">{fmtNum(total, 1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
