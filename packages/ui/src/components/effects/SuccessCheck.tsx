interface SuccessCheckProps {
  size?: number;
  animated?: boolean;
}

export function SuccessCheck({ size = 24, animated = true }: SuccessCheckProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={animated ? 'animate-bounce-once' : ''}
    >
      <circle cx="12" cy="12" r="10" className="fill-green-100 stroke-green-500" strokeWidth="2" />
      <path
        d="M8 12l2.5 2.5L16 9"
        className="stroke-green-500"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animated ? {
          strokeDasharray: 20,
          strokeDashoffset: 20,
          animation: 'draw-check 0.5s ease-out forwards 0.2s',
        } : undefined}
      />
    </svg>
  );
}
