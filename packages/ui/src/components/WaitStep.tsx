import { useState, useEffect, useRef, useMemo } from 'react';
import { useDemo } from '../context/DemoContext';
import { substituteVariables } from '../lib/variable-substitution';
import type { WaitStep as WaitStepType, ExplicitWaitStep } from '../types/schema';
import { getWaitDuration } from '../types/schema';
import { GlowingCard } from './effects';

interface Props {
  step: WaitStepType | ExplicitWaitStep;
}

export function WaitStep({ step }: Props) {
  const { state, dispatch, getStepStatus } = useDemo();
  const duration = useMemo(() => getWaitDuration(step), [step]);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const status = getStepStatus(state.currentStep);
  const message = step.message ? substituteVariables(step.message, state.variables) : 'Waiting...';
  const progress = ((duration - timeLeft) / duration) * 100;

  useEffect(() => {
    // Reset when step changes
    setTimeLeft(duration);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [duration, state.currentStep]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStart = () => {
    setIsRunning(true);
    dispatch({ type: 'SET_STEP_STATUS', payload: { step: state.currentStep, status: 'executing' } });

    const startTime = Date.now();

    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsRunning(false);
        dispatch({ type: 'SET_STEP_STATUS', payload: { step: state.currentStep, status: 'complete' } });
      }
    }, 50);
  };

  const formatTime = (ms: number): string => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${ms}ms`;
  };

  return (
    <GlowingCard isActive={isRunning} color="yellow" intensity="medium">
      <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md dark:shadow-xl border border-gray-200 dark:border-yellow-500/20 p-8 transition-colors duration-300">
        <div className="text-center">
          {/* Timer icon */}
          <div className="mb-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-500/20 ${isRunning ? 'animate-pulse' : ''}`}>
              <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {message}
          </h3>

          {/* Time display */}
          <div className="text-4xl font-mono font-bold text-yellow-600 dark:text-yellow-400 mb-6">
            {formatTime(timeLeft)}
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md mx-auto mb-6">
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Start button */}
          {status !== 'complete' && !isRunning && (
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium rounded-lg hover:from-yellow-400 hover:to-yellow-500 shadow-lg shadow-yellow-500/25 transition-all duration-300"
            >
              Start Timer
            </button>
          )}

          {/* Status messages */}
          {isRunning && (
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Please wait...
            </p>
          )}

          {status === 'complete' && !isRunning && (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Complete</span>
            </div>
          )}
        </div>
      </div>
    </GlowingCard>
  );
}
