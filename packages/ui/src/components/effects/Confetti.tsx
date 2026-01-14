import { useCallback } from 'react';
import confetti from 'canvas-confetti';

const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#3b82f6'];

export function useConfetti() {
  const fire = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });
  }, []);

  const fireCannon = useCallback(() => {
    const end = Date.now() + 2000;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const fireStars = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors,
      shapes: ['star'] as confetti.Shape[],
    };

    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
    });

    confetti({
      ...defaults,
      particleCount: 25,
      scalar: 0.75,
    });
  }, []);

  return { fire, fireCannon, fireStars };
}

export function Confetti() {
  return null;
}
