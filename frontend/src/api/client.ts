// API client for PRIO Offshore Logistics API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Log API URL in development and production for debugging
if (typeof window !== 'undefined') {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Environment:', import.meta.env.MODE);
}

// Token storage in localStorage for persistence
const TOKEN_KEY = 'prio_auth_token';

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  // Add authentication token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        setAuthToken(null);
        throw new Error('Authentication required. Please login again.');
      }
      const error = await response.json().catch(() => ({
        error: 'Unknown error',
        message: `HTTP ${response.status}`
      }));
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    // Debug logging (dynamic import to avoid circular dependencies)
    if (import.meta.env.DEV) {
      import('../utils/dataInspector').then(({ logAPIResponse }) => {
        logAPIResponse(endpoint, data, {
          method: options?.method || 'GET',
          status: response.status,
        });
      }).catch(() => {
        // Silently fail if debug utils not available
      });
    }

    return data;
  } catch (error: any) {
    // Handle network errors (failed to fetch)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error:', error);
      console.error('API_BASE_URL:', API_BASE_URL);
      console.error('Endpoint:', endpoint);
      throw new Error(
        `Unable to connect to the server at ${API_BASE_URL}${endpoint}. ` +
        `Please check your internet connection and ensure the server is running.`
      );
    }
    // Re-throw other errors
    throw error;
  }
}

// Authentication API
export const auth = {
  login: async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(error.message || error.error || 'Login failed');
      }

      const data = await response.json();
      if (data.access_token) {
        setAuthToken(data.access_token);
      }
      return data;
    } catch (error: any) {
      // Handle network errors (failed to fetch)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error:', error);
        throw new Error(
          `Unable to connect to the server. Please check:\n` +
          `1. Your internet connection\n` +
          `2. The server is running at ${API_BASE_URL}\n` +
          `3. CORS is properly configured`
        );
      }
      // Re-throw other errors
      throw error;
    }
  },

  logout: () => {
    setAuthToken(null);
  },

  isAuthenticated: () => !!getAuthToken(),
};

// Legacy API endpoints (for backward compatibility with existing components)
export const api = {
  // Vessels - using legacy /api/vessels endpoint (returns array directly)
  getVessels: async () => {
    const response = await fetch(`${API_BASE_URL}/api/vessels`);
    if (!response.ok) {
      throw new Error(`Failed to fetch vessels: ${response.status}`);
    }
    const data = await response.json();
    // Legacy endpoint returns array directly, not wrapped in { data: [...] }
    return Array.isArray(data) ? data : [];
  },

  getVessel: (id: string) =>
    fetchAPI<any>(`/fleet/vessels/${id}`),

  updateVesselStatus: (id: string, status: any) =>
    fetchAPI<any>(`/fleet/vessels/${id}/availability`, {
      method: 'POST',
      body: JSON.stringify({
        status: status.status || status,
        reason: status.reason,
        unavailable_from: status.unavailable_from,
        unavailable_to: status.unavailable_to,
        notes: status.notes,
      }),
    }),

  // Berths - using legacy /api/berths endpoint
  getBerths: async () => {
    const response = await fetch(`${API_BASE_URL}/api/berths`);
    if (!response.ok) {
      throw new Error(`Failed to fetch berths: ${response.status}`);
    }
    const data = await response.json();
    // Legacy endpoint returns array directly, not wrapped in { data: [...] }
    return Array.isArray(data) ? data : [];
  },

  getBerth: (id: string) =>
    fetchAPI<any>(`/installations/${id}`),

  getAvailableBerths: () =>
    Promise.resolve([]),

  updateBerthStatus: (id: string, status: any) =>
    Promise.resolve({ id, ...status }),

  // Cargo - using new PRIO API
  getCargoCatalog: async () => {
    const response = await fetchAPI<{ data: any[] }>('/cargo/types');
    return response.data || [];
  },

  getInstallations: async () => {
    const response = await fetchAPI<{ data: any[] }>('/installations');
    return response.data || [];
  },

  validateCargo: (cargoItems: any[]) =>
    fetchAPI<{ valid: boolean; errors: string[] }>('/cargo/validate', {
      method: 'POST',
      body: JSON.stringify({ cargoItems }),
    }),

  // Loading Plans - using orders endpoint
  getLoadingPlans: async () => {
    const response = await fetchAPI<{ data: any[] }>('/orders');
    return response.data || [];
  },

  getLoadingPlan: (id: string) =>
    fetchAPI<any>(`/orders/${id}`),

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
    fetchAPI<void>(`/orders/${id}`, {
      method: 'DELETE',
    }),
};

