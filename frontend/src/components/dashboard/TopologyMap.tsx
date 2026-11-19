import React, { useState, useMemo } from 'react';
import {
  GitFork,
  Server,
  Layers,
  Globe,
  Radio,
  ExternalLink,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Network,
  Zap,
  ArrowRight
} from 'lucide-react';
import { TopologyData, DataSource, StatusLevel, SimulationFlow } from '../../types/network';
import { SourceBadge } from '../common/SourceBadge';

interface TopologyMapProps {
  topology: TopologyData;
  activeFlow?: SimulationFlow | null;
  onSelectDevice?: (deviceId: string) => void;
}

export const TopologyMap: React.FC<TopologyMapProps> = ({
  topology,
  activeFlow,
  onSelectDevice,
}) => {
  const [selectedHospital, setSelectedHospital] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'hierarchy' | 'nodes'>('hierarchy');

  // Dynamically extract hospital groups from topology.nodes (NO HARDCODING)
  const hospitalGroups = useMemo(() => {
    const groups: Record<string, { id: string; name: string; code: string; nodes: any[] }> = {};

    topology.nodes.forEach((node) => {
      const hosp = node.hospital_id || (node.node_type === 'ISP' ? 'isp' : 'core');
      if (!groups[hosp]) {
        let name = 'Backbone Network';
        let code = 'CORE-ISP';
        if (hosp === 'hq') { name = 'Main Hospital HQ'; code = 'HQ-MAIN'; }
        else if (hosp === 'diag') { name = 'Diagnostic Center'; code = 'BR-DIAG'; }
        else if (hosp === 'emer') { name = 'Emergency Clinic'; code = 'BR-EMER'; }
        else if (hosp === 'tele') { name = 'Telemedicine Branch'; code = 'BR-TELE'; }
        else if (hosp === 'mat') { name = 'Maternity Hospital'; code = 'BR-MAT'; }
        else if (hosp === 'child') { name = 'Children Care Hospital'; code = 'BR-CHILD'; }

        groups[hosp] = { id: hosp, name, code, nodes: [] };
      }
      groups[hosp].nodes.push(node);
    });

    return groups;
  }, [topology.nodes]);

  // Find active nodes in simulation path
  const activePathNodes = useMemo(() => {
    if (!activeFlow || !activeFlow.path_node_ids) return new Set<string>();
    return new Set(activeFlow.path_node_ids);
  }, [activeFlow]);

  // Filter hospital branch cards
  const filteredHospitals = useMemo(() => {
    const branchKeys = ['hq', 'diag', 'emer', 'tele', 'mat', 'child'];
    if (selectedHospital === 'all') {
      return branchKeys.map((k) => hospitalGroups[k]).filter(Boolean);
    }
    return [hospitalGroups[selectedHospital]].filter(Boolean);
  }, [hospitalGroups, selectedHospital]);

  const ispNodes = hospitalGroups['isp']?.nodes || [];

  return (
    <div id="topology" className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E293B] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <GitFork className="w-4 h-4 text-sky-400" />
              Dynamic Network Topology & Data Path Visualizer
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
              {topology.total_nodes} Verified Nodes &bull; {topology.total_edges} Physical Links
            </span>
            {activeFlow && (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5 animate-pulse">
                <Zap className="w-3 h-3 text-emerald-400" />
                Active Flow: {activeFlow.source_device_name} &rarr; {activeFlow.dest_device_name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any router, switch, or server node to inspect its live physical interfaces and packet routing state.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#0A0E17] border border-[#1E293B] rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'hierarchy'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hierarchical Architecture
            </button>
            <button
              onClick={() => setViewMode('nodes')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'nodes'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Dynamic Nodes ({topology.nodes.length})
            </button>
          </div>

          <SourceBadge source={topology.source} />
        </div>
      </div>

      {/* Hospital Filter Pills */}
      {viewMode === 'hierarchy' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          <button
            onClick={() => setSelectedHospital('all')}
            className={`px-3 py-1 rounded-lg border transition-colors whitespace-nowrap ${
              selectedHospital === 'all'
                ? 'bg-sky-600 text-white border-sky-500 font-semibold'
                : 'bg-[#0A0E17] text-slate-400 border-[#1E293B] hover:text-slate-200'
            }`}
          >
            All Hospital Sites (6)
          </button>
          {['hq', 'diag', 'emer', 'tele', 'mat', 'child'].map((k) => {
            const h = hospitalGroups[k];
            if (!h) return null;
            return (
              <button
                key={k}
                onClick={() => setSelectedHospital(k)}
                className={`px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                  selectedHospital === k
                    ? 'bg-sky-600 text-white border-sky-500 font-semibold'
                    : 'bg-[#0A0E17] text-slate-400 border-[#1E293B] hover:text-slate-200'
                }`}
              >
                {h.code} ({h.name})
              </button>
            );
          })}
        </div>
      )}

      {/* View 1: Hierarchical Packet Tracer Topology */}
      {viewMode === 'hierarchy' ? (
        <div className="pt-2 space-y-6">
          {/* Tier 1: ISP WAN Core (Dynamic ISP Nodes) */}
          <div className="flex flex-col items-center">
            {ispNodes.map((node) => {
              const isPathActive = activePathNodes.has(node.device_id || node.id);

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    if (node.device_id) onSelectDevice?.(node.device_id);
                  }}
                  role="button"
                  tabIndex={0}
                  className={`w-full max-w-md p-3.5 rounded-xl text-center shadow-lg cursor-pointer transition-all mb-2 ${
                    isPathActive
                      ? 'bg-sky-950/70 border-2 border-emerald-400 shadow-emerald-500/30 scale-105 animate-pulse'
                      : 'bg-[#0A0E17] hover:bg-[#162238] border-2 border-blue-500/50 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 text-xs font-bold font-mono text-blue-400">
                    <Globe className="w-4 h-4" />
                    <span>{node.label}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                      {node.status}
                    </span>
                    {isPathActive && (
                      <span className="text-[10px] bg-emerald-500 text-black font-bold px-1.5 rounded">
                        DATA IN TRANSIT
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    IP: {node.ip || '200.1.1.1/24'} &bull; Click to inspect interfaces &rarr;
                  </div>
                </div>
              );
            })}

            {/* Operational Trunk Link Indicator */}
            <div className="flex flex-col items-center my-1">
              <div className="w-0.5 h-4 bg-emerald-500/80"></div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                802.1Q WAN Trunk Link (EIGRP AS 100)
              </span>
              <div className="w-0.5 h-4 bg-emerald-500/80"></div>
            </div>
          </div>

          {/* Tier 2: Dynamic Hospital Sites Grid */}
          <div
            className={`grid gap-4 ${
              selectedHospital === 'all'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 max-w-2xl mx-auto'
            }`}
          >
            {filteredHospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="bg-[#0A0E17] border border-[#1E293B] hover:border-sky-500/30 rounded-xl p-4 flex flex-col justify-between transition-colors shadow-sm space-y-3"
              >
                {/* Site Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
                  <span className="font-bold text-xs text-slate-100">{hosp.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                    {hosp.code}
                  </span>
                </div>

                {/* Nodes inside this hospital */}
                <div className="space-y-2">
                  {hosp.nodes.map((node: any) => {
                    const isNodeActive = activePathNodes.has(node.device_id || node.id);

                    return (
                      <div
                        key={node.id}
                        onClick={() => {
                          if (node.device_id) onSelectDevice?.(node.device_id);
                        }}
                        role="button"
                        tabIndex={0}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isNodeActive
                            ? 'bg-emerald-950/40 border-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.02]'
                            : 'bg-[#111827] hover:bg-[#162238] border-[#1E293B] hover:border-sky-500/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className={`font-bold flex items-center gap-1.5 ${
                            node.node_type === 'EDGE_ROUTER' ? 'text-sky-400' :
                            node.node_type === 'CORE_ROUTER' ? 'text-cyan-400' :
                            node.node_type === 'SWITCH' ? 'text-emerald-400' :
                            'text-purple-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isNodeActive ? 'bg-emerald-400 animate-ping' : 'bg-sky-400'}`} />
                            {node.label}
                          </span>
                          <span className={`text-[9px] px-1 py-0.2 rounded border font-mono ${
                            isNodeActive
                              ? 'bg-emerald-500 text-black font-bold border-emerald-400'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {isNodeActive ? 'FORWARDING' : node.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono mt-1 flex justify-between">
                          <span>IP: {node.ip || 'L2 Switch'}</span>
                          <span className="text-slate-400 hover:text-sky-400 text-[10px] font-sans">Inspect &rarr;</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* View 2: All Dynamic Graph Nodes Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          {topology.nodes.map((node) => {
            const isNodeActive = activePathNodes.has(node.device_id || node.id);

            return (
              <div
                key={node.id}
                onClick={() => {
                  if (node.device_id) onSelectDevice?.(node.device_id);
                }}
                role="button"
                tabIndex={0}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isNodeActive
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105'
                    : 'bg-[#0A0E17] hover:bg-[#162238] border-[#1E293B] hover:border-sky-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    node.node_type === 'ISP' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    node.node_type === 'EDGE_ROUTER' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                    node.node_type === 'CORE_ROUTER' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                    node.node_type === 'SWITCH' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {node.node_type}
                  </span>

                  {isNodeActive ? (
                    <span className="text-[9px] font-mono font-bold bg-emerald-500 text-black px-1.5 py-0.2 rounded animate-pulse">
                      ACTIVE HOP
                    </span>
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${
                      node.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`} />
                  )}
                </div>

                <h4 className="font-semibold text-xs text-slate-100 transition-colors">
                  {node.label}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  IP: {node.ip || 'L2 Trunk Port'}
                </p>

                <div className="mt-2 pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{node.hospital_id ? node.hospital_id.toUpperCase() : 'CORE'}</span>
                  <span className="text-sky-400 font-sans hover:underline">Inspect &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
