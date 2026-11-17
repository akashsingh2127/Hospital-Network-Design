import React from 'react';
import {
  LayoutDashboard,
  Building2,
  GitFork,
  Server,
  Layers,
  Route,
  ShieldCheck,
  Radio,
  Activity,
  AlertTriangle,
  BarChart3,
  FileText,
  Activity as HeartbeatIcon,
  Cable
} from 'lucide-react';
import { IntegrationStatus } from '../../types/network';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  integration?: IntegrationStatus;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  integration
}) => {
  const navSections = [
    {
      title: 'Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, isFunctional: true },
      ],
    },
    {
      title: 'Infrastructure',
      items: [
        { id: 'hospitals', label: 'Hospital Locations', icon: Building2, isFunctional: false },
        { id: 'topology', label: 'Network Topology', icon: GitFork, isFunctional: false },
        { id: 'devices', label: 'Device Management', icon: Server, isFunctional: false },
        { id: 'vlans', label: 'VLAN & IP Management', icon: Layers, isFunctional: false },
      ],
    },
    {
      title: 'Routing & Security',
      items: [
        { id: 'routing', label: 'Routing Management', icon: Route, isFunctional: false },
        { id: 'nat_security', label: 'NAT & Security', icon: ShieldCheck, isFunctional: false },
        { id: 'services', label: 'Network Services', icon: Radio, isFunctional: false },
      ],
    },
    {
      title: 'Telemetry & Logs',
      items: [
        { id: 'monitoring', label: 'Network Monitoring', icon: Activity, isFunctional: false },
        { id: 'alerts', label: 'Alerts & Incidents', icon: AlertTriangle, isFunctional: false },
        { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, isFunctional: false },
        { id: 'audit', label: 'Audit Logs', icon: FileText, isFunctional: false },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0D131F] border-r border-[#1E293B] flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#1E293B] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
          <HeartbeatIcon className="w-5 h-5 text-sky-400" />
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
        {navSections.map((section) => (
          <div key={section.title}>
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              {section.title}
            </h4>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.isFunctional) {
                        onSelectTab(item.id);
                      }
                    }}
                    disabled={!item.isFunctional}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                        : item.isFunctional
                        ? 'text-slate-300 hover:bg-[#162238] hover:text-slate-100'
                        : 'text-slate-400 cursor-not-allowed hover:bg-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {!item.isFunctional && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#162238] text-slate-400 border border-slate-700">
                        Future
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
            className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
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
          <span>19 VLANs</span>
        </div>
      </div>
    </aside>
  );
};
