import React from 'react';
import {
  LayoutDashboard,
  Building2,
  GitFork,
  Server,
  Layers,
  Radio,
  Activity,
  AlertTriangle,
  FileText,
  Activity as HeartbeatIcon,
  Cable
} from 'lucide-react';
import { IntegrationStatus } from '../../types/network';

export type DashboardSection = 
  | 'overview'
  | 'hospitals'
  | 'topology'
  | 'devices'
  | 'vlans'
  | 'health'
  | 'services'
  | 'alerts'
  | 'logs';

interface SidebarProps {
  currentTab: DashboardSection;
  onSelectTab: (tab: DashboardSection) => void;
  integration?: IntegrationStatus;
  activeAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  integration,
  activeAlertsCount = 0
}) => {
  const navGroups = [
    {
      title: 'Core Monitoring',
      items: [
        { id: 'overview' as DashboardSection, label: 'Network Overview', icon: LayoutDashboard },
        { id: 'hospitals' as DashboardSection, label: 'Hospital Locations', icon: Building2 },
        { id: 'topology' as DashboardSection, label: 'Network Topology', icon: GitFork },
      ],
    },
    {
      title: 'Infrastructure & IP',
      items: [
        { id: 'devices' as DashboardSection, label: 'Device Monitoring', icon: Server },
        { id: 'vlans' as DashboardSection, label: 'VLAN & IP Information', icon: Layers },
        { id: 'services' as DashboardSection, label: 'Network Services', icon: Radio },
      ],
    },
    {
      title: 'Health & Observability',
      items: [
        { id: 'health' as DashboardSection, label: 'Network Health', icon: Activity },
        { id: 'alerts' as DashboardSection, label: 'Alerts & Events', icon: AlertTriangle, count: activeAlertsCount },
        { id: 'logs' as DashboardSection, label: 'Activity Logs', icon: FileText },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0D131F] border-r border-[#1E293B] flex flex-col h-screen select-none shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#1E293B] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-inner shadow-sky-500/10">
          <HeartbeatIcon className="w-5 h-5 text-sky-400 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base text-slate-100 tracking-tight">SmartCare</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-950 text-sky-400 border border-sky-800 rounded">NOC</span>
          </div>
          <p className="text-[11px] text-slate-400">Hospital Network Monitor</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-950'
                        : 'text-slate-300 hover:bg-[#162238] hover:text-slate-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#1E293B] bg-[#0A0E17]/60">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cable className="w-3.5 h-3.5 text-slate-400" />
            Cisco Packet Tracer
          </span>
          <span
            className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
              integration?.overall_integration_state === 'CONNECTED'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                : integration?.overall_integration_state === 'PARTIAL'
                ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                : 'bg-rose-950/80 text-rose-400 border-rose-800'
            }`}
          >
            {integration?.overall_integration_state || 'PROBING'}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex justify-between font-mono">
          <span>PT 9.0.1 (AS 100)</span>
          <span>19 VLANs / 24 Devs</span>
        </div>
      </div>
    </aside>
  );
};
