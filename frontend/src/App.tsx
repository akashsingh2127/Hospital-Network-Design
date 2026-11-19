import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, DashboardSection } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { DeviceDetailModal } from './components/dashboard/DeviceDetailModal';
import { EventDetailModal } from './components/dashboard/EventDetailModal';
import { api, subscribeToNetworkEvents, WebSocketStatus } from './services/api';
import { DashboardSummary, TopologyData, Device, Vlan, EventLog, SimulationFlow } from './types/network';
import { StatAction } from './components/dashboard/OverviewStats';

export const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<DashboardSection>('overview');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topology, setTopology] = useState<TopologyData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [vlans, setVlans] = useState<Vlan[]>([]);
  const [liveEvents, setLiveEvents] = useState<EventLog[]>([]);
  const [activeFlow, setActiveFlow] = useState<SimulationFlow | null>(null);

  // Modals state
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Filters state propagated from clicks
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<string | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  // Loading & network state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>('CONNECTING');

  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    try {
      if (isManualRefresh) {
        await api.refreshIntegration();
      }

      const [summaryData, topologyData, devicesData, vlansData] = await Promise.all([
        api.getDashboardSummary(),
        api.getTopology(),
        api.getDevices(),
        api.getVlans(),
      ]);

      setSummary(summaryData);
      setTopology(topologyData);
      setDevices(devicesData);
      setVlans(vlansData);
      setError(null);
      setLastRefresh(new Date().toISOString());
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err?.message || 'Failed to communicate with hospital network service.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial Load & Polling Fallback (every 30s)
  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Real-time WebSocket Synchronization
  useEffect(() => {
    const unsubscribe = subscribeToNetworkEvents(
      (msg) => {
        console.log('[WS Message Received]', msg.type, msg);

        if (msg.type === 'NETWORK_STATE_CHANGED' || msg.type === 'NETWORK_STATE_CHANGE') {
          // Prepend newly detected events
          if (msg.payload?.events && Array.isArray(msg.payload.events)) {
            setLiveEvents((prev) => [...msg.payload.events, ...prev]);
          }
          // Silently refresh summary, devices and topology without full reload spinner
          loadDashboardData(false);
        } else if (msg.type === 'SIMULATION_FLOW_UPDATE') {
          if (msg.payload?.flow) {
            setActiveFlow(msg.payload.flow);
          }
          if (msg.payload?.events && Array.isArray(msg.payload.events)) {
            setLiveEvents((prev) => [...msg.payload.events, ...prev]);
          }
        } else if (msg.type === 'SNAPSHOT_RECORDED' || msg.type === 'PACKET_TRACER_FILE_CHANGED') {
          loadDashboardData(false);
        }
      },
      (status) => {
        setWsStatus(status);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [loadDashboardData]);

  // Handle stat clicks from Overview cards
  const handleStatClick = (action: StatAction) => {
    switch (action) {
      case 'hospitals':
        setCurrentSection('hospitals');
        break;
      case 'all_devices':
        setDeviceStatusFilter('ALL');
        setCurrentSection('devices');
        break;
      case 'online_devices':
        setDeviceStatusFilter('ONLINE');
        setCurrentSection('devices');
        break;
      case 'unverified_devices':
        setDeviceStatusFilter('UNVERIFIED');
        setCurrentSection('devices');
        break;
      case 'vlans':
        setCurrentSection('vlans');
        break;
      case 'alerts':
        setCurrentSection('alerts');
        break;
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0E17] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation - 100% Functional, 0 Placeholders */}
      <Sidebar
        currentTab={currentSection}
        onSelectTab={setCurrentSection}
        integration={summary?.integration}
        activeAlertsCount={summary?.active_alerts_count}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header with Live WebSocket Sync Badge */}
        <Header
          integration={summary?.integration}
          dataSource={summary?.data_source || 'SIMULATED'}
          lastRefresh={lastRefresh}
          isRefreshing={isRefreshing}
          onRefresh={() => loadDashboardData(true)}
          wsStatus={wsStatus}
        />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <DashboardPage
            summary={summary}
            topology={topology}
            devices={devices}
            vlans={vlans}
            liveEvents={liveEvents}
            activeFlow={activeFlow}
            onFlowSelected={(flow) => setActiveFlow(flow)}
            currentSection={currentSection}
            onSelectSection={setCurrentSection}
            deviceStatusFilter={deviceStatusFilter}
            selectedHospitalId={selectedHospitalId}
            onSelectDevice={(id) => setSelectedDeviceId(id)}
            onSelectEvent={(id) => setSelectedEventId(id)}
            onStatClick={handleStatClick}
            onSelectHospital={(id) => {
              setSelectedHospitalId(id);
              setCurrentSection('hospitals');
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => {
              setIsLoading(true);
              loadDashboardData(true);
            }}
          />
        </main>
      </div>

      {/* Device Detail Inspector Modal */}
      {selectedDeviceId && (
        <DeviceDetailModal
          deviceId={selectedDeviceId}
          onClose={() => setSelectedDeviceId(null)}
          onSelectEvent={(eventId) => {
            setSelectedDeviceId(null);
            setSelectedEventId(eventId);
          }}
        />
      )}

      {/* Activity Event Detail Modal */}
      {selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
          onSelectDevice={(deviceId) => {
            setSelectedEventId(null);
            setSelectedDeviceId(deviceId);
          }}
        />
      )}
    </div>
  );
};

export default App;
