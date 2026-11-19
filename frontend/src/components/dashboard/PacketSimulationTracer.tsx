import React, { useState, useEffect } from 'react';
import {
  Send,
  Zap,
  Activity,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Network,
  ArrowRight,
  Shield,
  Layers,
  Server,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { SimulationFlow, SimulationHop } from '../../types/network';
import { api } from '../../services/api';

interface PacketSimulationTracerProps {
  activeFlow: SimulationFlow | null;
  onFlowSelected: (flow: SimulationFlow) => void;
  onSelectDevice?: (deviceId: string) => void;
}

export const PacketSimulationTracer: React.FC<PacketSimulationTracerProps> = ({
  activeFlow,
  onFlowSelected,
  onSelectDevice,
}) => {
  const [endpoints, setEndpoints] = useState<Record<string, any[]>>({});
  const [sourceId, setSourceId] = useState<string>('sw_emer_access');
  const [destId, setDestId] = useState<string>('srv_http');
  const [protocol, setProtocol] = useState<string>('HTTP');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeHopIndex, setActiveHopIndex] = useState<number>(-1);

  // Load available endpoints
  useEffect(() => {
    api.getSimulationEndpoints()
      .then((data) => {
        setEndpoints(data);
      })
      .catch((err) => console.error('Failed to load simulation endpoints', err));
  }, []);

  // Animate hop progression whenever activeFlow changes
  useEffect(() => {
    if (!activeFlow || !activeFlow.hops) return;
    setActiveHopIndex(0);

    const interval = setInterval(() => {
      setActiveHopIndex((prev) => {
        if (prev < activeFlow.hops.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [activeFlow]);

  const handleSimulate = async () => {
    if (!sourceId || !destId) return;
    setLoading(true);
    try {
      const flow = await api.traceSimulation({
        source_device_id: sourceId,
        dest_device_id: destId,
        protocol: protocol,
      });
      onFlowSelected(flow);
    } catch (err: any) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerRandom = async () => {
    setLoading(true);
    try {
      const flow = await api.triggerRandomSimulation();
      setSourceId(flow.source_device_id);
      setDestId(flow.dest_device_id);
      setProtocol(flow.protocol);
      onFlowSelected(flow);
    } catch (err) {
      console.error('Random simulation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'DELIVERED':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'DROPPED':
        return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'NAT_TRANSLATED':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'ROUTED_EIGRP':
        return 'bg-indigo-950 text-indigo-400 border-indigo-800';
      case 'VLAN_TAGGED':
        return 'bg-cyan-950 text-cyan-400 border-cyan-800';
      default:
        return 'bg-sky-950 text-sky-400 border-sky-800';
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 shadow-lg space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E293B] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40">
              <Zap className="w-4 h-4 text-sky-400 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-100 tracking-tight">
              Packet Tracer Data Transfer & Hop-by-Hop Path Tracer
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              Live Path Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate actual data transmissions across hospital branches. Traces VLAN encapsulation, NAT translation, EIGRP AS 100 hops, and extended ACL filters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerRandom}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#162238] hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Simulate Clinical Traffic</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Source, Destination, Protocol, and Launch */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0A0E17] p-3.5 rounded-xl border border-[#1E293B]">
        {/* Source Selector */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            Source Device / Host
          </label>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          >
            {Object.entries(endpoints).map(([hosp, devs]) => (
              <optgroup key={hosp} label={hosp.toUpperCase()}>
                {devs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.ip})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Destination Selector */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            Destination Target
          </label>
          <select
            value={destId}
            onChange={(e) => setDestId(e.target.value)}
            className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          >
            {Object.entries(endpoints).map(([hosp, devs]) => (
              <optgroup key={hosp} label={hosp.toUpperCase()}>
                {devs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.ip})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Protocol Selector */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            Protocol / Service
          </label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="HTTP">HTTP (DMZ Web Portal - Port 80)</option>
            <option value="DNS">DNS (HQ Nameserver - Port 53)</option>
            <option value="FTP">FTP (Medical Reports - Port 21)</option>
            <option value="SMTP">SMTP (Hospital Mail - Port 25)</option>
            <option value="ICMP">ICMP (Echo Request / Ping)</option>
            <option value="EIGRP">EIGRP (Routing Update - Protocol 88)</option>
          </select>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full h-[34px] flex items-center justify-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900/60 text-white font-medium text-xs shadow-md shadow-sky-950 transition-all border border-sky-400/40"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Tracing Route...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Packet & Trace Path</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Simulation Trace Visualizer */}
      {activeFlow && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          {/* Flow Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B]">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${
                activeFlow.status === 'DELIVERED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                'bg-rose-950 text-rose-400 border-rose-800'
              }`}>
                {activeFlow.status}
              </span>
              <div>
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="text-sky-400">{activeFlow.source_device_name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-emerald-400">{activeFlow.dest_device_name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {activeFlow.protocol}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{activeFlow.summary}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono shrink-0">
              <div className="text-right">
                <span className="text-slate-400 text-[10px] uppercase block">Total Latency</span>
                <span className="text-slate-100 font-bold">{activeFlow.total_latency_ms} ms</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] uppercase block">Hops</span>
                <span className="text-sky-400 font-bold">{activeFlow.hops.length} Devices</span>
              </div>
            </div>
          </div>

          {/* Hop by Hop Horizontal Stepper */}
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-2 min-w-max py-2 px-1">
              {activeFlow.hops.map((hop, idx) => {
                const isCurrent = idx <= activeHopIndex;
                const isLatest = idx === activeHopIndex;

                return (
                  <React.Fragment key={hop.hop_number}>
                    <div
                      onClick={() => onSelectDevice?.(hop.device_id)}
                      className={`relative p-3 rounded-xl border text-xs cursor-pointer transition-all w-52 shrink-0 ${
                        isLatest
                          ? 'bg-sky-950/40 border-sky-400 shadow-md shadow-sky-500/20 scale-105'
                          : isCurrent
                          ? 'bg-[#0A0E17] border-sky-800/80'
                          : 'bg-[#0A0E17]/50 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          Hop {hop.hop_number}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase ${getActionColor(hop.action)}`}>
                          {hop.action}
                        </span>
                      </div>

                      <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span>{hop.device_name}</span>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 mt-1 flex justify-between">
                        <span>{hop.interface_in || 'LAN'} &rarr; {hop.interface_out || 'Host'}</span>
                        <span className="text-sky-400">{hop.latency_ms}ms</span>
                      </div>

                      <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 leading-tight">
                        {hop.details}
                      </p>
                    </div>

                    {idx < activeFlow.hops.length - 1 && (
                      <div className="flex items-center text-slate-600 shrink-0">
                        <div className={`w-5 h-0.5 ${idx < activeHopIndex ? 'bg-sky-400' : 'bg-slate-700'}`} />
                        <ArrowRight className={`w-3.5 h-3.5 -ml-1 ${idx < activeHopIndex ? 'text-sky-400' : 'text-slate-700'}`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
