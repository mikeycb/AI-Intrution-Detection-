import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Target,
  ArrowUpRight,
  Upload,
  Cpu,
  Layers,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MetricCard } from '../components/common/MetricCard';
import {
  SystemStats,
  TrafficChartPoint,
  ProtocolDistributionPoint,
  SecurityAlert,
  ModelMetric
} from '../types';
import { apiService } from '../services/api';
import { NavTab } from '../components/layout/Sidebar';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficChartPoint[]>([]);
  const [protocols, setProtocols] = useState<ProtocolDistributionPoint[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);
  const [models, setModels] = useState<ModelMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);

    try {
      const [statsRes, trafficRes, protocolsRes, alertsRes, modelsRes] = await Promise.allSettled([
        apiService.getSystemStats(),
        apiService.getTrafficChartData(),
        apiService.getProtocolDistribution(),
        apiService.getSecurityAlerts(),
        apiService.getModelMetrics(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (trafficRes.status === 'fulfilled') setTrafficData(trafficRes.value);
      if (protocolsRes.status === 'fulfilled') setProtocols(protocolsRes.value);
      if (alertsRes.status === 'fulfilled') setRecentAlerts(alertsRes.value.slice(0, 4));
      if (modelsRes.status === 'fulfilled') setModels(modelsRes.value);
    } catch {
      // Backend not yet connected
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span>{stats?.currentEngine || 'Scikit-learn ML Classification Engines'}</span>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                Active Sensors: {stats?.activeSensors ?? 0}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-class intrusion detection using Random Forest, Decision Tree & SVM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('datasets')}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Upload Dataset</span>
          </button>
          <button
            onClick={() => onNavigate('detection')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-400/20"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Run Detection</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Packets Analyzed"
          value={stats?.totalAnalyzed ?? 0}
          subtext="Processed by feature vector extractor"
          icon={Activity}
          variant="cyan"
        />
        <MetricCard
          title="Normal Traffic"
          value={stats?.normalCount ?? 0}
          subtext="Verified legitimate enterprise packets"
          icon={ShieldCheck}
          variant="success"
        />
        <MetricCard
          title="Detected Intrusions"
          value={stats?.maliciousCount ?? 0}
          subtext="Flagged DoS, Probe & unauthorized payloads"
          icon={AlertTriangle}
          variant="danger"
        />
        <MetricCard
          title="Detection Rate"
          value={stats ? `${stats.detectionRate}%` : '0%'}
          subtext="True positive identification rate"
          icon={Target}
          variant="cyan"
        />
      </div>

      {/* Middle Section: Traffic Activity Timeline & Protocol Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Activity Timeline */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Network Traffic Flow Timeline</h2>
              <p className="text-xs text-slate-400">Normal vs detected malicious packet volume over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400"></span> Normal Flow
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Malicious Intrusions
              </span>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {trafficData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="maliciousGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="normal"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#normalGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="malicious"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#maliciousGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400 py-12">
                {isLoading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Loading traffic telemetry...</span>
                  </div>
                ) : (
                  <span>No traffic timeline streamed yet from FastAPI endpoint `/api/traffic-chart`</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Protocol Distribution & Model Overview */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-white">Protocol Composition</h2>
              <span className="text-[10px] text-slate-400 font-mono">L4 Distribution</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Packets categorized by transport protocol</p>

            <div className="h-40 flex items-center justify-center">
              {protocols.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={protocols}
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {protocols.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#38bdf8'} stroke="#0f172a" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-xs text-slate-400">
                  {isLoading ? 'Loading protocols...' : 'No protocol data available'}
                </div>
              )}
            </div>

            <div className="space-y-2 mt-2">
              {protocols.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || '#38bdf8' }} />
                    {item.name}
                  </span>
                  <span className="font-mono text-slate-200 font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigate('performance')}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors border border-cyan-500/20"
            >
              <span>View All 3 ML Models Comparison</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Classifiers & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ML Classifiers Status Grid */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Model Engine Status</h2>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Trained Scikit-learn pipelines ready for inference execution
          </p>

          <div className="space-y-3">
            {models.length > 0 ? (
              models.map((model) => (
                <div
                  key={model.id}
                  className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold text-white">{model.name}</span>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-cyan-400">
                      {model.accuracy}% Acc
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Latency: <strong className="text-slate-300 font-mono">{model.inferenceLatencyMs}ms</strong></span>
                    <span>F1-Score: <strong className="text-slate-300 font-mono">{model.f1Score}%</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">
                {isLoading ? 'Checking ML models...' : 'Connect Python backend to retrieve model status'}
              </div>
            )}
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Recent Security Alerts</h2>
              <p className="text-xs text-slate-400">High-confidence detections identified by active classifiers</p>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <span>View All Alerts</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentAlerts.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3 font-medium">Alert ID</th>
                    <th className="py-2.5 px-3 font-medium">Threat Category</th>
                    <th className="py-2.5 px-3 font-medium">Source IP</th>
                    <th className="py-2.5 px-3 font-medium">Severity</th>
                    <th className="py-2.5 px-3 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {recentAlerts.map((alt) => {
                    const severityBadge = {
                      critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                      high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                      medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                    }[alt.severity];

                    return (
                      <tr key={alt.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 text-cyan-400 font-semibold">{alt.alertId}</td>
                        <td className="py-2.5 px-3 font-sans text-white">{alt.attackCategory}</td>
                        <td className="py-2.5 px-3 text-slate-400">{alt.sourceIp}</td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${severityBadge}`}>
                            {alt.severity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{alt.timestamp}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-xs text-slate-400 py-8 text-center">
                {isLoading ? 'Loading alerts...' : 'No security alerts registered yet in `/api/alerts`'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
