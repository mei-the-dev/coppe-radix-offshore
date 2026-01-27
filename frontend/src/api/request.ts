/**
 * Request helpers for authenticated API calls. Uses config for base URL and token.
 */

import { getBaseUrl, getAuthToken, setAuthToken } from './config';

export async function fetchWithAuth<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = getBaseUrl();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      setAuthToken(null);
      throw new Error('Authentication required. Please login again.');
    }
    const err = await response.json().catch(() => ({
      error: 'Unknown error',
      message: `HTTP ${response.status}`,
    }));
    throw new Error(err.message || err.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  if (import.meta.env.DEV) {
    import('../utils/dataInspector')
      .then(({ logAPIResponse }) =>
        logAPIResponse(endpoint, data, {
          method: options?.method || 'GET',
          status: response.status,
        })
      )
      .catch(() => {});
  }
  return data;
}

export function handleNetworkError(err: unknown, endpoint: string, baseUrl: string): never {
  if (err instanceof TypeError && (err.message ?? '').includes('fetch')) {
    console.error('Network error:', err);
    throw new Error(
      `Unable to connect to the server at ${baseUrl}${endpoint}. ` +
        'Please check your internet connection and ensure the server is running.'
    );
  }
  throw err;
}
