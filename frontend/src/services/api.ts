import {
  DashboardSummary,
  Hospital,
  Device,
  Vlan,
  TopologyData,
  NetworkService,
  Alert,
  IntegrationStatus
} from '../types/network';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API request failed [${res.status}]: ${errorText || res.statusText}`);
  }

  return res.json();
}

export const api = {
  getDashboardSummary: (): Promise<DashboardSummary> => {
    return fetchJson<DashboardSummary>('/dashboard/summary');
  },

  getHospitals: (): Promise<Hospital[]> => {
    return fetchJson<Hospital[]>('/hospitals');
  },

  getHospital: (id: string): Promise<Hospital> => {
    return fetchJson<Hospital>(`/hospitals/${id}`);
  },

  getDevices: (hospitalId?: string): Promise<Device[]> => {
    const q = hospitalId ? `?hospital_id=${hospitalId}` : '';
    return fetchJson<Device[]>(`/devices${q}`);
  },

  getVlans: (hospitalId?: string): Promise<Vlan[]> => {
    const q = hospitalId ? `?hospital_id=${hospitalId}` : '';
    return fetchJson<Vlan[]>(`/vlans${q}`);
  },

  getTopology: (): Promise<TopologyData> => {
    return fetchJson<TopologyData>('/network/topology');
  },

  getServices: (): Promise<NetworkService[]> => {
    return fetchJson<NetworkService[]>('/services');
  },

  getAlerts: (severity?: string, source?: string): Promise<Alert[]> => {
    const params = new URLSearchParams();
    if (severity) params.append('severity', severity);
    if (source) params.append('source', source);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Alert[]>(`/alerts${qs}`);
  },

  acknowledgeAlert: (id: number): Promise<{ acknowledged: boolean }> => {
    return fetchJson<{ acknowledged: boolean }>(`/alerts/${id}/acknowledge`, {
      method: 'POST',
    });
  },

  getIntegrationStatus: (): Promise<IntegrationStatus> => {
    return fetchJson<IntegrationStatus>('/integration/status');
  },

  refreshIntegration: (): Promise<IntegrationStatus> => {
    return fetchJson<IntegrationStatus>('/integration/refresh', {
      method: 'POST',
    });
  },
};
