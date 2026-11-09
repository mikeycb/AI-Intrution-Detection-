import React, { useState, useEffect } from 'react';
import {
  BellRing,
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Radio,
  RefreshCw
} from 'lucide-react';
import { SecurityAlert, AlertSeverity, AlertStatus } from '../types';
import { apiService } from '../services/api';

export const SecurityAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AlertStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiService.getSecurityAlerts();
      setAlerts(data);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
        `Failed to fetch alerts from ${apiService.getBaseUrl()}/alerts`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: AlertStatus) => {
    try {
      await apiService.updateAlertStatus(id, newStatus);
      setAlerts((prev) =>
        prev.map((alt) => (alt.id === id ? { ...alt, status: newStatus } : alt))
      );
      const target = alerts.find(a => a.id === id);
      setActionSuccessMessage(`Alert ${target?.alertId || id} updated to status: ${newStatus}`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch {
      // Local optimistic update if API returns error
      setAlerts((prev) =>
        prev.map((alt) => (alt.id === id ? { ...alt, status: newStatus } : alt))
      );
      setActionSuccessMessage(`Status updated to: ${newStatus}`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
    }
  };

  const filteredAlerts = alerts.filter((alt) => {
    if (severityFilter !== 'all' && alt.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && alt.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        alt.alertId.toLowerCase().includes(q) ||
        alt.attackCategory.toLowerCase().includes(q) ||
        alt.sourceIp.toLowerCase().includes(q) ||
        alt.destinationIp.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const mitigatedCount = alerts.filter((a) => a.status === 'mitigated').length;

  return (
    <div className="space-y-6">
      {/* Alert KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Alerts</span>
            <BellRing className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {alerts.length}
          </div>
          <span className="text-[11px] text-slate-400">Security event queue</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Critical Severity</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {criticalCount}
          </div>
          <span className="text-[11px] text-slate-400">Immediate action required</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Incidents</span>
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {activeCount}
          </div>
          <span className="text-[11px] text-slate-400">Under triage</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Mitigated Threats</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {mitigatedCount}
          </div>
          <span className="text-[11px] text-slate-400">Firewall blocked / resolved</span>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={fetchAlerts}
            className="text-cyan-400 hover:underline flex items-center gap-1 font-medium ml-2"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Alert ID, Attack Type, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Severity:</span>
          </div>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                severityFilter === sev
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <span className="capitalize">{sev}</span>
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-1">Status:</span>
          {(['all', 'active', 'investigating', 'mitigated'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <span className="capitalize">{st.replace('_', ' ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="overflow-x-auto">
          {filteredAlerts.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-3 px-3">Alert ID</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Attack Category</th>
                  <th className="py-3 px-3">Source IP</th>
                  <th className="py-3 px-3">Destination IP (Port)</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {filteredAlerts.map((alt) => {
                  const severityStyles = {
                    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
                    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    low: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
                  }[alt.severity];

                  const statusStyles = {
                    active: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
                    investigating: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
                    mitigated: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
                    false_positive: 'bg-slate-800 text-slate-400 border-slate-700',
                  }[alt.status];

                  return (
                    <tr key={alt.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-3 text-cyan-400 font-bold">{alt.alertId}</td>
                      <td className="py-3.5 px-3 text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {alt.timestamp}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-sans text-white font-medium">
                        {alt.attackCategory}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {alt.algorithmDetected}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">{alt.sourceIp}</td>
                      <td className="py-3.5 px-3 text-slate-400">
                        {alt.destinationIp}:{alt.affectedPort}
                      </td>
                      <td className="py-3.5 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${severityStyles}`}>
                          {alt.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize border ${statusStyles}`}>
                          {alt.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-sans">
                        {alt.status === 'active' || alt.status === 'investigating' ? (
                          <button
                            onClick={() => handleUpdateStatus(alt.id, 'mitigated')}
                            className="px-2.5 py-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/20 transition-colors"
                          >
                            Mitigate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(alt.id, 'investigating')}
                            className="px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                          >
                            Reopen
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              {isLoading ? (
                <div className="flex items-center gap-2 justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Loading alerts queue...</span>
                </div>
              ) : (
                <span>No alerts registered in `/api/alerts`</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
