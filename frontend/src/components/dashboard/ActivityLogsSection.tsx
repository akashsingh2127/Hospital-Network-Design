import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Activity,
  AlertTriangle,
  Info,
  Clock,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { EventLog, EventFilterParams } from '../../types/network';
import { api } from '../../services/api';
import { SourceBadge } from '../common/SourceBadge';

interface ActivityLogsSectionProps {
  liveEvents?: EventLog[];
  onSelectEvent: (eventId: string) => void;
  onSelectDevice?: (deviceId: string) => void;
}

export const ActivityLogsSection: React.FC<ActivityLogsSectionProps> = ({
  liveEvents = [],
  onSelectEvent,
  onSelectDevice
}) => {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [hospitalFilter, setHospitalFilter] = useState<string>('ALL');

  const fetchEvents = () => {
    setLoading(true);
    const params: EventFilterParams = {
      category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      severity: severityFilter !== 'ALL' ? severityFilter : undefined,
      hospital_id: hospitalFilter !== 'ALL' ? hospitalFilter : undefined,
      search: searchTerm.trim() || undefined,
      limit: 100
    };

    api.getEvents(params)
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load events', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, severityFilter, hospitalFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Prepend live events that arrive over WebSocket
  useEffect(() => {
    if (liveEvents.length > 0) {
      setEvents((prev) => {
        const existingIds = new Set(prev.map((e) => e.event_id));
        const newOnes = liveEvents.filter((e) => !existingIds.has(e.event_id));
        return [...newOnes, ...prev];
      });
    }
  }, [liveEvents]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((ev) => {
      counts[ev.category] = (counts[ev.category] || 0) + 1;
    });
    return counts;
  }, [events]);

  return (
    <section id="logs" className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Activity Logs & Event Stream
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              {events.length} Events Recorded
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured forensic log of Packet Tracer topology detections, file alterations, interface transitions, and health probes.
          </p>
        </div>

        <button
          onClick={fetchEvents}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#162238] border border-[#1E293B] text-slate-300 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#111827] p-3 rounded-xl border border-[#1E293B]">
        {/* Search Input */}
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, IDs, devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A0E17] border border-[#1E293B] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono shrink-0">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#0A0E17] border border-[#1E293B] rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="ALL">All Categories</option>
            <option value="CONNECTIVITY">Connectivity</option>
            <option value="ROUTING">Routing</option>
            <option value="CONFIGURATION">Configuration</option>
            <option value="DEVICE">Device</option>
            <option value="INTERFACE">Interface</option>
            <option value="INTEGRATION">Integration</option>
            <option value="NETWORK_SERVICE">Network Service</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono shrink-0">Severity:</label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-[#0A0E17] border border-[#1E293B] rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </div>

        {/* Hospital Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono shrink-0">Location:</label>
          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="w-full bg-[#0A0E17] border border-[#1E293B] rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="ALL">All Locations</option>
            <option value="hq">HQ - Main Hospital</option>
            <option value="diag">Diagnostic Center</option>
            <option value="emer">Emergency Clinic</option>
            <option value="tele">Telemedicine Branch</option>
            <option value="mat">Maternity Hospital</option>
            <option value="child">Children Care</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-xl border border-[#1E293B] bg-[#0E1524] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] border-b border-[#1E293B] font-mono text-slate-400 text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                <th className="py-2.5 px-4 font-semibold">Severity</th>
                <th className="py-2.5 px-4 font-semibold">Event Type / ID</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">Affected Target</th>
                <th className="py-2.5 px-4 font-semibold">Detection / Method</th>
                <th className="py-2.5 px-4 font-semibold">Description</th>
                <th className="py-2.5 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] font-mono">
              {loading && events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    Loading activity logs...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                    No activity logs recorded matching current criteria.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr
                    key={ev.id || ev.event_id}
                    onClick={() => onSelectEvent(ev.event_id)}
                    className="hover:bg-[#162238]/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ev.severity === 'CRITICAL' ? 'bg-rose-950/80 text-rose-400 border border-rose-800' :
                        ev.severity === 'WARNING' ? 'bg-amber-950/80 text-amber-400 border border-amber-800' :
                        'bg-sky-950/80 text-sky-400 border border-sky-800'
                      }`}>
                        {ev.severity}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors font-sans">
                        {ev.event_type}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {ev.event_id}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700 text-[10px]">
                        {ev.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {ev.affected_device_id ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDevice?.(ev.affected_device_id!);
                          }}
                          className="font-semibold text-sky-400 hover:underline"
                        >
                          {ev.affected_device_id}
                        </button>
                      ) : ev.hospital_id ? (
                        <span className="text-slate-300">{ev.hospital_id.toUpperCase()}</span>
                      ) : (
                        <span className="text-slate-400 italic">Backbone</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      <div>{ev.detection_method}</div>
                      <span className="text-[10px] text-emerald-400">{ev.verification_status}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-sans text-xs max-w-md truncate">
                      {ev.description}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev.event_id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#162238] hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[11px] font-medium transition-colors font-sans"
                      >
                        <span>View</span>
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
