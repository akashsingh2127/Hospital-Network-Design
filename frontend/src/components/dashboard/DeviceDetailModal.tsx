import React, { useEffect, useState } from 'react';
import {
  X,
  Server,
  Activity,
  Layers,
  Route,
  Network,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Radio
} from 'lucide-react';
import { DeviceDetail, EventLog } from '../../types/network';
import { api } from '../../services/api';
import { SourceBadge } from '../common/SourceBadge';

interface DeviceDetailModalProps {
  deviceId: string | null;
  onClose: () => void;
  onSelectEvent?: (eventId: string) => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  deviceId,
  onClose,
  onSelectEvent
}) => {
  const [detail, setDetail] = useState<DeviceDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) return;
    setLoading(true);
    setError(null);

    api.getDeviceDetail(deviceId)
      .then((data) => {
        setDetail(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load device details');
        setLoading(false);
      });
  }, [deviceId]);

  if (!deviceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-[#0E1524] border border-[#1E293B] rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 tracking-tight">
                  {detail?.name || 'Device Details'}
                </h3>
                {detail?.hostname && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {detail.hostname}
                  </span>
                )}
                {detail && <SourceBadge source={detail.source} />}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {deviceId} &bull; Location: {detail?.hospital_id?.toUpperCase() || 'CORE'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Retrieving device details & interfaces...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
              <p className="font-semibold">Unable to load device configuration:</p>
              <p className="font-mono mt-1">{error}</p>
            </div>
          )}

          {detail && !loading && (
            <>
              {/* Primary Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Operational State</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      detail.status === 'ONLINE' || detail.status === 'OPERATIONAL'
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                        : 'bg-amber-400'
                    }`} />
                    <span className="font-bold text-xs font-mono text-slate-100">{detail.status}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Primary IP</span>
                  <p className="font-mono text-xs font-semibold text-slate-100 mt-1">
                    {detail.ip_address || 'Not available'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">MAC Address</span>
                  <p className="font-mono text-xs font-semibold text-slate-200 mt-1">
                    {detail.mac_address || 'Not available'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Hardware / Model</span>
                  <p className="text-xs font-semibold text-slate-200 mt-1">
                    {detail.model || 'Cisco Packet Tracer'}
                  </p>
                </div>
              </div>

              {/* Interfaces Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-sky-400" />
                    Network Interfaces ({detail.interfaces.length})
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">Packet Tracer Port Mappings</span>
                </div>

                <div className="rounded-lg border border-[#1E293B] overflow-hidden bg-[#111827]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#162238] border-b border-[#1E293B] font-mono text-slate-400 text-[11px]">
                      <tr>
                        <th className="py-2 px-3">Port / Interface</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">IP / Subnet</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Connected To</th>
                        <th className="py-2 px-3">VLAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B] font-mono">
                      {detail.interfaces.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                            No active interface telemetry available
                          </td>
                        </tr>
                      ) : (
                        detail.interfaces.map((iface, idx) => (
                          <tr key={idx} className="hover:bg-[#162238]/50 transition-colors">
                            <td className="py-2 px-3 font-semibold text-slate-200 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                              {iface.name}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                iface.status === 'UP'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                  : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                              }`}>
                                {iface.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {iface.ip_address ? (
                                <span>{iface.ip_address} {iface.subnet_mask && <span className="text-slate-400">({iface.subnet_mask})</span>}</span>
                              ) : (
                                <span className="text-slate-400 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-400">{iface.link_type || 'LAN'}</td>
                            <td className="py-2 px-3 text-sky-400">{iface.connected_to || 'None'}</td>
                            <td className="py-2 px-3 text-slate-300">
                              {iface.vlan_id ? `VLAN ${iface.vlan_id}` : iface.link_type === 'TRUNK' ? '802.1Q Trunk' : 'Default'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Routing & Topology Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Routing Information */}
                <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                    <Route className="w-4 h-4 text-indigo-400" />
                    Routing Configuration
                  </h4>
                  {detail.routing_info ? (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-[#1E293B]">
                        <span className="text-slate-400">Routing Protocol:</span>
                        <span className="font-semibold text-slate-200">{detail.routing_info.protocol || 'EIGRP'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#1E293B]">
                        <span className="text-slate-400">Autonomous System:</span>
                        <span className="font-semibold text-slate-200">AS {detail.routing_info.as || 100}</span>
                      </div>
                      {detail.routing_info.networks && (
                        <div>
                          <span className="text-slate-400 block mb-1">Advertised Networks:</span>
                          <div className="bg-[#0A0E17] p-2 rounded border border-[#1E293B] text-[11px] text-emerald-400 space-y-0.5">
                            {detail.routing_info.networks.map((net: string, i: number) => (
                              <div key={i}>network {net}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {detail.routing_info.nat && (
                        <div className="pt-1">
                          <span className="text-slate-400 block mb-1">NAT/PAT Configuration:</span>
                          <span className="text-[11px] text-amber-400 bg-[#0A0E17] px-2 py-1 rounded border border-[#1E293B] block">
                            {detail.routing_info.nat}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-mono italic">
                      No dynamic routing protocol enabled (Layer 2 Access Switch or Endpoint)
                    </p>
                  )}
                </div>

                {/* Topology & Connected Peers */}
                <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Connected Peers & VLANs
                  </h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block mb-1">Directly Connected Peers:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {detail.connected_devices.length === 0 ? (
                          <span className="text-slate-400 italic">None</span>
                        ) : (
                          detail.connected_devices.map((peer, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-[#162238] border border-sky-800/60 text-sky-300 text-[11px]">
                              {peer}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-400 block mb-1">Associated VLANs:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {detail.vlans.length === 0 ? (
                          <span className="text-slate-400 italic">None</span>
                        ) : (
                          detail.vlans.map((vlanId) => (
                            <span key={vlanId} className="px-2 py-1 rounded bg-[#162238] border border-emerald-800/60 text-emerald-300 text-[11px]">
                              VLAN {vlanId}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between border-t border-[#1E293B]">
                      <span className="text-slate-400">Verification Status:</span>
                      <span className="text-slate-200 font-semibold">{detail.verification_status || 'CURRENT'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Events for this Device */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Recent Events Involving Device ({detail.recent_events.length})
                </h4>
                <div className="rounded-lg border border-[#1E293B] overflow-hidden bg-[#111827]">
                  {detail.recent_events.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-mono italic">
                      No recent events recorded for this device
                    </div>
                  ) : (
                    <div className="divide-y divide-[#1E293B]">
                      {detail.recent_events.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => onSelectEvent?.(ev.event_id)}
                          className="p-3 flex items-start justify-between gap-3 hover:bg-[#162238]/60 cursor-pointer transition-colors text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
                                ev.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                                ev.severity === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                                'bg-sky-950 text-sky-400 border border-sky-800'
                              }`}>
                                {ev.severity}
                              </span>
                              <span className="font-semibold text-slate-200">{ev.event_type}</span>
                              <span className="text-slate-400 font-mono text-[11px]">&bull; {ev.category}</span>
                            </div>
                            <p className="text-slate-400 text-xs">{ev.description}</p>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono shrink-0">
                            {new Date(ev.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#1E293B] bg-[#111827] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Packet Tracer 9.0.1 Object Inspector</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1E293B] hover:bg-[#2A3B52] text-slate-200 rounded text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
