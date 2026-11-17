import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { api } from './services/api';
import { DashboardSummary, TopologyData } from './types/network';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topology, setTopology] = useState<TopologyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    try {
      if (isManualRefresh) {
        await api.refreshIntegration();
      }

      const [summaryData, topologyData] = await Promise.all([
        api.getDashboardSummary(),
        api.getTopology(),
      ]);

      setSummary(summaryData);
      setTopology(topologyData);
      setError(null);
      setLastRefresh(new Date().toISOString());
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err?.message || 'Failed to communicate with hospital network service.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  return (
    <div className="flex h-screen bg-[#0A0E17] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        integration={summary?.integration}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          integration={summary?.integration}
          dataSource={summary?.data_source || 'SIMULATED'}
          lastRefresh={lastRefresh}
          isRefreshing={isRefreshing}
          onRefresh={() => loadDashboardData(true)}
        />

        {/* Scrollable Dashboard Page Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <DashboardPage
            summary={summary}
            topology={topology}
            isLoading={isLoading}
            error={error}
            onRetry={() => {
              setIsLoading(true);
              loadDashboardData(true);
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
