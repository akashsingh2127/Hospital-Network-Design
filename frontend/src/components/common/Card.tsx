import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
}) => {
  return (
    <div className={`bg-[#111827] border border-[#1E293B] rounded-lg shadow-sm flex flex-col ${className}`}>
      {(title || headerAction) && (
        <div className="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-100 tracking-wide">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-5 flex-1">{children}</div>
    </div>
  );
};
