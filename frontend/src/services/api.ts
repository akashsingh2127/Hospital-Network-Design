import {
  DashboardSummary,
  Hospital,
  Device,
  DeviceDetail,
  Vlan,
  TopologyData,
  NetworkService,
  Alert,
  IntegrationStatus,
  EventLog,
  EventFilterParams
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

  getDevices: (hospitalId?: string, status?: string): Promise<Device[]> => {
    const params = new URLSearchParams();
    if (hospitalId) params.append('hospital_id', hospitalId);
    if (status) params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Device[]>(`/devices${qs}`);
  },

  getDeviceDetail: (deviceId: string): Promise<DeviceDetail> => {
    return fetchJson<DeviceDetail>(`/devices/${deviceId}`);
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

  getEvents: (params?: EventFilterParams): Promise<EventLog[]> => {
    const sp = new URLSearchParams();
    if (params?.category) sp.append('category', params.category);
    if (params?.severity) sp.append('severity', params.severity);
    if (params?.hospital_id) sp.append('hospital_id', params.hospital_id);
    if (params?.device_id) sp.append('device_id', params.device_id);
    if (params?.search) sp.append('search', params.search);
    if (params?.limit) sp.append('limit', String(params.limit));
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return fetchJson<EventLog[]>(`/events${qs}`);
  },

  getEventDetail: (eventId: string): Promise<EventLog> => {
    return fetchJson<EventLog>(`/events/${eventId}`);
  },

  getIntegrationStatus: (): Promise<IntegrationStatus> => {
    return fetchJson<IntegrationStatus>('/integration/status');
  },

  refreshIntegration: (): Promise<IntegrationStatus> => {
    return fetchJson<IntegrationStatus>('/integration/refresh', {
      method: 'POST',
    });
  },

  traceSimulation: (req: { source_device_id: string; dest_device_id: string; protocol: string }): Promise<any> => {
    return fetchJson<any>('/simulation/trace', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  triggerRandomSimulation: (): Promise<any> => {
    return fetchJson<any>('/simulation/trigger-random', {
      method: 'POST',
    });
  },

  getSimulationEndpoints: (): Promise<Record<string, Array<{ id: string; name: string; ip: string; type: string; hospital: string }>>> => {
    return fetchJson<Record<string, Array<{ id: string; name: string; ip: string; type: string; hospital: string }>>>('/simulation/endpoints');
  },
};

export type WebSocketStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface WebSocketMessage {
  type: string;
  timestamp: string;
  payload: any;
}

export function subscribeToNetworkEvents(
  onMessage: (msg: WebSocketMessage) => void,
  onStatusChange?: (status: WebSocketStatus) => void
): () => void {
  const host = window.location.hostname || '127.0.0.1';
  const wsUrl = `ws://${host}:8000/api/v1/ws`;
  let ws: WebSocket | null = null;
  let isClosed = false;
  let reconnectTimeout: any = null;

  function connect() {
    if (isClosed) return;
    onStatusChange?.('CONNECTING');

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        onStatusChange?.('CONNECTED');
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onMessage(parsed);
        } catch (e) {
          console.error('[WS Parse Error]', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('[WS Error]', e);
        onStatusChange?.('ERROR');
      };

      ws.onclose = () => {
        if (!isClosed) {
          onStatusChange?.('DISCONNECTED');
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    } catch (err) {
      console.warn('[WS Init Failed]', err);
      onStatusChange?.('DISCONNECTED');
      reconnectTimeout = setTimeout(connect, 4000);
    }
  }

  connect();

  return () => {
    isClosed = true;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (ws) {
      ws.close();
      ws = null;
    }
  };
}
