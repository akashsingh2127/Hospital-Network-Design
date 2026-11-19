import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  Network,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Vlan } from '../../types/network';
import { SourceBadge } from '../common/SourceBadge';

interface VlanIpSectionProps {
  vlans: Vlan[];
  selectedHospitalId?: string | null;
  onSelectHospital?: (hospitalId: string) => void;
}

export const VlanIpSection: React.FC<VlanIpSectionProps> = ({
  vlans,
  selectedHospitalId,
  onSelectHospital
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState<string>(selectedHospitalId || 'ALL');

  React.useEffect(() => {
    if (selectedHospitalId) {
      setHospitalFilter(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  const filteredVlans = useMemo(() => {
    return vlans.filter((v) => {
      if (hospitalFilter !== 'ALL' && v.hospital_id !== hospitalFilter) {
        return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesSubnet = v.subnet.toLowerCase().includes(q);
        const matchesGw = v.gateway.toLowerCase().includes(q);
        const matchesId = String(v.vlan_id).includes(q);
        const matchesDesc = (v.description || '').toLowerCase().includes(q);
        return matchesName || matchesSubnet || matchesGw || matchesId || matchesDesc;
      }
      return true;
    });
  }, [vlans, hospitalFilter, searchTerm]);

  const totalUsableHosts = useMemo(() => {
    return filteredVlans.reduce((acc, v) => acc + (v.usable_hosts || 0), 0);
  }, [filteredVlans]);

  return (
    <section id="vlans" className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              VLAN Segmentation & IP Addressing
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              {filteredVlans.length} / 19 VLANs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            VLSM-based IP address schemes, subnets, gateways, and departmental segmentation across all 6 hospital locations.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1 rounded-lg bg-[#111827] border border-[#1E293B] text-slate-300">
            <span className="text-slate-400">Total Capacity: </span>
            <span className="font-bold text-cyan-400">{totalUsableHosts.toLocaleString()} Usable Hosts</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#111827] p-3 rounded-xl border border-[#1E293B]">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search VLAN ID, name, subnet, gateway, purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A0E17] border border-[#1E293B] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Hospital Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono shrink-0">Filter Location:</label>
          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="w-full bg-[#0A0E17] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Hospital Locations (19 VLANs)</option>
            <option value="hq">HQ - Main Hospital (4 VLANs)</option>
            <option value="diag">Diagnostic Center (3 VLANs)</option>
            <option value="emer">Emergency Clinic (3 VLANs)</option>
            <option value="tele">Telemedicine Branch (3 VLANs)</option>
            <option value="mat">Maternity Hospital (3 VLANs)</option>
            <option value="child">Children Care Hospital (3 VLANs)</option>
          </select>
        </div>
      </div>

      {/* VLANs Table */}
      <div className="rounded-xl border border-[#1E293B] bg-[#0E1524] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] border-b border-[#1E293B] font-mono text-slate-400 text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">VLAN ID</th>
                <th className="py-2.5 px-4 font-semibold">Department / Name</th>
                <th className="py-2.5 px-4 font-semibold">Hospital Location</th>
                <th className="py-2.5 px-4 font-semibold">Subnet / Mask</th>
                <th className="py-2.5 px-4 font-semibold">Default Gateway</th>
                <th className="py-2.5 px-4 font-semibold">Usable Hosts</th>
                <th className="py-2.5 px-4 font-semibold">Purpose / Description</th>
                <th className="py-2.5 px-4 font-semibold text-right">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] font-mono">
              {filteredVlans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                    No VLANs found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVlans.map((v) => (
                  <tr
                    key={`${v.hospital_id}-${v.vlan_id}`}
                    className="hover:bg-[#162238]/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-cyan-400">
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-[11px]">
                        VLAN {v.vlan_id}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-sans font-semibold text-slate-100">
                      {v.name}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectHospital?.(v.hospital_id)}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-sky-400 border border-slate-700 text-[10px] font-mono transition-colors"
                      >
                        {v.hospital_id.toUpperCase()}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-slate-200 font-semibold">
                      {v.subnet} <span className="text-slate-400">/{v.prefix}</span>
                    </td>

                    <td className="py-3 px-4 text-emerald-400 font-semibold">
                      {v.gateway}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-semibold text-slate-100">{v.usable_hosts}</span> hosts
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-sans text-[11px] max-w-xs truncate">
                      {v.description || 'Departmental segmentation'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <SourceBadge source={v.source} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
