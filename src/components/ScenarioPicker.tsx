import { useEffect, useState } from 'react';
import { COPY } from '@/data/copy';
import { SCENARIOS, type Scenario } from '@/data/scenarios';
import { fmtPct } from '@/lib/format';

type Props = {
  currentId: string;
  occupancy: number;
  onPick: (s: Scenario) => void;
  onOccupancy: (occ: number) => void;
};

export function ScenarioPicker({ currentId, occupancy, onPick, onOccupancy }: Props) {
  const C = COPY.scenarios;
  // Local state for the slider so the input feels snappy; debounced into the store.
  const [local, setLocal] = useState(Math.round(occupancy * 100));

  useEffect(() => {
    setLocal(Math.round(occupancy * 100));
  }, [occupancy]);

  useEffect(() => {
    const target = local / 100;
    if (Math.abs(target - occupancy) < 0.005) return;
    const id = window.setTimeout(() => onOccupancy(target), 80);
    return () => window.clearTimeout(id);
  }, [local, occupancy, onOccupancy]);

  return (
    <div className="thal-scenarios">
      <div className="thal-scenarios-header">
        <div>
          <div className="thal-eyebrow">{C.eyebrow}</div>
          <h3 className="thal-h3">{C.title}</h3>
        </div>
        <div className="thal-occ-badge">
          <span className="thal-occ-badge-label">{C.occupancyBadge}</span>
          <span className="thal-occ-badge-value">{fmtPct(occupancy)}</span>
        </div>
      </div>

      <div className="thal-scenario-grid">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            className={'thal-scenario ' + (currentId === s.id ? 'is-active' : '')}
            onClick={() => onPick(s)}
          >
            <span className="thal-scenario-eyebrow">{s.sublabel}</span>
            <span className="thal-scenario-label">{s.label}</span>
            <span className="thal-scenario-occ">{fmtPct(s.occupancy)} {C.occupancySuffix}</span>
          </button>
        ))}
      </div>

      <div className="thal-slider-row">
        <label htmlFor="thal-occ-slider" className="thal-slider-label">
          {C.sliderLabel}
        </label>
        <input
          id="thal-occ-slider"
          className="thal-slider"
          type="range"
          min={0}
          max={100}
          step={1}
          value={local}
          onChange={(e) => setLocal(Number(e.target.value))}
        />
        <span className="thal-slider-value">{fmtPct(local / 100)}</span>
      </div>
    </div>
  );
}
