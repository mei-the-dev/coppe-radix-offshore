/**
 * API base URL and auth token config. All values from env or storage; no hardcoded secrets.
 * @see .env.example, DEPLOYMENT_TROUBLESHOOTING.md
 */

const DEPLOYED_BACKEND_PATH = '/coppe-radix-offshore-backend';
const TOKEN_KEY = 'prio_auth_token';

function isLocalhost(url: string): boolean {
  return !url || url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1');
}

export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.hostname.includes('ondigitalocean.app')) {
    if (isLocalhost(envUrl) || !envUrl) {
      return `${window.location.origin}${DEPLOYED_BACKEND_PATH}`;
    }
    return envUrl;
  }
  if (envUrl && !isLocalhost(envUrl)) return envUrl;
  return import.meta.env.DEV ? 'http://localhost:3001' : 'http://localhost:3001';
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
