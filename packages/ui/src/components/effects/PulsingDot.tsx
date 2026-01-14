interface PulsingDotProps {
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'slate' | 'cyan' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

export function PulsingDot({ color = 'blue', size = 'md' }: PulsingDotProps) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    slate: 'bg-slate-500',
    cyan: 'bg-cyan-500',
    red: 'bg-red-500',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className="relative flex">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[color]} opacity-75`}
      />
      <span className={`relative inline-flex rounded-full ${sizes[size]} ${colors[color]}`} />
    </span>
  );
}
