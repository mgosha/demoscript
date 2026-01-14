import { useState, useRef, useCallback } from 'react';
import { substituteVariables } from '../lib/variable-substitution';
import { evaluateCondition } from '../lib/rest-helpers';
import type { PollingConfig } from '../types/schema';

export interface PollingState {
  isPolling: boolean;
  attempt: number;
  maxAttempts: number;
  status: string;
}

interface UsePollingProps {
  pollConfig: PollingConfig | undefined;
  defaultInterval: number;
  defaultMaxAttempts: number;
}

interface UsePollingReturn {
  pollingState: PollingState | null;
  pollForResult: (jobId: string, variables: Record<string, unknown>) => Promise<unknown>;
  abortPolling: () => void;
  abortControllerRef: React.RefObject<AbortController | null>;
}

export function usePolling({
  pollConfig,
  defaultInterval,
  defaultMaxAttempts,
}: UsePollingProps): UsePollingReturn {
  const [pollingState, setPollingState] = useState<PollingState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const pollForResult = useCallback(async (
    jobId: string,
    variables: Record<string, unknown>
  ): Promise<unknown> => {
    if (!pollConfig) {
      throw new Error('No poll configuration');
    }

    const interval = pollConfig.interval || defaultInterval;
    const maxAttempts = pollConfig.max_attempts || defaultMaxAttempts;

    // Substitute variables in poll endpoint
    const pollEndpoint = substituteVariables(
      pollConfig.endpoint.replace('$jobId', jobId),
      { ...variables, jobId }
    );

    setPollingState({ isPolling: true, attempt: 0, maxAttempts, status: 'polling' });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Polling cancelled');
      }

      setPollingState({ isPolling: true, attempt, maxAttempts, status: 'polling' });

      // Wait for interval
      await new Promise((resolve) => setTimeout(resolve, interval));

      // Make poll request
      const pollResponse = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          method: 'GET',
          url: pollEndpoint,
        }),
      });

      const pollResult = await pollResponse.json();

      if (!pollResponse.ok) {
        continue; // Keep trying on error
      }

      const data = pollResult.data;

      // Check success condition
      if (pollConfig.success_when) {
        const isSuccess = evaluateCondition(pollConfig.success_when, data);
        if (isSuccess) {
          setPollingState(null);
          return data;
        }
      }

      // Check failure condition
      if (pollConfig.failure_when) {
        const isFailure = evaluateCondition(pollConfig.failure_when, data);
        if (isFailure) {
          setPollingState(null);
          throw new Error(`Job failed: ${JSON.stringify(data)}`);
        }
      }
    }

    setPollingState(null);
    throw new Error(`Polling timeout after ${maxAttempts} attempts`);
  }, [pollConfig, defaultInterval, defaultMaxAttempts]);

  const abortPolling = useCallback(() => {
    abortControllerRef.current?.abort();
    setPollingState(null);
  }, []);

  return {
    pollingState,
    pollForResult,
    abortPolling,
    abortControllerRef,
  };
}
