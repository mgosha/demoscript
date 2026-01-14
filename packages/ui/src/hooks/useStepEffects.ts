import { useEffect, useRef } from 'react';
import { useDemo } from '../context/DemoContext';
import { useConfetti, useSoundEffects } from '../components/effects';

/**
 * Centralized hook for step completion effects.
 * Handles confetti and sound effects for ALL step types.
 * Respects configuration from demo settings.
 */
export function useStepEffects() {
  const { state, getStepStatus } = useDemo();
  const confetti = useConfetti();
  const { playSuccess, playError, enabled: soundEnabled } = useSoundEffects();
  const prevStatusRef = useRef<Record<number, string>>({});

  // Get effects configuration from demo settings (defaults to enabled)
  const effectsConfig = state.config?.settings?.effects;
  const confettiEnabled = effectsConfig?.confetti ?? true;
  const soundsEnabled = effectsConfig?.sounds ?? true;

  useEffect(() => {
    const currentStep = state.currentStep;
    const status = getStepStatus(currentStep);
    const prevStatus = prevStatusRef.current[currentStep];

    // Only trigger on status transitions
    if (status === prevStatus) return;

    if (status === 'complete' && prevStatus !== 'complete') {
      // Step completed successfully
      if (confettiEnabled) {
        confetti.fire();
      }
      if (soundsEnabled && soundEnabled) {
        playSuccess();
      }
    } else if (status === 'error' && prevStatus !== 'error') {
      // Step failed
      if (soundsEnabled && soundEnabled) {
        playError();
      }
    }

    // Update previous status
    prevStatusRef.current = {
      ...prevStatusRef.current,
      [currentStep]: status,
    };
  }, [
    state.currentStep,
    state.stepStatuses,
    getStepStatus,
    confetti,
    playSuccess,
    playError,
    confettiEnabled,
    soundsEnabled,
    soundEnabled,
  ]);
}
