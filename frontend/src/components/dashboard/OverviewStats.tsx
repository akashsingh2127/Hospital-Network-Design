import React from 'react';
import {
  Building2,
  Server,
  CheckCircle2,
  AlertOctagon,
  Layers,
  BellRing
} from 'lucide-react';
import { DashboardSummary } from '../../types/network';
import { SourceBadge } from '../common/SourceBadge';

interface OverviewStatsProps {
  summary: DashboardSummary;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Hospital Locations',
      value: summary.total_hospitals,
      subtext: '6 Facilities Connected via WAN',
      icon: Building2,
      color: 'text-sky-400',
      borderColor: 'border-sky-500/20',
      source: summary.data_source,
    },
    {
      title: 'Network Devices',
      value: summary.total_devices,
      subtext: '13 Routers + 7 Switches + 4 DMZ',
      icon: Server,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      source: summary.data_source,
    },
    {
      title: 'Online Devices',
      value: summary.online_devices,
      subtext: summary.online_devices > 0 ? 'Verified in topology' : 'Probing in canvas',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      source: summary.data_source,
    },
    {
      title: 'Unverified / Isolated',
      value: summary.unverified_devices,
      subtext: 'Internal canvas subnets',
      icon: AlertOctagon,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      source: 'BACKEND_PROBE' as const,
    },
    {
      title: 'Department VLANs',
      value: summary.total_vlans,
      subtext: '19 Segmented Broadcast Domains',
      icon: Layers,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/20',
      source: summary.data_source,
    },
    {
      title: 'Active Alerts',
      value: summary.active_alerts_count,
      subtext: summary.active_alerts_count > 0 ? 'Require review' : 'All systems normal',
      icon: BellRing,
      color: summary.active_alerts_count > 0 ? 'text-rose-400' : 'text-slate-400',
      borderColor: summary.active_alerts_count > 0 ? 'border-rose-500/30' : 'border-slate-700/30',
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
            className={`bg-[#111827] border ${card.borderColor} rounded-lg p-4 flex flex-col justify-between transition-all hover:bg-[#162238] shadow-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase font-mono">
                {card.title}
              </span>
              <div className="p-1.5 rounded-md bg-[#0A0E17] border border-[#1E293B]">
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{card.subtext}</p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#1E293B]/70 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">Source</span>
              <SourceBadge source={card.source} compact />
            </div>
          </div>
        );
      })}
    </div>
  );
};
