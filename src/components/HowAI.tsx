import { useEffect } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { COPY } from '@/data/copy';
import { useAppStore } from '@/store/appStore';
import { AISparkle } from './AI';

export function HowAI() {
  const open = useAppStore((s) => s.howOpen);
  const onClose = useAppStore((s) => s.setHowOpen);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const H = COPY.ai.how;

  return (
    <div className="thal-modal-backdrop thal-modal-backdrop--left" onClick={() => onClose(false)}>
      <aside
        className="thal-modal thal-modal--left thal-modal--bottom-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="AI methodology"
        aria-modal="true"
      >
        <header className="thal-modal-head">
          <div>
            <div className="thal-eyebrow">
              <AISparkle size={11} /> &nbsp;Methodology
            </div>
            <h2 className="thal-modal-title">{COPY.ai.howTitle}</h2>
          </div>
          <button className="thal-icon-btn" onClick={() => onClose(false)} aria-label="Close">×</button>
        </header>

        <section className="thal-howai-section">
          <h3 className="thal-howai-h">{H.profileTitle}</h3>
          <dl className="thal-howai-dl">
            {H.profile.map(([k, v]) => (
              <Fragment key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </Fragment>
            ))}
          </dl>
        </section>

        <section className="thal-howai-section">
          <h3 className="thal-howai-h">{H.methodTitle}</h3>
          <ol className="thal-howai-ol">
            {H.method.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ol>
        </section>

        <p className="thal-howai-foot">{H.footer}</p>
      </aside>
    </div>
  );
}
