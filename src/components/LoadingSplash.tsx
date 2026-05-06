import { useEffect, useState } from 'react';
import { COPY } from '@/data/copy';
import { CONFIDENCE_BASE } from '@/lib/confidence';
import { AISparkle } from './AI';

type Props = { onDone: () => void };

const LINE_DELAY = 320;
const START_DELAY = 250;
const END_HOLD = 650;
const FADE_MS = 420;

export function LoadingSplash({ onDone }: Props) {
  const C = COPY.loading;
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        C.lines.forEach((_, i) => {
          timers.push(window.setTimeout(() => setStep(i + 1), i * LINE_DELAY));
        });
        timers.push(window.setTimeout(() => setDone(true), C.lines.length * LINE_DELAY + 100));
        timers.push(window.setTimeout(() => setHide(true), C.lines.length * LINE_DELAY + END_HOLD));
        timers.push(
          window.setTimeout(
            () => onDone(),
            C.lines.length * LINE_DELAY + END_HOLD + FADE_MS,
          ),
        );
      }, START_DELAY),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [C.lines, onDone]);

  return (
    <div className={'thal-splash ' + (hide ? 'is-hide' : '')}>
      <div className="thal-splash-inner">
        <div className="thal-splash-orb" aria-hidden="true">
          <AISparkle size={32} />
          <span className="thal-splash-orb-ring" />
          <span className="thal-splash-orb-ring thal-splash-orb-ring--2" />
        </div>
        <div className="thal-splash-title">{C.title}</div>
        <ul className="thal-splash-lines">
          {C.lines.map((l, i) => (
            <li key={i} className={'thal-splash-line ' + (step > i ? 'is-on' : '')}>
              <span className="thal-splash-arrow">→</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
        <div className={'thal-splash-done ' + (done ? 'is-on' : '')}>
          <span className="thal-splash-check">✓</span>
          <span>
            {C.done}: <strong>{CONFIDENCE_BASE}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
