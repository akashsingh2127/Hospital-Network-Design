import React, { useState, useMemo } from 'react';
import {
  Server,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { Device, StatusLevel } from '../../types/network';
import { SourceBadge } from '../common/SourceBadge';

interface DeviceMonitoringSectionProps {
  devices: Device[];
  selectedHospitalId?: string | null;
  initialStatusFilter?: string | null;
  onSelectDevice: (deviceId: string) => void;
}

export const DeviceMonitoringSection: React.FC<DeviceMonitoringSectionProps> = ({
  devices,
  selectedHospitalId,
  initialStatusFilter,
  onSelectDevice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [hospitalFilter, setHospitalFilter] = useState<string>(selectedHospitalId || 'ALL');

  // React to prop updates
  React.useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  React.useEffect(() => {
    if (selectedHospitalId) {
      setHospitalFilter(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      // Hospital filter
      if (hospitalFilter !== 'ALL' && d.hospital_id !== hospitalFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ONLINE' && d.status !== 'ONLINE' && d.status !== 'OPERATIONAL') return false;
        if (statusFilter === 'OFFLINE' && d.status !== 'OFFLINE') return false;
        if (statusFilter === 'UNVERIFIED' && d.status !== 'UNVERIFIED' && d.status !== 'UNKNOWN') return false;
      }

      // Type filter
      if (typeFilter !== 'ALL' && d.device_type !== typeFilter) {
        return false;
      }

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesHost = (d.hostname || '').toLowerCase().includes(q);
        const matchesIp = d.ip_address.toLowerCase().includes(q);
        const matchesRole = (d.role || '').toLowerCase().includes(q);
        return matchesName || matchesHost || matchesIp || matchesRole;
      }

      return true;
    });
  }, [devices, hospitalFilter, statusFilter, typeFilter, searchTerm]);

  const statusCounts = useMemo(() => {
    const total = devices.length;
    const online = devices.filter((d) => d.status === 'ONLINE' || d.status === 'OPERATIONAL').length;
    const unverified = devices.filter((d) => d.status === 'UNVERIFIED' || d.status === 'UNKNOWN').length;
    const offline = devices.filter((d) => d.status === 'OFFLINE').length;
    return { total, online, unverified, offline };
  }, [devices]);

  return (
    <section id="devices" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              Device Monitoring & Inventory
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
              {filteredDevices.length} / {devices.length} Devices
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time verified status and configuration for all hospital routers, switches, and server endpoints.
          </p>
        </div>

        {/* Quick Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0D131F] p-1 rounded-lg border border-[#1E293B] text-xs font-mono">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-sky-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({statusCounts.total})
          </button>
          <button
            onClick={() => setStatusFilter('ONLINE')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              statusFilter === 'ONLINE'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Online ({statusCounts.online})
          </button>
          <button
            onClick={() => setStatusFilter('UNVERIFIED')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              statusFilter === 'UNVERIFIED'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Unverified ({statusCounts.unverified})
          </button>
          <button
            onClick={() => setStatusFilter('OFFLINE')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              statusFilter === 'OFFLINE'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Offline ({statusCounts.offline})
          </button>
        </div>
      </div>

      {/* Controls Bar: Search + Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#111827] p-3 rounded-xl border border-[#1E293B]">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, hostname, IP, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A0E17] border border-[#1E293B] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Hospital Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono shrink-0">Hospital:</label>
          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="w-full bg-[#0A0E17] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="ALL">All Hospital Locations</option>
            <option value="hq">HQ - Main Hospital</option>
            <option value="diag">Diagnostic Center</option>
            <option value="emer">Emergency Clinic</option>
            <option value="tele">Telemedicine Branch</option>
            <option value="mat">Maternity Hospital</option>
            <option value="child">Children Care Hospital</option>
            <option value="isp">ISP Backbone</option>
          </select>
        </div>

        {/* Device Type Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono shrink-0">Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-[#0A0E17] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="ALL">All Device Types</option>
            <option value="ROUTER">Routers (Edge & Core)</option>
            <option value="SWITCH">Switches (Distribution & Access)</option>
            <option value="SERVER">DMZ Servers</option>
            <option value="AP">Access Points</option>
          </select>
        </div>
      </div>

      {/* Devices Inventory Table */}
      <div className="rounded-xl border border-[#1E293B] bg-[#0E1524] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] border-b border-[#1E293B] font-mono text-slate-400 text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Device / Hostname</th>
                <th className="py-2.5 px-4 font-semibold">Location</th>
                <th className="py-2.5 px-4 font-semibold">Type</th>
                <th className="py-2.5 px-4 font-semibold">Primary IP</th>
                <th className="py-2.5 px-4 font-semibold">Routing / Role</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold">Source</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] font-mono">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                    No devices match the active search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => onSelectDevice(d.id)}
                    className="hover:bg-[#162238]/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        <span>{d.name}</span>
                      </div>
                      {d.hostname && (
                        <span className="text-[10px] text-slate-400 block font-mono pl-4">
                          {d.hostname}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
                        {d.hospital_id.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-sans">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        d.device_type === 'ROUTER' ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800' :
                        d.device_type === 'SWITCH' ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800' :
                        'bg-purple-950/70 text-purple-300 border border-purple-800'
                      }`}>
                        {d.device_type}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {d.ip_address}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">
                      <div>{d.role || 'Hospital Gateway'}</div>
                      {d.routing_protocol && (
                        <span className="text-[10px] font-mono text-emerald-400">
                          {d.routing_protocol}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        d.status === 'ONLINE' || d.status === 'OPERATIONAL'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : d.status === 'OFFLINE'
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          d.status === 'ONLINE' || d.status === 'OPERATIONAL' ? 'bg-emerald-400' :
                          d.status === 'OFFLINE' ? 'bg-rose-400' : 'bg-amber-400'
                        }`} />
                        {d.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <SourceBadge source={d.source} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDevice(d.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#162238] hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/30 text-[11px] font-medium transition-colors font-sans"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
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
