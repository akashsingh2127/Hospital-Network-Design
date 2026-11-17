import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Layers,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { NetworkHealth, IntegrationStatus } from '../../types/network';
import { Card } from '../common/Card';
import { SourceBadge } from '../common/SourceBadge';

interface NetworkHealthCardProps {
  health: NetworkHealth;
  integration: IntegrationStatus;
}

export const NetworkHealthCard: React.FC<NetworkHealthCardProps> = ({
  health,
  integration,
}) => {
  const chartData = health.telemetry_history || [];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Network Health & Packet Tracer Diagnostics</span>
        </div>
      }
      headerAction={<SourceBadge source={health.source} />}
    >
      <div className="space-y-6">
        {/* Top Metric Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0A0E17] border border-[#1E293B] rounded-lg p-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Overall Health Score</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {health.overall_health_score} / 100
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${health.overall_health_score}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-[#0A0E17] border border-[#1E293B] rounded-lg p-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Measured Latency</span>
            <div className="text-xl font-bold font-mono text-slate-200 mt-1">
              {health.verified_latency_ms !== null && health.verified_latency_ms !== undefined
                ? `${health.verified_latency_ms} ms`
                : 'N/A (Isolated)'}
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              {health.verified_latency_ms !== null ? 'Direct probe' : 'Canvas isolated'}
            </p>
          </div>

          <div className="bg-[#0A0E17] border border-[#1E293B] rounded-lg p-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Packet Loss</span>
            <div className="text-xl font-bold font-mono text-slate-200 mt-1">
              {health.verified_packet_loss_pct !== null && health.verified_packet_loss_pct !== undefined
                ? `${health.verified_packet_loss_pct}%`
                : 'N/A'}
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              {health.verified_packet_loss_pct !== null ? 'Active probe' : 'No ICMP drop'}
            </p>
          </div>

          <div className="bg-[#0A0E17] border border-[#1E293B] rounded-lg p-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Integration State</span>
            <div className="text-xl font-bold font-mono text-sky-400 mt-1 truncate">
              {integration.overall_integration_state}
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              PT v9.0.1 (Port 39000)
            </p>
          </div>
        </div>

        {/* Integration Capabilities Checklist */}
        <div className="bg-[#0A0E17] border border-[#1E293B] rounded-lg p-4">
          <h4 className="text-xs font-semibold text-slate-300 font-mono mb-3 uppercase tracking-wider">
            Host & Packet Tracer Verification Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-[#111827] border border-slate-800">
              <span className="text-slate-400">Packet Tracer Process (v9.0.1)</span>
              {integration.packet_tracer_running ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Running {integration.packet_tracer_pid ? `(PID ${integration.packet_tracer_pid})` : ''}
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Not Detected
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#111827] border border-slate-800">
              <span className="text-slate-400">Multiuser Listen Port (39000)</span>
              {integration.multiuser_port_open ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Listening
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Closed / Blocked
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#111827] border border-slate-800">
              <span className="text-slate-400">Local Auth/Login Port (8001)</span>
              {integration.http_login_port_open ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active (200 OK)
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Standby
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#111827] border border-slate-800">
              <span className="text-slate-400">Active .pkt Topology File</span>
              {integration.active_pkt_detected ? (
                <span className="text-emerald-400 flex items-center gap-1" title={integration.pkt_file_path}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified ({( (integration.pkt_file_size || 0) / 1024 ).toFixed(0)} KB)
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Missing File
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Telemetry Chart with Unambiguous Provenance Warning */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-semibold text-slate-200 font-mono flex items-center gap-2">
                <span>Baseline Telemetry Trend</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60">
                  SIMULATED FALLBACK
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Latency (ms) and Reachability (%) sample intervals
              </p>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              AS 100 Convergence
            </div>
          </div>

          {/* Explicit disclaimer banner */}
          <div className="mb-3 px-3 py-2 rounded bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Transparency Notice:</strong> Telemetry values below represent simulated historical baselines. Real-time host probing is active on localhost ports 39000 & 8001. Internal 10.x.x.x metrics remain isolated within Packet Tracer.
            </span>
          </div>

          <div className="h-44 w-full bg-[#0A0E17] border border-[#1E293B] rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="timestamp" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} domain={[0, 30]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#1E293B',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  itemStyle={{ color: '#38BDF8' }}
                />
                <Area
                  type="monotone"
                  dataKey="latency_ms"
                  name="Simulated Latency (ms)"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#latencyGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
};
