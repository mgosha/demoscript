import { useState, useEffect, useCallback, useRef } from 'react';
import { extractValueByPath } from '../lib/variable-substitution';

export interface UseDataFetchOptions {
  url?: string;
  valuePath?: string;        // JSON path for single value extraction
  itemsPath?: string;        // JSON path for array extraction
  pollInterval?: number;     // Polling interval in ms (0 = no polling)
  enabled?: boolean;
  baseUrl?: string;          // For ${base_url} substitution
  limit?: number;            // Limit array items
}

export interface UseDataFetchReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

/**
 * Substitute ${base_url} and $base_url in URL string
 */
function substituteUrl(url: string, baseUrl?: string): string {
  if (!baseUrl) return url;

  // Support both ${base_url} and $base_url syntax
  return url
    .replace(/\$\{base_url\}/gi, baseUrl)
    .replace(/\$base_url/gi, baseUrl);
}

/**
 * Generic hook for fetching data from an API endpoint with optional polling
 */
export function useDataFetch<T = unknown>(
  options: UseDataFetchOptions
): UseDataFetchReturn<T> {
  const {
    url,
    valuePath,
    itemsPath,
    pollInterval = 0,
    enabled = true,
    baseUrl,
    limit,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const fullUrl = substituteUrl(url, baseUrl);
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(fullUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let result = await response.json();

      // Extract value if path specified
      if (valuePath) {
        result = extractValueByPath(result, valuePath);
      } else if (itemsPath) {
        result = extractValueByPath(result, itemsPath);
        // Apply limit if specified
        if (Array.isArray(result) && limit && limit > 0) {
          result = result.slice(0, limit);
        }
      } else if (itemsPath === '' && Array.isArray(result)) {
        // Empty string means root array
        if (limit && limit > 0) {
          result = result.slice(0, limit);
        }
      }

      setData(result as T);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, don't update state
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [url, valuePath, itemsPath, baseUrl, limit]);

  // Initial fetch and polling setup
  useEffect(() => {
    if (!enabled || !url) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Initial fetch
    setIsLoading(true);
    fetchData();

    // Set up polling if interval > 0
    if (pollInterval > 0) {
      intervalRef.current = window.setInterval(fetchData, pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [enabled, url, pollInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchData,
  };
}