// New PRIO API endpoints
export const prioAPI = {
  // Authentication
  auth,

  // Network Management
  installations: {
    list: (params?: { type?: string; active?: boolean; include_storage?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.type) query.append('type', params.type);
      if (params?.active !== undefined) query.append('active', String(params.active));
      if (params?.include_storage) query.append('include_storage', 'true');
      return fetchAPI<{ data: any[]; meta: any }>(`/installations?${query}`);
    },
    get: (id: string) => fetchAPI<any>(`/installations/${id}`),
    updateInventory: (id: string, data: any) =>
      fetchAPI<any>(`/installations/${id}/inventory`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  distances: {
    list: (params?: { from?: string; to?: string }) => {
      const query = new URLSearchParams();
      if (params?.from) query.append('from', params.from);
      if (params?.to) query.append('to', params.to);
      return fetchAPI<{ data: any[] }>(`/network/distances?${query}`);
    },
  },

  // Fleet Management
  vessels: {
    list: (params?: { class?: string; status?: string; available_from?: string }) => {
      const query = new URLSearchParams();
      if (params?.class) query.append('class', params.class);
      if (params?.status) query.append('status', params.status);
      if (params?.available_from) query.append('available_from', params.available_from);
      return fetchAPI<{ data: any[]; meta: any }>(`/fleet/vessels?${query}`);
    },
    get: (id: string) => fetchAPI<any>(`/fleet/vessels/${id}`),
    getSchedule: (id: string) => fetchAPI<any>(`/fleet/vessels/${id}/schedule`),
    updateAvailability: (id: string, data: any) =>
      fetchAPI<any>(`/fleet/vessels/${id}/availability`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Cargo & Inventory
  cargoTypes: {
    list: (params?: { category?: string }) => {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      return fetchAPI<{ data: any[] }>(`/cargo/types?${query}`);
    },
  },

  demands: {
    list: (params?: {
      installation_id?: string;
      status?: string;
      priority?: string;
      from_date?: string;
      to_date?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.installation_id) query.append('installation_id', params.installation_id);
      if (params?.status) query.append('status', params.status);
      if (params?.priority) query.append('priority', params.priority);
      if (params?.from_date) query.append('from_date', params.from_date);
      if (params?.to_date) query.append('to_date', params.to_date);
      return fetchAPI<{ data: any[]; meta: any }>(`/demands?${query}`);
    },
    create: (data: any) =>
      fetchAPI<any>('/demands', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  orders: {
    list: (params?: {
      status?: string;
      vessel_id?: string;
      from_date?: string;
      to_date?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.vessel_id) query.append('vessel_id', params.vessel_id);
      if (params?.from_date) query.append('from_date', params.from_date);
      if (params?.to_date) query.append('to_date', params.to_date);
      return fetchAPI<{ data: any[] }>(`/orders?${query}`);
    },
    updateStatus: (id: string, data: any) =>
      fetchAPI<any>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  // Operations & Trips
  trips: {
    list: (params?: {
      vessel_id?: string;
      status?: string;
      from_date?: string;
      to_date?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.vessel_id) query.append('vessel_id', params.vessel_id);
      if (params?.status) query.append('status', params.status);
      if (params?.from_date) query.append('from_date', params.from_date);
      if (params?.to_date) query.append('to_date', params.to_date);
      return fetchAPI<{ data: any[] }>(`/trips?${query}`);
    },
    getTracking: (id: string) => fetchAPI<any>(`/trips/${id}/tracking`),
    create: (data: any) =>
      fetchAPI<any>('/trips', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Weather
  weather: {
    getForecasts: (params: {
      location_id: string;
      from_time: string;
      to_time: string;
      horizon?: number;
    }) => {
      const query = new URLSearchParams();
      query.append('location_id', params.location_id);
      query.append('from_time', params.from_time);
      query.append('to_time', params.to_time);
      if (params.horizon) query.append('horizon', String(params.horizon));
      return fetchAPI<any>(`/weather/forecasts?${query}`);
    },
    getWindows: (params: {
      location_id: string;
      operation_type: string;
      from_time: string;
      duration_h: number;
    }) => {
      const query = new URLSearchParams();
      query.append('location_id', params.location_id);
      query.append('operation_type', params.operation_type);
      query.append('from_time', params.from_time);
      query.append('duration_h', String(params.duration_h));
      return fetchAPI<any>(`/weather/windows?${query}`);
    },
  },

  // Analytics
  analytics: {
    getKPIs: (params?: { period?: string; from_date?: string; to_date?: string }) => {
      const query = new URLSearchParams();
      if (params?.period) query.append('period', params.period);
      if (params?.from_date) query.append('from_date', params.from_date);
      if (params?.to_date) query.append('to_date', params.to_date);
      return fetchAPI<any>(`/analytics/kpis?${query}`);
    },
    getVesselPerformance: (id: string) =>
      fetchAPI<any>(`/analytics/vessels/${id}/performance`),
  },
};
