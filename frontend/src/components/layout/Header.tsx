import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database
} from 'lucide-react';
import { IntegrationStatus, DataSource } from '../../types/network';
import { SourceBadge } from '../common/SourceBadge';

interface HeaderProps {
  title?: string;
  integration?: IntegrationStatus;
  dataSource: DataSource;
  lastRefresh?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  wsStatus?: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Hospital Network Operations Center',
  integration,
  dataSource,
  lastRefresh,
  isRefreshing,
  onRefresh,
  wsStatus = 'CONNECTED',
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getIntegrationBadge = () => {
    if (!integration) return null;

    if (integration.overall_integration_state === 'CONNECTED') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 text-xs font-mono font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>PT: CONNECTED</span>
        </div>
      );
    } else if (integration.overall_integration_state === 'PARTIAL') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/70 border border-amber-800/80 text-amber-400 text-xs font-mono font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>PT: PROCESS DETECTED</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/70 border border-rose-800/80 text-rose-400 text-xs font-mono font-medium">
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>PT: ISOLATED / PROBING</span>
        </div>
      );
    }
  };

  return (
    <header className="h-16 px-6 border-b border-[#1E293B] bg-[#0E1524] flex items-center justify-between sticky top-0 z-30">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-slate-400">
          Main HQ &bull; Diagnostic &bull; Emergency &bull; Telemedicine &bull; Maternity &bull; Children Care
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-[#111827] px-3 py-1.5 rounded border border-[#1E293B]">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime || 'Synchronizing...'}</span>
        </div>

        {/* WebSocket Live Sync Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111827] border border-[#1E293B] text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${
            wsStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' :
            wsStatus === 'CONNECTING' ? 'bg-amber-400 animate-ping' :
            'bg-rose-500'
          }`} />
          <span className="text-slate-300">
            {wsStatus === 'CONNECTED' ? 'LIVE SYNC' : wsStatus === 'CONNECTING' ? 'RECONNECTING' : 'OFFLINE'}
          </span>
        </div>

        {/* Integration Status Badge */}
        {getIntegrationBadge()}

        {/* Data Source Badge */}
        <div className="flex items-center gap-1.5 bg-[#111827] px-2.5 py-1 rounded border border-[#1E293B]">
          <span className="text-[11px] text-slate-400 font-mono">Source:</span>
          <SourceBadge source={dataSource} />
        </div>

        {/* Last Refresh & Manual Action */}
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
              Refreshed: {new Date(lastRefresh).toLocaleTimeString()}
            </span>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Perform fresh network & integration inspection"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900/50 text-white rounded text-xs font-medium shadow-sm transition-all border border-sky-400/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Probing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
