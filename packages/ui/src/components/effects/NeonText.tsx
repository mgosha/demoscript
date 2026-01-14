import { ReactNode } from 'react';

type NeonColor = 'cyan' | 'pink' | 'green' | 'purple' | 'orange';

interface NeonTextProps {
  children: ReactNode;
  color?: NeonColor;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const neonColors: Record<NeonColor, string> = {
  cyan: 'text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] dark:drop-shadow-[0_0_20px_rgba(6,182,212,0.9)]',
  pink: 'text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)] dark:drop-shadow-[0_0_20px_rgba(236,72,153,0.9)]',
  green: 'text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] dark:drop-shadow-[0_0_20px_rgba(34,197,94,0.9)]',
  purple: 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] dark:drop-shadow-[0_0_20px_rgba(168,85,247,0.9)]',
  orange: 'text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)] dark:drop-shadow-[0_0_20px_rgba(251,146,60,0.9)]',
};

export function NeonText({
  children,
  color = 'cyan',
  className = '',
  as: Component = 'span',
}: NeonTextProps) {
  return (
    <Component className={`${neonColors[color]} ${className}`}>
      {children}
    </Component>
  );
}

interface NeonBadgeProps {
  children: ReactNode;
  color?: NeonColor;
  className?: string;
}

export function NeonBadge({ children, color = 'cyan', className = '' }: NeonBadgeProps) {
  const borderColors: Record<NeonColor, string> = {
    cyan: 'border-cyan-400/50 bg-cyan-950/50',
    pink: 'border-pink-400/50 bg-pink-950/50',
    green: 'border-green-400/50 bg-green-950/50',
    purple: 'border-purple-400/50 bg-purple-950/50',
    orange: 'border-orange-400/50 bg-orange-950/50',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border ${borderColors[color]} ${className}`}
    >
      <NeonText color={color} className="text-sm font-medium">
        {children}
      </NeonText>
    </span>
  );
}
