import React from 'react';
import { DataSource } from '../../types/network';

interface SourceBadgeProps {
  source: DataSource;
  compact?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, compact = false }) => {
  let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';
  let label: string = source;

  switch (source) {
    case 'PACKET_TRACER':
      badgeStyle = 'bg-sky-950/70 text-sky-300 border-sky-800/60';
      label = compact ? 'PT' : 'PACKET_TRACER';
      break;
    case 'BACKEND_PROBE':
      badgeStyle = 'bg-purple-950/70 text-purple-300 border-purple-800/60';
      label = compact ? 'PROBE' : 'BACKEND_PROBE';
      break;
    case 'SIMULATED':
      badgeStyle = 'bg-amber-950/70 text-amber-300 border-amber-800/60';
      label = compact ? 'SIM' : 'SIMULATED';
      break;
  }

  return (
    <span
      title={`Data verified via: ${source}`}
      className={`inline-flex items-center gap-1 font-mono font-medium tracking-wide uppercase rounded border px-1.5 py-0.5 text-[10px] ${badgeStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {label}
    </span>
  );
};
