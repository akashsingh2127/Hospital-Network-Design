import React from 'react';
import { DashboardSummary, TopologyData } from '../types/network';
import { OverviewStats } from '../components/dashboard/OverviewStats';
import { HospitalCardsGrid } from '../components/dashboard/HospitalCardsGrid';
import { TopologyMap } from '../components/dashboard/TopologyMap';
import { NetworkHealthCard } from '../components/dashboard/NetworkHealthCard';
import { RecentAlertsCard } from '../components/dashboard/RecentAlertsCard';
import { NetworkServicesCard } from '../components/dashboard/NetworkServicesCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  topology: TopologyData | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  topology,
  isLoading,
  error,
  onRetry,
}) => {
  if (isLoading && !summary) {
    return <LoadingSpinner label="Connecting to SmartCare Hospital Backend & Probing Packet Tracer..." size="lg" />;
  }

  if (error && !summary) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorBanner
          title="Could not connect to backend server"
          message={`Error: ${error}. Ensure FastAPI backend is running on http://localhost:8000.`}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Network Overview Summary Cards */}
      <OverviewStats summary={summary} />

      {/* Hospital Locations Grid */}
      <HospitalCardsGrid hospitals={summary.hospitals} />

      {/* Network Topology Overview */}
      {topology ? (
        <TopologyMap topology={topology} />
      ) : (
        <div className="p-8 text-center bg-[#111827] border border-[#1E293B] rounded-lg text-slate-400 font-mono text-xs">
          Loading topology visual model...
        </div>
      )}

      {/* Two Column Grid: Network Health & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetworkHealthCard health={summary.health} integration={summary.integration} />
        <RecentAlertsCard alerts={summary.recent_alerts} />
      </div>

      {/* Central DMZ Services */}
      <NetworkServicesCard services={summary.services} />
    </div>
  );
};
