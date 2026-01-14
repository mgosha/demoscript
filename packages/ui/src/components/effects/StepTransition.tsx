import { ReactNode, useEffect, useState } from 'react';

interface StepTransitionProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  isVisible?: boolean;
}

const transforms = {
  left: 'translateX(-20px)',
  right: 'translateX(20px)',
  up: 'translateY(-20px)',
  down: 'translateY(20px)',
};

export function StepTransition({
  children,
  direction = 'right',
  duration = 300,
  isVisible = true,
}: StepTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const shouldShow = mounted && isVisible;

  return (
    <div
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'ease-out',
        opacity: shouldShow ? 1 : 0,
        transform: shouldShow ? 'translate(0, 0)' : transforms[direction],
      }}
    >
      {children}
    </div>
  );
}

interface FadeSlideProps {
  children: ReactNode;
  isActive?: boolean;
  duration?: number;
}

export function FadeSlide({ children, isActive = true, duration = 500 }: FadeSlideProps) {
  return (
    <div
      className="transition-all ease-out"
      style={{
        transitionDuration: `${duration}ms`,
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateX(0)' : 'translateX(30px)',
      }}
    >
      {children}
    </div>
  );
}
