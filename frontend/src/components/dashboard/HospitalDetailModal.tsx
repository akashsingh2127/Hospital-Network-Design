import React from 'react';
import { X, Building2, Server, Layers, Network, ShieldCheck, ArrowRight } from 'lucide-react';
import { Hospital } from '../../types/network';
import { Badge } from '../common/Badge';
import { SourceBadge } from '../common/SourceBadge';

interface HospitalDetailModalProps {
  hospital: Hospital | null;
  onClose: () => void;
  onSelectDevice?: (deviceId: string) => void;
}

export const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({
  hospital,
  onClose,
  onSelectDevice,
}) => {
  if (!hospital) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1E293B] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#1E293B] flex items-center justify-between bg-[#0E1524]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-950/60 border border-sky-800/80 text-sky-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">{hospital.name}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {hospital.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{hospital.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Routing & Architecture Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0A0E17] p-4 rounded-lg border border-[#1E293B]">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Network Block</span>
              <p className="text-xs font-mono font-bold text-sky-400 mt-1">{hospital.network_block}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">WAN Link (ISP)</span>
              <p className="text-xs font-mono font-bold text-slate-200 mt-1">{hospital.wan_ip}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Router Pair</span>
              <p className="text-xs font-mono font-bold text-slate-200 mt-1">
                {hospital.edge_router} &bull; {hospital.core_router}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Status & Source</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="status" status={hospital.status}>
                  {hospital.status}
                </Badge>
                <SourceBadge source={hospital.source} compact />
              </div>
            </div>
          </div>

          {/* Department VLAN Segmentation Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Department VLAN Segmentation ({hospital.vlans?.length || hospital.vlan_count})
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">Router-on-a-Stick (802.1Q)</span>
            </div>

            <div className="border border-[#1E293B] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0E1524] text-slate-400 font-mono text-[11px] border-b border-[#1E293B]">
                  <tr>
                    <th className="py-2.5 px-3">VLAN ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Subnet</th>
                    <th className="py-2.5 px-3">Gateway</th>
                    <th className="py-2.5 px-3 text-right">Hosts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] font-mono">
                  {hospital.vlans && hospital.vlans.length > 0 ? (
                    hospital.vlans.map((v) => (
                      <tr key={v.vlan_id} className="hover:bg-[#162238]/60 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-cyan-400">VLAN {v.vlan_id}</td>
                        <td className="py-2.5 px-3 text-slate-200">{v.name}</td>
                        <td className="py-2.5 px-3 text-slate-400">{v.subnet}{v.prefix}</td>
                        <td className="py-2.5 px-3 text-slate-300">{v.gateway}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{v.usable_hosts}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No individual VLAN details available for this location.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assigned Devices */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              Verified Hardware & Role Allocation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {hospital.devices && hospital.devices.length > 0 ? (
                hospital.devices.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onClose();
                      onSelectDevice?.(d.id);
                    }}
                    className="p-3 bg-[#0A0E17] hover:bg-[#162238] border border-[#1E293B] hover:border-sky-500/40 rounded-lg flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-200 group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        {d.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {d.role} &bull; {d.ip_address}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="status" status={d.status}>
                        {d.status}
                      </Badge>
                      <span className="text-[10px] text-sky-400 font-sans group-hover:underline">&rarr;</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-3 text-center text-xs text-slate-400 bg-[#0A0E17] rounded border border-[#1E293B]">
                  Standard Edge ({hospital.edge_router}) and Core ({hospital.core_router}) routers configured with local Access Switch.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#1E293B] bg-[#0E1524] flex items-center justify-between text-xs text-slate-400">
          <span>EIGRP Autonomous System 100 &bull; NAT Overload Configured</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
