import { useState, useEffect, useCallback, useRef } from 'react';
import type { HealthCheck } from '../types/schema';

export interface HealthStatus {
  name: string;
  url: string;
  healthy: boolean | null; // null = checking
  lastChecked: Date | null;
  error?: string;
}

interface UseHealthCheckOptions {
  enabled?: boolean;
  interval?: number; // Default 10000ms
}

export function useHealthCheck(
  healthChecks: HealthCheck[] | undefined,
  options: UseHealthCheckOptions = {}
) {
  const { enabled = true, interval = 10000 } = options;
  const [statuses, setStatuses] = useState<HealthStatus[]>([]);
  const intervalRef = useRef<number | null>(null);

  const checkHealth = useCallback(async (check: HealthCheck): Promise<HealthStatus> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(check.url, {
        method: check.method || 'GET',
        signal: controller.signal,
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      clearTimeout(timeoutId);

      return {
        name: check.name,
        url: check.url,
        healthy: response.ok,
        lastChecked: new Date(),
      };
    } catch (err) {
      return {
        name: check.name,
        url: check.url,
        healthy: false,
        lastChecked: new Date(),
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }, []);

  const checkAllHealth = useCallback(async () => {
    if (!healthChecks || healthChecks.length === 0) return;

    const results = await Promise.all(healthChecks.map(checkHealth));
    setStatuses(results);
  }, [healthChecks, checkHealth]);

  // Initial check
  useEffect(() => {
    if (!enabled || !healthChecks || healthChecks.length === 0) {
      setStatuses([]);
      return;
    }

    // Initialize with "checking" state
    setStatuses(healthChecks.map(check => ({
      name: check.name,
      url: check.url,
      healthy: null,
      lastChecked: null,
    })));

    // Run initial check
    checkAllHealth();

    // Set up polling
    intervalRef.current = window.setInterval(checkAllHealth, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, healthChecks, interval, checkAllHealth]);

  const healthyCount = statuses.filter(s => s.healthy === true).length;
  const totalCount = statuses.length;
  const allHealthy = totalCount > 0 && healthyCount === totalCount;
  const someHealthy = healthyCount > 0;

  return {
    statuses,
    healthyCount,
    totalCount,
    allHealthy,
    someHealthy,
    refresh: checkAllHealth,
  };
}
