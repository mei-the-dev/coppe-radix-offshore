/**
 * API client for PRIO Offshore Logistics API.
 * Base URL from env only; no hardcoded keys. See .env.example and DEPLOYMENT_TROUBLESHOOTING.md.
 */
import {
  getBaseUrl,
  getAuthToken,
  setAuthToken,
  logApiUrlInDev,
} from './config';
import { fetchWithAuth, handleNetworkError } from './request';

logApiUrlInDev();

export { setAuthToken, getAuthToken };

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();
  try {
    return await fetchWithAuth<T>(endpoint, options);
  } catch (err) {
    handleNetworkError(err, endpoint, baseUrl);
  }
}

export const auth = {
  login: async (username: string, password: string) => {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(e.message || e.error || 'Login failed');
      }
      const data = await res.json();
      if (data.access_token) setAuthToken(data.access_token);
      return data;
    } catch (err: unknown) {
      handleNetworkError(
        err,
        '/auth/login',
        baseUrl
      );
    }
  },
  logout: () => setAuthToken(null),
  isAuthenticated: () => !!getAuthToken(),
};

const baseUrl = getBaseUrl();

export const api = {
  getVessels: async () => {
    const res = await fetch(`${baseUrl}/api/vessels`);
    if (!res.ok) throw new Error(`Failed to fetch vessels: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  getVessel: (id: string) => fetchAPI<any>(`/fleet/vessels/${id}`),
  updateVesselStatus: (id: string, status: any) =>
    fetchAPI<any>(`/fleet/vessels/${id}/availability`, {
      method: 'POST',
      body: JSON.stringify({
        status: status?.status ?? status,
        reason: status?.reason,
        unavailable_from: status?.unavailable_from,
        unavailable_to: status?.unavailable_to,
        notes: status?.notes,
      }),
    }),
  getBerths: async () => {
    const res = await fetch(`${baseUrl}/api/berths`);
    if (!res.ok) throw new Error(`Failed to fetch berths: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  getBerth: (id: string) => fetchAPI<any>(`/installations/${id}`),
  getAvailableBerths: () => Promise.resolve([]),
  updateBerthStatus: (id: string, status: any) =>
    Promise.resolve({ id, ...status }),
  getCargoCatalog: async () => {
    const r = await fetchAPI<{ data: any[] }>('/cargo/types');
    return r?.data ?? [];
  },
  getInstallations: async () => {
    const r = await fetchAPI<{ data: any[] }>('/installations');
    return r?.data ?? [];
  },
  validateCargo: (cargoItems: any[]) =>
    fetchAPI<{ valid: boolean; errors: string[] }>('/cargo/validate', {
      method: 'POST',
      body: JSON.stringify({ cargoItems }),
    }),
  getLoadingPlans: async () => {
    const r = await fetchAPI<{ data: any[] }>('/orders');
    return r?.data ?? [];
  },
  getLoadingPlan: (id: string) => fetchAPI<any>(`/orders/${id}`),
  createLoadingPlan: (plan: any) =>
    fetchAPI<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(plan),
    }),
  updateLoadingPlan: (id: string, updates: any) =>
    fetchAPI<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deleteLoadingPlan: (id: string) =>
    fetchAPI<void>(`/orders/${id}`, { method: 'DELETE' }),
};

function queryString(params: Record<string, string | undefined | boolean>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') q.append(k, String(v));
  });
  return q.toString();
}

export const prioAPI = {
  auth,
  installations: {
    list: (p?: { type?: string; active?: boolean; include_storage?: boolean }) =>
      fetchAPI<{ data: any[]; meta: any }>(
        `/installations?${queryString(p ?? {})}`
      ),
    get: (id: string) => fetchAPI<any>(`/installations/${id}`),
    updateInventory: (id: string, data: any) =>
      fetchAPI<any>(`/installations/${id}/inventory`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  distances: {
    list: (p?: { from?: string; to?: string }) =>
      fetchAPI<{ data: any[] }>(`/network/distances?${queryString(p ?? {})}`),
  },
  supplyBases: {
    list: () => fetchAPI<{ data: any[] }>('/supply-bases'),
    getBerths: (id: string) => fetchAPI<any[]>(`/supply-bases/${id}/berths`),
  },
  vessels: {
    list: (p?: { class?: string; status?: string; available_from?: string }) =>
      fetchAPI<{ data: any[]; meta: any }>(
        `/fleet/vessels?${queryString(p ?? {})}`
      ),
    get: (id: string) => fetchAPI<any>(`/fleet/vessels/${id}`),
    getSchedule: (id: string) => fetchAPI<any>(`/fleet/vessels/${id}/schedule`),
    updateAvailability: (id: string, data: any) =>
      fetchAPI<any>(`/fleet/vessels/${id}/availability`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  cargoTypes: {
    list: (p?: { category?: string }) =>
      fetchAPI<{ data: any[] }>(`/cargo/types?${queryString(p ?? {})}`),
  },
  demands: {
    list: (p?: {
      installation_id?: string;
      status?: string;
      priority?: string;
      from_date?: string;
      to_date?: string;
    }) =>
      fetchAPI<{ data: any[]; meta: any }>(`/demands?${queryString(p ?? {})}`),
    create: (data: any) =>
      fetchAPI<any>('/demands', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  orders: {
    list: (p?: {
      status?: string;
      vessel_id?: string;
      from_date?: string;
      to_date?: string;
    }) =>
      fetchAPI<{ data: any[] }>(`/orders?${queryString(p ?? {})}`),
    updateStatus: (id: string, data: any) =>
      fetchAPI<any>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  trips: {
    list: (p?: {
      vessel_id?: string;
      status?: string;
      from_date?: string;
      to_date?: string;
    }) =>
      fetchAPI<{ data: any[] }>(`/trips?${queryString(p ?? {})}`),
    getTracking: (id: string) => fetchAPI<any>(`/trips/${id}/tracking`),
    create: (data: any) =>
      fetchAPI<any>('/trips', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  weather: {
    getForecasts: (p: {
      location_id: string;
      from_time: string;
      to_time: string;
      horizon?: number;
    }) => {
      const q = new URLSearchParams({
        location_id: p.location_id,
        from_time: p.from_time,
        to_time: p.to_time,
      });
      if (p.horizon != null) q.append('horizon', String(p.horizon));
      return fetchAPI<any>(`/weather/forecasts?${q}`);
    },
    getWindows: (p: {
      location_id: string;
      operation_type: string;
      from_time: string;
      duration_h: number;
    }) =>
      fetchAPI<any>(
        `/weather/windows?${new URLSearchParams({
          ...p,
          duration_h: String(p.duration_h),
        } as Record<string, string>)}`
      ),
  },
  analytics: {
    getKPIs: (p?: { period?: string; from_date?: string; to_date?: string }) =>
      fetchAPI<any>(`/analytics/kpis?${queryString(p ?? {})}`),
    getVesselPerformance: (id: string) =>
      fetchAPI<any>(`/analytics/vessels/${id}/performance`),
  },
};
