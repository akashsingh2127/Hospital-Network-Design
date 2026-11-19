import React from 'react';
import {
  DashboardSummary,
  TopologyData,
  Device,
  Vlan,
  EventLog,
  SimulationFlow
} from '../types/network';
import { OverviewStats, StatAction } from '../components/dashboard/OverviewStats';
import { HospitalCardsGrid } from '../components/dashboard/HospitalCardsGrid';
import { TopologyMap } from '../components/dashboard/TopologyMap';
import { NetworkHealthCard } from '../components/dashboard/NetworkHealthCard';
import { RecentAlertsCard } from '../components/dashboard/RecentAlertsCard';
import { NetworkServicesCard } from '../components/dashboard/NetworkServicesCard';
import { DeviceMonitoringSection } from '../components/dashboard/DeviceMonitoringSection';
import { VlanIpSection } from '../components/dashboard/VlanIpSection';
import { ActivityLogsSection } from '../components/dashboard/ActivityLogsSection';
import { PacketSimulationTracer } from '../components/dashboard/PacketSimulationTracer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { DashboardSection } from '../components/layout/Sidebar';
import {
  LayoutDashboard,
  Building2,
  GitFork,
  Server,
  Layers,
  Activity,
  Radio,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  topology: TopologyData | null;
  devices: Device[];
  vlans: Vlan[];
  liveEvents: EventLog[];
  activeFlow: SimulationFlow | null;
  onFlowSelected: (flow: SimulationFlow) => void;
  currentSection: DashboardSection;
  onSelectSection: (section: DashboardSection) => void;
  deviceStatusFilter: string | null;
  selectedHospitalId: string | null;
  onSelectDevice: (deviceId: string) => void;
  onSelectEvent: (eventId: string) => void;
  onStatClick: (action: StatAction) => void;
  onSelectHospital: (hospitalId: string) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  topology,
  devices,
  vlans,
  liveEvents,
  activeFlow,
  onFlowSelected,
  currentSection,
  onSelectSection,
  deviceStatusFilter,
  selectedHospitalId,
  onSelectDevice,
  onSelectEvent,
  onStatClick,
  onSelectHospital,
  isLoading,
  error,
  onRetry,
}) => {
  if (isLoading && !summary) {
    return (
      <LoadingSpinner
        label="Connecting to SmartCare Hospital Backend & Probing Cisco Packet Tracer..."
        size="lg"
      />
    );
  }

  if (error && !summary) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorBanner
          title="Could not connect to backend server"
          message={`Error: ${error}. Ensure FastAPI backend is running on http://localhost:8000.`}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (!summary) return null;

  const sectionPills: Array<{ id: DashboardSection; label: string; icon: any }> = [
    { id: 'overview', label: 'Network Overview', icon: LayoutDashboard },
    { id: 'hospitals', label: 'Hospital Locations', icon: Building2 },
    { id: 'topology', label: 'Topology Map', icon: GitFork },
    { id: 'devices', label: 'Device Monitoring', icon: Server },
    { id: 'vlans', label: 'VLAN & IP Info', icon: Layers },
    { id: 'health', label: 'Network Health', icon: Activity },
    { id: 'services', label: 'Network Services', icon: Radio },
    { id: 'alerts', label: 'Alerts & Incidents', icon: AlertTriangle },
    { id: 'logs', label: 'Activity Logs', icon: FileText },
  ];

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Section Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-[#111827] p-1.5 rounded-xl border border-[#1E293B] shadow-sm select-none">
        {sectionPills.map((pill) => {
          const Icon = pill.icon;
          const isActive = currentSection === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => onSelectSection(pill.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#162238]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render based on selected section or show Overview with quick links */}
      {currentSection === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Key Metrics Grid - 100% Dynamic */}
          <OverviewStats summary={summary} devices={devices} onStatClick={onStatClick} />

          {/* Interactive Packet Data Transfer Simulation Engine */}
          <PacketSimulationTracer
            activeFlow={activeFlow}
            onFlowSelected={onFlowSelected}
            onSelectDevice={onSelectDevice}
          />

          {/* Network Topology Overview with Active Path Lighting */}
          {topology ? (
            <TopologyMap
              topology={topology}
              activeFlow={activeFlow}
              onSelectDevice={onSelectDevice}
            />
          ) : (
            <div className="p-8 text-center bg-[#111827] border border-[#1E293B] rounded-xl text-slate-400 font-mono text-xs">
              Loading topology visual model...
            </div>
          )}

          {/* Hospital Locations Grid */}
          <HospitalCardsGrid
            hospitals={summary.hospitals}
            onSelectDevice={onSelectDevice}
          />

          {/* Quick Device Inventory Preview */}
          <DeviceMonitoringSection
            devices={devices}
            selectedHospitalId={selectedHospitalId}
            initialStatusFilter={deviceStatusFilter}
            onSelectDevice={onSelectDevice}
          />

          {/* Health & Alerts Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NetworkHealthCard health={summary.health} integration={summary.integration} />
            <RecentAlertsCard
              alerts={summary.recent_alerts}
              onSelectDevice={onSelectDevice}
            />
          </div>

          {/* Central DMZ Services */}
          <NetworkServicesCard services={summary.services} />

          {/* Recent Activity Logs */}
          <ActivityLogsSection
            liveEvents={liveEvents}
            onSelectEvent={onSelectEvent}
            onSelectDevice={onSelectDevice}
          />
        </div>
      )}

      {currentSection === 'hospitals' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <HospitalCardsGrid
            hospitals={summary.hospitals}
            onSelectDevice={onSelectDevice}
          />
        </div>
      )}

      {currentSection === 'topology' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <PacketSimulationTracer
            activeFlow={activeFlow}
            onFlowSelected={onFlowSelected}
            onSelectDevice={onSelectDevice}
          />
          {topology && (
            <TopologyMap
              topology={topology}
              activeFlow={activeFlow}
              onSelectDevice={onSelectDevice}
            />
          )}
        </div>
      )}

      {currentSection === 'devices' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <DeviceMonitoringSection
            devices={devices}
            selectedHospitalId={selectedHospitalId}
            initialStatusFilter={deviceStatusFilter}
            onSelectDevice={onSelectDevice}
          />
        </div>
      )}

      {currentSection === 'vlans' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <VlanIpSection
            vlans={vlans}
            selectedHospitalId={selectedHospitalId}
            onSelectHospital={onSelectHospital}
          />
        </div>
      )}

      {currentSection === 'health' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <NetworkHealthCard health={summary.health} integration={summary.integration} />
        </div>
      )}

      {currentSection === 'services' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <NetworkServicesCard services={summary.services} />
        </div>
      )}

      {currentSection === 'alerts' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <RecentAlertsCard
            alerts={summary.recent_alerts}
            onSelectDevice={onSelectDevice}
          />
        </div>
      )}

      {currentSection === 'logs' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <ActivityLogsSection
            liveEvents={liveEvents}
            onSelectEvent={onSelectEvent}
            onSelectDevice={onSelectDevice}
          />
        </div>
      )}
    </div>
  );
};
