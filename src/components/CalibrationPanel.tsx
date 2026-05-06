import { useEffect } from 'react';
import { COPY } from '@/data/copy';
import { fmtEUR, fmtNum } from '@/lib/format';
import { useAppStore, useCalibrated, useDepartments } from '@/store/appStore';

export function CalibrationPanel() {
  const open = useAppStore((s) => s.calibOpen);
  const onClose = useAppStore((s) => s.setCalibOpen);
  const departments = useDepartments();
  const calibrated = useCalibrated();

  const monthlySalary = useAppStore((s) => s.monthlySalary);
  const totalStaff = useAppStore((s) => s.totalStaff);
  const pms = useAppStore((s) => s.pms);
  const painDept = useAppStore((s) => s.painDept);
  const setMonthlySalary = useAppStore((s) => s.setMonthlySalary);
  const setTotalStaff = useAppStore((s) => s.setTotalStaff);
  const setPms = useAppStore((s) => s.setPms);
  const setPainDept = useAppStore((s) => s.setPainDept);
  const resetCalibration = useAppStore((s) => s.resetCalibration);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const C = COPY.calibration;
  const totalCurrent = departments.reduce((s, d) => s + d.staff100, 0);

  return (
    <div className="thal-modal-backdrop" onClick={() => onClose(false)}>
      <aside
        className="thal-modal thal-modal--bottom-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Calibration"
        aria-modal="true"
      >
        <header className="thal-modal-head">
          <div>
            <div className="thal-eyebrow">{C.eyebrow}</div>
            <h2 className="thal-modal-title">{C.title}</h2>
          </div>
          <button className="thal-icon-btn" onClick={() => onClose(false)} aria-label="Close">×</button>
        </header>

        <p className="thal-modal-intro">{C.intro}</p>

        {calibrated && (
          <div className="thal-calibrated-badge">
            <span className="thal-calibrated-dot" /> {C.badge}
          </div>
        )}

        <div className="thal-form">
          <label className="thal-field">
            <span className="thal-field-label">{C.fields.total.label}</span>
            <span className="thal-field-hint">{C.fields.total.hint(fmtNum(totalCurrent))}</span>
            <div className="thal-field-row">
              <input
                type="number"
                className="thal-input"
                value={totalStaff}
                min={50}
                max={500}
                onChange={(e) => setTotalStaff(Number(e.target.value))}
              />
              <span className="thal-input-suffix">{C.fields.total.suffix}</span>
            </div>
          </label>

          <label className="thal-field">
            <span className="thal-field-label">{C.fields.salary.label}</span>
            <span className="thal-field-hint">{C.fields.salary.hint}</span>
            <div className="thal-slider-row thal-slider-row--inset">
              <input
                type="range"
                min={400}
                max={1000}
                step={10}
                className="thal-slider"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(Number(e.target.value))}
              />
              <span className="thal-slider-value thal-slider-value--lg">{fmtEUR(monthlySalary)}</span>
            </div>
          </label>

          <fieldset className="thal-field thal-field--fieldset">
            <legend className="thal-field-label">{C.fields.pms.label}</legend>
            <span className="thal-field-hint">{C.fields.pms.hint}</span>
            <div className="thal-chips">
              {C.pmsList.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={'thal-chip ' + (pms === p ? 'is-active' : '')}
                  onClick={() => setPms(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="thal-field">
            <span className="thal-field-label">{C.fields.pain.label}</span>
            <span className="thal-field-hint">{C.fields.pain.hint}</span>
            <select
              className="thal-input"
              value={painDept}
              onChange={(e) => setPainDept(e.target.value)}
            >
              <option value="">{C.fields.pain.placeholder}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <footer className="thal-modal-foot">
          <button className="thal-btn thal-btn--ghost" onClick={resetCalibration}>
            {C.reset}
          </button>
          <button className="thal-btn thal-btn--primary" onClick={() => onClose(false)}>
            {C.apply}
          </button>
        </footer>
      </aside>
    </div>
  );
}
