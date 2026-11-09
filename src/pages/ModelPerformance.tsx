import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Cpu,
  Zap,
  Clock,
  Award,
  CheckCircle2,
  Info,
  RefreshCw
} from 'lucide-react';
import { ModelMetric } from '../types';
import { apiService } from '../services/api';

export const ModelPerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiService.getModelMetrics();
      setMetrics(data);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
        `Unable to fetch model metrics. Ensure Python FastAPI is serving GET /api/models/metrics at ${apiService.getBaseUrl()}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Format chart data dynamically from fetched metrics
  const chartData = [
    {
      metric: 'Accuracy',
      ...metrics.reduce((acc, m) => ({ ...acc, [m.name]: m.accuracy }), {})
    },
    {
      metric: 'Precision',
      ...metrics.reduce((acc, m) => ({ ...acc, [m.name]: m.precision }), {})
    },
    {
      metric: 'Recall',
      ...metrics.reduce((acc, m) => ({ ...acc, [m.name]: m.recall }), {})
    },
    {
      metric: 'F1-Score',
      ...metrics.reduce((acc, m) => ({ ...acc, [m.name]: m.f1Score }), {})
    }
  ];

  const colors = ['#38bdf8', '#06b6d4', '#818cf8', '#a855f7'];

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Algorithm Benchmark Comparison</h2>
            <p className="text-xs text-slate-400">
              Comparative evaluation metrics served by the Python Scikit-learn backend.
            </p>
          </div>
        </div>

        <button
          onClick={fetchMetrics}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Primary Chart: Model Metrics Comparison */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Performance Metrics by Algorithm (%)</h3>
            <p className="text-xs text-slate-400">
              Direct comparison of Accuracy, Precision, Recall, and F1-Score
            </p>
          </div>
        </div>

        <div className="h-72 w-full flex items-center justify-center">
          {metrics.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="metric" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} domain={[80, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  iconType="circle"
                />
                {metrics.map((m, idx) => (
                  <Bar
                    key={m.id}
                    dataKey={m.name}
                    fill={colors[idx % colors.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-xs text-slate-400 py-16">
              {isLoading ? (
                <div className="flex items-center gap-2 justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Loading model benchmark metrics...</span>
                </div>
              ) : (
                <span>No metrics loaded. Ensure Python FastAPI is serving `/api/models/metrics`</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Metric Comparison Table */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white">Quantitative Evaluation Matrix</h3>
          <p className="text-xs text-slate-400">
            Metrics including training duration and per-packet inference latency
          </p>
        </div>

        <div className="overflow-x-auto">
          {metrics.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-3 px-3">Algorithm</th>
                  <th className="py-3 px-3">Accuracy</th>
                  <th className="py-3 px-3">Precision</th>
                  <th className="py-3 px-3">Recall</th>
                  <th className="py-3 px-3">F1-Score</th>
                  <th className="py-3 px-3">Training Time</th>
                  <th className="py-3 px-3">Inference Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {metrics.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3 font-sans">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        <span>{m.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{m.fullName}</div>
                    </td>
                    <td className="py-3.5 px-3 text-cyan-400 font-bold text-sm">
                      {m.accuracy}%
                    </td>
                    <td className="py-3.5 px-3">{m.precision}%</td>
                    <td className="py-3.5 px-3">{m.recall}%</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-100">{m.f1Score}%</td>
                    <td className="py-3.5 px-3 text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {m.trainingTimeSec}s
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-emerald-400">
                      <span className="flex items-center gap-1 font-mono font-medium">
                        <Zap className="w-3 h-3" />
                        {m.inferenceLatencyMs} ms / pkt
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-xs text-slate-400 py-6">
              {isLoading ? 'Fetching matrix...' : 'Awaiting model data from backend.'}
            </div>
          )}
        </div>
      </div>

      {/* Model Architecture Cards */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((model) => (
            <div
              key={model.id}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white">{model.name}</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {model.accuracy}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">{model.description}</p>

                {model.strengths && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="text-slate-300 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Key Strengths:</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-5 leading-relaxed">
                      {model.strengths}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Latency: {model.inferenceLatencyMs}ms</span>
                <span>Train: {model.trainingTimeSec}s</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information Notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300">FastAPI ML Integration:</strong> All metrics on this page are dynamically loaded from your Python backend via <code className="text-cyan-400 font-mono">GET /api/models/metrics</code>.
        </div>
      </div>
    </div>
  );
};
