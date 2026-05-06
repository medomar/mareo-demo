import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { COPY } from '@/data/copy';

type SparkleProps = { size?: number; className?: string; style?: CSSProperties };

export function AISparkle({ size = 12, className = '', style }: SparkleProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M8 1 L9.4 6.6 L15 8 L9.4 9.4 L8 15 L6.6 9.4 L1 8 L6.6 6.6 Z" fill="currentColor" />
    </svg>
  );
}

type BadgeProps = { label?: string; title?: string };

export function AIBadge({ label, title }: BadgeProps) {
  return (
    <span className="thal-aibadge" title={title ?? COPY.ai.badgeLong}>
      <AISparkle size={10} />
      <span>{label ?? COPY.ai.badge}</span>
    </span>
  );
}

export function AIInfo({ tip }: { tip: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [open]);

  return (
    <span className="thal-aiinfo" ref={ref}>
      <button
        type="button"
        className="thal-aiinfo-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="AI estimate details"
      >
        <AISparkle size={10} />
      </button>
      {open && (
        <span className="thal-aiinfo-tip" role="tooltip">
          <strong>AI estimate</strong>
          <span>{tip}</span>
        </span>
      )}
    </span>
  );
}

type CountUpProps = {
  value: number;
  duration?: number;
  format?: (v: number) => string;
};

/** Smooth count-up animation — used to make recalibrations feel alive. */
export function CountUp({ value, duration = 500, format = (v) => v.toFixed(0) }: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number | null>(null);
  const displayRef = useRef(value);

  useEffect(() => {
    fromRef.current = displayRef.current;
    startRef.current = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const start = startRef.current ?? t;
      const elapsed = t - start;
      const k = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = fromRef.current + (value - fromRef.current) * eased;
      displayRef.current = v;
      setDisplay(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{format(display)}</>;
}
