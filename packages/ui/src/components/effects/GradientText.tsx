import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning';
}

export function GradientText({ children, variant = 'primary' }: GradientTextProps) {
  const gradients = {
    primary: 'from-purple-600 via-blue-500 to-cyan-400',
    success: 'from-green-500 via-emerald-400 to-teal-400',
    warning: 'from-orange-500 via-amber-400 to-yellow-400',
  };

  return (
    <span className={`bg-gradient-to-r ${gradients[variant]} bg-clip-text text-transparent`}>
      {children}
    </span>
  );
}
