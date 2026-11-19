import React, { useMemo } from 'react';
import {
  Building2,
  Server,
  CheckCircle2,
  AlertOctagon,
  Layers,
  BellRing
} from 'lucide-react';
import { DashboardSummary, Device } from '../../types/network';
import { SourceBadge } from '../common/SourceBadge';

export type StatAction = 'hospitals' | 'all_devices' | 'online_devices' | 'unverified_devices' | 'vlans' | 'alerts';

interface OverviewStatsProps {
  summary: DashboardSummary;
  devices?: Device[];
  onStatClick?: (action: StatAction) => void;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ summary, devices = [], onStatClick }) => {
  const deviceBreakdown = useMemo(() => {
    if (!devices || devices.length === 0) {
      return `${summary.total_devices} Monitored Endpoints`;
    }
    const routers = devices.filter((d) => d.device_type === 'ROUTER').length;
    const switches = devices.filter((d) => d.device_type === 'SWITCH').length;
    const servers = devices.filter((d) => d.device_type === 'SERVER').length;
    return `${routers} Routers • ${switches} Switches • ${servers} Servers`;
  }, [devices, summary.total_devices]);

  const cards: Array<{
    id: StatAction;
    title: string;
    value: number;
    subtext: string;
    icon: any;
    color: string;
    borderColor: string;
    source: any;
  }> = [
    {
      id: 'hospitals',
      title: 'Hospital Locations',
      value: summary.total_hospitals,
      subtext: `${summary.total_hospitals} Hospital Sites via WAN`,
      icon: Building2,
      color: 'text-sky-400',
      borderColor: 'border-sky-500/20 hover:border-sky-500/50',
      source: summary.data_source,
    },
    {
      id: 'all_devices',
      title: 'Total Devices',
      value: summary.total_devices,
      subtext: deviceBreakdown,
      icon: Server,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/20 hover:border-blue-500/50',
      source: summary.data_source,
    },
    {
      id: 'online_devices',
      title: 'Online Devices',
      value: summary.online_devices,
      subtext: summary.online_devices > 0 ? `${summary.online_devices} Verified Operational` : 'Probing in canvas',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/50',
      source: summary.data_source,
    },
    {
      id: 'unverified_devices',
      title: 'Unverified / Offline',
      value: summary.unverified_devices + summary.offline_devices,
      subtext: `${summary.unverified_devices} unverified, ${summary.offline_devices} offline`,
      icon: AlertOctagon,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/20 hover:border-amber-500/50',
      source: 'BACKEND_PROBE' as const,
    },
    {
      id: 'vlans',
      title: 'Department VLANs',
      value: summary.total_vlans,
      subtext: `${summary.total_vlans} Active Broadcast Domains`,
      icon: Layers,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/20 hover:border-cyan-500/50',
      source: summary.data_source,
    },
    {
      id: 'alerts',
      title: 'Active Alerts',
      value: summary.active_alerts_count,
      subtext: summary.active_alerts_count > 0 ? `${summary.active_alerts_count} Unacknowledged Incidents` : 'All systems normal',
      icon: BellRing,
      color: summary.active_alerts_count > 0 ? 'text-rose-400' : 'text-slate-400',
      borderColor: summary.active_alerts_count > 0 ? 'border-rose-500/30 hover:border-rose-500/60' : 'border-slate-700/30 hover:border-slate-500/50',
      source: summary.recent_alerts.length > 0 ? summary.recent_alerts[0].source : summary.data_source,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            onClick={() => onStatClick?.(card.id)}
            role="button"
            tabIndex={0}
            className={`bg-[#111827] border ${card.borderColor} rounded-xl p-4 flex flex-col justify-between transition-all hover:bg-[#162238] hover:shadow-md cursor-pointer select-none group`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase font-mono group-hover:text-slate-200 transition-colors">
                {card.title}
              </span>
              <div className="p-1.5 rounded-lg bg-[#0A0E17] border border-[#1E293B] group-hover:scale-110 transition-transform">
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight group-hover:text-sky-300 transition-colors">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{card.subtext}</p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#1E293B]/70 flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-400 group-hover:text-sky-400 transition-colors">Click to view &rarr;</span>
              <SourceBadge source={card.source} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
