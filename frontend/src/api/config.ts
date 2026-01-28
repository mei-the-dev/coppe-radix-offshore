/**
 * API base URL and auth token config. All values from env or storage; no hardcoded secrets.
 * @see .env.example, DEPLOYMENT_TROUBLESHOOTING.md
 */

const DEPLOYED_BACKEND_PATH = '/coppe-radix-offshore-backend';
const TOKEN_KEY = 'prio_auth_token';

export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  // When VITE_API_URL is set (including localhost), use it so local dev hits the backend on 3001.
  if (envUrl) return envUrl;
  // In browser with no env URL: use same-origin backend path (production path-based routing).
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${DEPLOYED_BACKEND_PATH}`;
  }
  // Build time / SSR fallback
  return import.meta.env.DEV ? 'http://localhost:3001' : '';
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('API_BASE_URL_OVERRIDE');
    if (override) return override;
  }
  return getApiBaseUrl();
}

export function getAuthToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function logApiUrlInDev(): void {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    console.log('API Base URL:', getBaseUrl());
    console.log('VITE_API_URL env:', import.meta.env.VITE_API_URL);
  }
}
