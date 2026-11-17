import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'API Communication Error',
  message,
  onRetry,
}) => {
  return (
    <div className="bg-rose-950/40 border border-rose-900/60 rounded-lg p-4 flex items-start gap-3 my-4">
      <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
      <div className="flex-1 text-sm">
        <h4 className="font-semibold text-rose-200">{title}</h4>
        <p className="text-rose-300/80 mt-1 text-xs">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-800 text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};
