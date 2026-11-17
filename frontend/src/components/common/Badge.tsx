import React from 'react';
import { StatusLevel, SeverityLevel } from '../../types/network';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'status' | 'severity' | 'neutral';
  status?: StatusLevel;
  severity?: SeverityLevel;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  status,
  severity,
  size = 'sm'
}) => {
  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (variant === 'status' && status) {
    switch (status) {
      case 'OPERATIONAL':
      case 'ONLINE':
        colorClasses = 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60';
        break;
      case 'DEGRADED':
        colorClasses = 'bg-amber-950/70 text-amber-400 border-amber-800/60';
        break;
      case 'OFFLINE':
        colorClasses = 'bg-rose-950/70 text-rose-400 border-rose-800/60';
        break;
      case 'UNVERIFIED':
      case 'UNKNOWN':
      default:
        colorClasses = 'bg-slate-800/80 text-slate-400 border-slate-700/60';
        break;
    }
  } else if (variant === 'severity' && severity) {
    switch (severity) {
      case 'CRITICAL':
        colorClasses = 'bg-red-950/80 text-red-400 border-red-800';
        break;
      case 'WARNING':
        colorClasses = 'bg-amber-950/80 text-amber-400 border-amber-800';
        break;
      case 'INFO':
      default:
        colorClasses = 'bg-blue-950/80 text-blue-400 border-blue-800';
        break;
    }
  }

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-mono font-medium rounded border ${sizeClasses} ${colorClasses}`}>
      {children}
    </span>
  );
};
