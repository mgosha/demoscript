/**
 * API helper functions for DemoScript
 * Includes ngrok-skip-browser-warning header to bypass ngrok interstitial page
 */

const API_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(endpoint, {
    ...options,
    headers: {
      ...API_HEADERS,
      ...options.headers,
    },
  });
}

export async function apiPost<T = unknown>(
  endpoint: string,
  body: unknown
): Promise<{ status: number; data: T; error?: string }> {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function apiGet<T = unknown>(
  endpoint: string
): Promise<T> {
  const response = await apiFetch(endpoint);
  return response.json();
}
