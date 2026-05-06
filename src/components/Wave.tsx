type Props = { className?: string; flip?: boolean };

export function Wave({ className = '', flip = false }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      style={{ transform: flip ? 'scaleY(-1)' : 'none' }}
      aria-hidden="true"
    >
      <path
        d="M0,60 C240,110 480,10 720,40 C960,70 1200,110 1440,50 L1440,120 L0,120 Z"
        fill="currentColor"
        opacity="0.08"
      />
      <path
        d="M0,80 C240,40 520,100 760,70 C1000,40 1220,90 1440,70 L1440,120 L0,120 Z"
        fill="currentColor"
        opacity="0.05"
      />
    </svg>
  );
}
