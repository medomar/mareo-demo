import { useState } from 'react';
import { COPY } from '@/data/copy';
import { useAppStore, useCalibrated, useConfidence, type ViewId } from '@/store/appStore';
import { AISparkle } from './AI';

const TABS: ReadonlyArray<{ id: ViewId; label: string }> = [
  { id: 'dashboard',   label: COPY.nav.dashboard },
  { id: 'departments', label: COPY.nav.departments },
  { id: 'weekly',      label: COPY.nav.weekly },
  { id: 'annual',      label: COPY.nav.annual },
  { id: 'sources',     label: COPY.nav.sources },
];

export function Header() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const setCalibOpen = useAppStore((s) => s.setCalibOpen);
  const setHowOpen = useAppStore((s) => s.setHowOpen);
  const calibrated = useCalibrated();
  const { confidence } = useConfidence();

  return (
    <header className="thal-header">
      <div className="thal-header-inner">
        <div className="thal-brand">
          <div className="thal-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="32" height="32">
              <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M4 18 Q10 12, 16 18 T28 18" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 22 Q10 16, 16 22 T28 22" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
            </svg>
          </div>
          <div>
            <div className="thal-brand-name">{COPY.app.brandName}</div>
            <div className="thal-brand-sub">
              <AISparkle size={9} className="thal-brand-spark" />
              {COPY.app.poweredBy}
            </div>
          </div>
        </div>

        <nav className="thal-nav" aria-label="Views">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={'thal-nav-btn ' + (view === t.id ? 'is-active' : '')}
              onClick={() => setView(t.id)}
            >
              {t.id === 'sources' && <SourceIcon />}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="thal-header-actions">
          <ConfidenceBadge value={confidence} />
          <button
            className="thal-icon-btn thal-icon-btn--bordered"
            onClick={() => setHowOpen(true)}
            title={COPY.ai.howTitle}
            aria-label={COPY.ai.howTitle}
          >
            ?
          </button>
          <button className="thal-calib-btn" onClick={() => setCalibOpen(true)}>
            {calibrated && <span className="thal-calib-dot" aria-hidden="true" />}
            {COPY.nav.calibration}
          </button>
          <button
            className="thal-cta-btn"
            onClick={() => window.alert('Demo: contact form would open here.')}
          >
            {COPY.app.contactCta}
          </button>
        </div>
      </div>
    </header>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const [hover, setHover] = useState(false);
  const r = 9;
  const c = 2 * Math.PI * r;
  const dash = c * (value / 100);
  return (
    <span
      className="thal-conf"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      tabIndex={0}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.18" />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 12 12)"
        />
      </svg>
      <span className="thal-conf-text">
        <span className="thal-conf-label">{COPY.ai.confidenceLabel}</span>
        <span className="thal-conf-value">{value}%</span>
      </span>
      {hover && <span className="thal-conf-tip">{COPY.ai.confidenceTooltip}</span>}
    </span>
  );
}

function SourceIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="11"
      height="11"
      aria-hidden="true"
      style={{ marginRight: 4, verticalAlign: -1 }}
    >
      <ellipse cx="8" cy="3.2" rx="5.5" ry="1.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M2.5 3.2 v4 c0,0.9 2.5,1.6 5.5,1.6 s5.5,-0.7 5.5,-1.6 v-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M2.5 7.2 v4 c0,0.9 2.5,1.6 5.5,1.6 s5.5,-0.7 5.5,-1.6 v-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
