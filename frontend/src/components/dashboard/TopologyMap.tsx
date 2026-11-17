import React, { useState } from 'react';
import {
  GitFork,
  Server,
  Layers,
  ArrowDown,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { TopologyData, DataSource } from '../../types/network';
import { SourceBadge } from '../common/SourceBadge';

interface TopologyMapProps {
  topology: TopologyData;
}

export const TopologyMap: React.FC<TopologyMapProps> = ({ topology }) => {
  const [activeBranch, setActiveBranch] = useState<string>('all');

  const branches = [
    {
      id: 'hq',
      name: 'Main HQ',
      code: 'HQ-MAIN',
      edge: 'R1',
      edgeIp: '200.1.1.2/30',
      core: 'R2',
      coreIp: '10.255.0.2/30',
      p2p: '10.255.0.0/30',
      switch: 'HQ Access Switch',
      vlans: ['VLAN 10 (DMZ)', 'VLAN 20 (Doctors/ICU)', 'VLAN 30 (Billing)', 'VLAN 50 (Guest WiFi)'],
      special: 'Central DMZ (DNS, HTTP, FTP, Mail)',
    },
    {
      id: 'diag',
      name: 'Diagnostic Center',
      code: 'BR-DIAG',
      edge: 'R4',
      edgeIp: '200.1.1.6/30',
      core: 'R5',
      coreIp: '10.255.0.6/30',
      p2p: '10.255.0.4/30',
      switch: 'Diag Access Switch',
      vlans: ['VLAN 100 (Lab)', 'VLAN 110 (Admin)', 'VLAN 120 (Staff)'],
    },
    {
      id: 'emer',
      name: 'Emergency Clinic',
      code: 'BR-EMER',
      edge: 'R6',
      edgeIp: '200.1.1.10/30',
      core: 'R7',
      coreIp: '10.255.0.10/30',
      p2p: '10.255.0.8/30',
      switch: 'Emer Access Switch',
      vlans: ['VLAN 200 (Emergency)', 'VLAN 210 (Admin)', 'VLAN 220 (IP Phone)'],
    },
    {
      id: 'tele',
      name: 'Telemedicine',
      code: 'BR-TELE',
      edge: 'R9',
      edgeIp: '200.1.1.14/30',
      core: 'R10',
      coreIp: '10.255.0.14/30',
      p2p: '10.255.0.12/30',
      switch: 'Tele Access Switch',
      vlans: ['VLAN 300 (Consultation)', 'VLAN 310 (Admin)', 'VLAN 320 (WiFi)'],
    },
    {
      id: 'mat',
      name: 'Maternity',
      code: 'BR-MAT',
      edge: 'R11',
      edgeIp: '200.1.1.18/30',
      core: 'R12',
      coreIp: '10.255.0.18/30',
      p2p: '10.255.0.16/30',
      switch: 'Mat Access Switch',
      vlans: ['VLAN 400 (Maternity)', 'VLAN 410 (Admin)', 'VLAN 420 (WiFi)'],
    },
    {
      id: 'child',
      name: 'Children Care',
      code: 'BR-CHILD',
      edge: 'R13',
      edgeIp: '200.1.1.22/30',
      core: 'R14',
      coreIp: '10.255.0.22/30',
      p2p: '10.255.0.20/30',
      switch: 'Child Access Switch',
      vlans: ['VLAN 500 (Children)', 'VLAN 510 (Admin)', 'VLAN 520 (WiFi)'],
    },
  ];

  const filteredBranches =
    activeBranch === 'all'
      ? branches
      : branches.filter((b) => b.id === activeBranch);

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E293B] gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 tracking-wide flex items-center gap-2">
            <GitFork className="w-4 h-4 text-sky-400" />
            Verified Network Topology Architecture
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hierarchical Edge Router + Core Router Design &bull; EIGRP AS 100 &bull; Router-on-a-Stick Inter-VLAN
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SourceBadge source={topology.source} />
          <div className="flex items-center bg-[#0A0E17] border border-[#1E293B] rounded p-0.5 text-xs font-mono">
            <button
              onClick={() => setActiveBranch('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeBranch === 'all'
                  ? 'bg-sky-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Sites (6)
            </button>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBranch(b.id)}
                className={`hidden md:inline-block px-2 py-1 rounded transition-colors ${
                  activeBranch === b.id
                    ? 'bg-sky-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {b.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Hierarchical Diagram Container */}
      <div className="pt-6 space-y-6">
        {/* Tier 1: ISP WAN Core */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md bg-[#0A0E17] border border-blue-500/40 rounded-lg p-3 text-center shadow-lg relative">
            <div className="flex items-center justify-center gap-2 text-xs font-bold font-mono text-blue-400">
              <Globe className="w-4 h-4" />
              <span>SIMULATED INTERNET &bull; ISP ROUTER (R0)</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Gateway: 200.1.1.1/24 &bull; Gi0/0 Sub-interfaces (/30 per branch)
            </div>
          </div>

          <div className="w-0.5 h-6 bg-blue-500/50"></div>

          {/* Tier 2: ISP Access Switch */}
          <div className="w-full max-w-sm bg-[#0E1524] border border-slate-700 rounded-lg p-2.5 text-center shadow">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 font-mono">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>ISP Access Switch (802.1Q Trunk — 6 WAN VLANs)</span>
            </div>
          </div>

          <div className="w-0.5 h-6 bg-slate-700"></div>
        </div>

        {/* Tier 3: Hospital Locations (Edge -> Core -> Switch -> VLANs) */}
        <div
          className={`grid gap-4 ${
            activeBranch === 'all'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 max-w-2xl mx-auto'
          }`}
        >
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="bg-[#0A0E17] border border-[#1E293B] rounded-lg p-4 flex flex-col justify-between"
            >
              {/* Site Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B]">
                <span className="font-bold text-xs text-slate-100">{branch.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                  {branch.code}
                </span>
              </div>

              {/* Edge Router */}
              <div className="mt-3 p-2.5 rounded bg-[#111827] border border-sky-900/40">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-sky-400">{branch.edge} (Edge Router)</span>
                  <span className="text-[10px] text-slate-400">Public WAN + NAT/PAT</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  WAN IP: {branch.edgeIp}
                </div>
              </div>

              {/* Link: Edge <-> Core */}
              <div className="flex items-center justify-center py-1">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  P2P Link: {branch.p2p}
                </span>
              </div>

              {/* Core Router */}
              <div className="p-2.5 rounded bg-[#111827] border border-cyan-900/40">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-cyan-400">{branch.core} (Core Router)</span>
                  <span className="text-[10px] text-slate-400">Inter-VLAN / DHCP</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Core IP: {branch.coreIp}
                </div>
              </div>

              {/* Link: Core <-> Switch */}
              <div className="flex items-center justify-center py-1">
                <span className="text-[10px] font-mono text-slate-400">
                  &darr; 802.1Q RoAS Trunk &darr;
                </span>
              </div>

              {/* Access Switch & Segmented VLANs */}
              <div className="p-2.5 rounded bg-[#0E1524] border border-slate-800">
                <div className="text-xs font-mono font-semibold text-slate-300 mb-1.5">
                  {branch.switch}
                </div>
                <div className="flex flex-wrap gap-1">
                  {branch.vlans.map((v) => (
                    <span
                      key={v}
                      className="text-[10px] font-mono px-1.5 py-0.5 bg-[#162238] text-slate-300 rounded border border-slate-700/60"
                    >
                      {v}
                    </span>
                  ))}
                </div>

                {branch.special && (
                  <div className="mt-2 text-[10px] font-mono text-amber-400/90 pt-1.5 border-t border-slate-800 flex items-center gap-1">
                    <span>&bull;</span>
                    <span>{branch.special}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
