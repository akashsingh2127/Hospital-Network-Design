import React, { useEffect, useState } from 'react';
import {
  X,
  Activity,
  AlertTriangle,
  Info,
  Clock,
  ShieldAlert,
  Server,
  Layers,
  Code
} from 'lucide-react';
import { EventLog } from '../../types/network';
import { api } from '../../services/api';
import { SourceBadge } from '../common/SourceBadge';

interface EventDetailModalProps {
  eventId: string | null;
  onClose: () => void;
  onSelectDevice?: (deviceId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  eventId,
  onClose,
  onSelectDevice
}) => {
  const [event, setEvent] = useState<EventLog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    setError(null);

    api.getEventDetail(eventId)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load event details');
        setLoading(false);
      });
  }, [eventId]);

  if (!eventId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0E1524] border border-[#1E293B] rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              event?.severity === 'CRITICAL' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' :
              event?.severity === 'WARNING' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' :
              'bg-sky-500/10 border border-sky-500/30 text-sky-400'
            }`}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 tracking-tight">
                  {event?.event_type || 'Event Log'}
                </h3>
                {event && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    event.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    event.severity === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-sky-950 text-sky-400 border border-sky-800'
                  }`}>
                    {event.severity}
                  </span>
                )}
                {event && <SourceBadge source={event.source} />}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {eventId} &bull; Category: {event?.category}
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

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Loading event record...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
              <p className="font-semibold">Unable to fetch event details:</p>
              <p className="font-mono mt-1">{error}</p>
            </div>
          )}

          {event && !loading && (
            <>
              {/* Event Description Card */}
              <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B]">
                <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Description</span>
                <p className="text-sm text-slate-200 leading-relaxed">{event.description}</p>
              </div>

              {/* Key Attributes Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 uppercase">Detection Method</span>
                  <p className="font-semibold text-slate-200 mt-1">{event.detection_method}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 uppercase">Verification Status</span>
                  <p className="font-semibold text-slate-200 mt-1">{event.verification_status}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 uppercase">Affected Device</span>
                  {event.affected_device_id ? (
                    <button
                      onClick={() => onSelectDevice?.(event.affected_device_id!)}
                      className="font-semibold text-sky-400 hover:underline mt-1 block text-left"
                    >
                      {event.affected_device_id} &rarr;
                    </button>
                  ) : (
                    <p className="text-slate-400 mt-1 italic">Network Infrastructure</p>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 uppercase">Hospital Location</span>
                  <p className="font-semibold text-slate-200 mt-1">
                    {event.hospital_id ? event.hospital_id.toUpperCase() : 'ALL HOSPITALS'}
                  </p>
                </div>

                {event.interface_name && (
                  <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                    <span className="text-[10px] text-slate-400 uppercase">Interface</span>
                    <p className="font-semibold text-slate-200 mt-1">{event.interface_name}</p>
                  </div>
                )}

                {event.previous_state && event.new_state && (
                  <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                    <span className="text-[10px] text-slate-400 uppercase">State Transition</span>
                    <p className="font-semibold text-slate-200 mt-1">
                      <span className="text-rose-400">{event.previous_state}</span> &rarr; <span className="text-emerald-400">{event.new_state}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Recorded: {new Date(event.timestamp).toLocaleString()}</span>
              </div>

              {/* Structured Metadata JSON */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    <Code className="w-4 h-4 text-sky-400" />
                    Structured Event Metadata
                  </div>
                  <pre className="p-3 rounded-lg bg-[#0A0E17] border border-[#1E293B] text-[11px] font-mono text-sky-300 overflow-x-auto leading-relaxed">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1E293B] bg-[#111827] flex items-center justify-end">
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
