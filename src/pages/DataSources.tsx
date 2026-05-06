import { useEffect, useRef, useState } from 'react';
import { COPY, type SourceCard, type SourceCardId } from '@/data/copy';
import { fmtEUR } from '@/lib/format';
import { MONTHLY_OCCUPANCY } from '@/data/seasonality';
import { annualSavings } from '@/lib/cost';
import { useAppStore, useConfidence, useDepartments } from '@/store/appStore';
import { AISparkle } from '@/components/AI';

type Status = 'idle' | 'processing' | 'connected';

function StatusBadge({ status }: { status: Status }) {
  const C = COPY.sources;
  if (status === 'connected')
    return (
      <span className="thal-src-badge thal-src-badge--ok">
        <span className="thal-src-tick">✓</span> {C.statusConn}
      </span>
    );
  if (status === 'processing')
    return (
      <span className="thal-src-badge thal-src-badge--proc">
        <span className="thal-src-spin" /> {C.statusProc}
      </span>
    );
  return <span className="thal-src-badge">{C.statusNot}</span>;
}

function PMSModal({
  card,
  onPick,
  onClose,
}: {
  card: SourceCard;
  onPick: (opt: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="thal-modal-backdrop" onClick={onClose}>
      <div className="thal-srcmodal" onClick={(e) => e.stopPropagation()}>
        <header className="thal-modal-head">
          <h3 className="thal-modal-title">Connect your PMS</h3>
          <button className="thal-icon-btn" onClick={onClose} aria-label="Close">×</button>
        </header>
        <p className="thal-srcmodal-sub">
          Pick your property management system. We&apos;ll sync the last 12 months automatically.
        </p>
        <div className="thal-srcmodal-grid">
          {(card.options ?? []).map((opt) => (
            <button key={opt} className="thal-srcmodal-opt" onClick={() => onPick(opt)}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type CardProps = {
  card: SourceCard;
  status: Status;
  onConnect: (card: SourceCard) => void;
  onDisconnect: (card: SourceCard) => void;
  insights?: readonly string[];
};

function SourceCardView({ card, status, onConnect, onDisconnect, insights }: CardProps) {
  const C = COPY.sources;
  const isOn = status === 'connected';
  const isProc = status === 'processing';

  const handleAction = () => {
    if (isOn || isProc) return;
    onConnect(card);
  };

  return (
    <div className={'thal-srccard ' + (isOn ? 'is-on' : '')}>
      <header className="thal-srccard-head">
        <h3 className="thal-srccard-title">{card.title}</h3>
        <StatusBadge status={status} />
      </header>
      <p className="thal-srccard-desc">{card.desc}</p>
      <div className="thal-srccard-foot">
        <span className="thal-srccard-boost">
          <AISparkle size={10} /> {C.boost(card.boost)}
        </span>
        {!isOn && !isProc && (
          card.action === 'upload' ? (
            <button className="thal-btn thal-btn--gold" onClick={handleAction}>
              {C.actionUpload}
            </button>
          ) : card.action === 'upload-or-manual' ? (
            <span className="thal-srccard-actions">
              <button className="thal-btn thal-btn--ghost" onClick={handleAction}>
                {C.actionManual}
              </button>
              <button className="thal-btn thal-btn--gold" onClick={handleAction}>
                {C.actionUpload}
              </button>
            </span>
          ) : (
            <button className="thal-btn thal-btn--gold" onClick={handleAction}>
              {C.actionConnect}
            </button>
          )
        )}
        {isProc && (
          <span className="thal-srccard-proc">
            <span className="thal-src-spin" /> {C.statusProc}
          </span>
        )}
        {isOn && (
          <button
            className="thal-btn thal-btn--ghost thal-btn--sm"
            onClick={() => onDisconnect(card)}
          >
            {C.disconnect}
          </button>
        )}
      </div>

      {isOn && insights && (
        <div className="thal-src-insights">
          <div className="thal-eyebrow">
            <AISparkle size={10} /> &nbsp;{C.insightsTitle}
          </div>
          <ul>
            {insights.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const PROCESS_STEP_DELAY_MS = 950;

export default function DataSources() {
  const C = COPY.sources;
  const departments = useDepartments();
  const monthlySalary = useAppStore((s) => s.monthlySalary);
  const connected = useAppStore((s) => s.connected);
  const processing = useAppStore((s) => s.processing);
  const setConnected = useAppStore((s) => s.setConnected);
  const setProcessing = useAppStore((s) => s.setProcessing);
  const resetSources = useAppStore((s) => s.resetSources);
  const { confidence, precision, savingsMult } = useConfidence();

  const baselineAnnual = annualSavings({
    departments,
    monthly: MONTHLY_OCCUPANCY,
    monthlySalary,
  });
  const summarySavings = baselineAnnual * savingsMult;

  const [pmsOpen, setPmsOpen] = useState(false);
  const [pmsCard, setPmsCard] = useState<SourceCard | null>(null);

  const timersRef = useRef<number[]>([]);
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const statusFor = (id: SourceCardId): Status => {
    if (processing[id] !== undefined) return 'processing';
    if (connected[id]) return 'connected';
    return 'idle';
  };

  const runMockFlow = (id: SourceCardId) => {
    setProcessing(id, 0);
    const steps = C.procSteps[id];
    let i = 0;
    const tick = () => {
      i++;
      if (i < steps.length - 1) {
        setProcessing(id, i);
        const t = window.setTimeout(tick, PROCESS_STEP_DELAY_MS);
        timersRef.current.push(t);
      } else {
        setProcessing(id, null);
        setConnected(id, true);
      }
    };
    const t = window.setTimeout(tick, PROCESS_STEP_DELAY_MS);
    timersRef.current.push(t);
  };

  const startConnect = (card: SourceCard) => {
    if (card.id === 'pms' && card.options) {
      setPmsCard(card);
      setPmsOpen(true);
      return;
    }
    runMockFlow(card.id);
  };

  const disconnect = (card: SourceCard) => {
    setConnected(card.id, false);
  };

  const connectedCount = Object.values(connected).filter(Boolean).length;
  const insights = C.insights;

  return (
    <div className="thal-stack-lg">
      <section className="thal-page-head">
        <div>
          <div className="thal-eyebrow">{C.eyebrow}</div>
          <h2 className="thal-h2">{C.title}</h2>
        </div>
      </section>

      <section className="thal-srcsummary">
        <div className="thal-srcsummary-icon">
          <AISparkle size={18} />
        </div>
        <div className="thal-srcsummary-body">
          <p>
            {connectedCount === 0
              ? C.summary0
              : C.summaryN(
                  connectedCount,
                  confidence,
                  fmtEUR(summarySavings, { compact: true }),
                  precision,
                )}
          </p>
          {connectedCount === 0 && (
            <div className="thal-srcsummary-meta">
              {C.badgeBase(confidence, fmtEUR(summarySavings, { compact: true }))}
            </div>
          )}
        </div>
      </section>

      <section className="thal-srcgrid">
        {C.cards.map((card) => (
          <SourceCardView
            key={card.id}
            card={card}
            status={statusFor(card.id)}
            onConnect={startConnect}
            onDisconnect={disconnect}
            {...(insights[card.id] ? { insights: insights[card.id] } : {})}
          />
        ))}
      </section>

      {connectedCount > 0 && (
        <div className="thal-srcreset">
          <button className="thal-btn thal-btn--ghost" onClick={resetSources}>
            {C.resetAll}
          </button>
        </div>
      )}

      {pmsOpen && pmsCard && (
        <PMSModal
          card={pmsCard}
          onClose={() => setPmsOpen(false)}
          onPick={() => {
            setPmsOpen(false);
            runMockFlow('pms');
          }}
        />
      )}
    </div>
  );
}
