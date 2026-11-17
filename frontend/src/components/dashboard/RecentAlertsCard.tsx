import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Bell,
  Filter,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Alert, DataSource } from '../../types/network';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { SourceBadge } from '../common/SourceBadge';
import { api } from '../../services/api';

interface RecentAlertsCardProps {
  alerts: Alert[];
  onAlertAcknowledged?: (alertId: number) => void;
}

export const RecentAlertsCard: React.FC<RecentAlertsCardProps> = ({
  alerts: initialAlerts,
  onAlertAcknowledged,
}) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [filterSource, setFilterSource] = useState<string>('ALL');

  // Update local state when parent props change
  React.useEffect(() => {
    setAlerts(initialAlerts);
  }, [initialAlerts]);

  const handleAcknowledge = async (id: number) => {
    try {
      await api.acknowledgeAlert(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_acknowledged: true } : a))
      );
      if (onAlertAcknowledged) {
        onAlertAcknowledged(id);
      }
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSource === 'ALL') return true;
    return a.source === filterSource;
  });

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Recent Alerts & Network Events</span>
        </div>
      }
      subtitle="Operational incidents, ACL traps, and integration status logs"
      headerAction={
        <div className="flex items-center bg-[#0A0E17] border border-[#1E293B] rounded p-0.5 text-xs font-mono">
          <button
            onClick={() => setFilterSource('ALL')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              filterSource === 'ALL'
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSource('PACKET_TRACER')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              filterSource === 'PACKET_TRACER'
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Packet Tracer
          </button>
          <button
            onClick={() => setFilterSource('BACKEND_PROBE')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              filterSource === 'BACKEND_PROBE'
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Probes
          </button>
          <button
            onClick={() => setFilterSource('SIMULATED')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              filterSource === 'SIMULATED'
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simulated
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono">
            No active alerts matching the selected filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-lg border transition-all ${
                alert.is_acknowledged
                  ? 'bg-[#0A0E17]/60 border-[#1E293B] opacity-70'
                  : alert.severity === 'CRITICAL'
                  ? 'bg-rose-950/20 border-rose-900/40'
                  : alert.severity === 'WARNING'
                  ? 'bg-amber-950/20 border-amber-900/40'
                  : 'bg-[#0A0E17] border-[#1E293B]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="severity" severity={alert.severity}>
                      {alert.severity}
                    </Badge>
                    <SourceBadge source={alert.source} compact />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {alert.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-200">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {alert.message}
                  </p>
                </div>

                <div className="shrink-0 flex items-center">
                  {alert.is_acknowledged ? (
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-[#162238] hover:bg-[#1E293B] text-slate-200 border border-slate-700 rounded transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
