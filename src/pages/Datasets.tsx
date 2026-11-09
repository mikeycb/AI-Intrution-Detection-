import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  CheckCircle,
  FileSpreadsheet,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  X
} from 'lucide-react';
import { DatasetItem } from '../types';
import { apiService } from '../services/api';
import { NavTab } from '../components/layout/Sidebar';

interface DatasetsProps {
  onNavigate: (tab: NavTab) => void;
}

const STANDARD_KDD_FEATURES = [
  { name: 'duration', type: 'Continuous', desc: 'Length of the connection in seconds' },
  { name: 'protocol_type', type: 'Discrete', desc: 'Protocol type (e.g., tcp, udp, icmp)' },
  { name: 'service', type: 'Discrete', desc: 'Network service on the destination (e.g., http, telnet)' },
  { name: 'flag', type: 'Discrete', desc: 'Normal or error status of the connection (e.g., SF, S0)' },
  { name: 'src_bytes', type: 'Continuous', desc: 'Number of data bytes from source to destination' },
  { name: 'dst_bytes', type: 'Continuous', desc: 'Number of data bytes from destination to source' },
  { name: 'land', type: 'Discrete', desc: '1 if connection is from/to the same host/port; 0 otherwise' },
  { name: 'wrong_fragment', type: 'Continuous', desc: 'Number of wrong fragments in connection' },
  { name: 'urgent', type: 'Continuous', desc: 'Number of urgent packets' },
  { name: 'count', type: 'Continuous', desc: 'Number of connections to the same host in past 2 seconds' },
  { name: 'srv_count', type: 'Continuous', desc: 'Number of connections to the same service in past 2 seconds' },
  { name: 'serror_rate', type: 'Continuous', desc: '% of connections that have SYN errors' },
  { name: 'same_srv_rate', type: 'Continuous', desc: '% of connections to the same service' },
  { name: 'diff_srv_rate', type: 'Continuous', desc: '% of connections to different services' },
];

export const Datasets: React.FC<DatasetsProps> = ({ onNavigate }) => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [selectedDatasetForInspection, setSelectedDatasetForInspection] = useState<DatasetItem | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    apiService.getDatasets()
      .then(setDatasets)
      .catch(() => {
        setErrorMessage(`Could not reach dataset endpoint at ${apiService.getBaseUrl()}/datasets`);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setErrorMessage(null);
      try {
        const newItem = await apiService.uploadDataset(file);
        setDatasets((prev) => [newItem, ...prev]);
        setUploadFeedback(`Dataset "${file.name}" uploaded successfully.`);
        setTimeout(() => setUploadFeedback(null), 4000);
      } catch (err: any) {
        setErrorMessage(err.message || 'Dataset upload failed.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload & Overview Header */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Network Traffic Datasets Repository</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registered CSV datasets formatted with multi-dimensional network flow vectors for machine learning training and testing.
          </p>
        </div>

        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-400/20">
            <Upload className="w-4 h-4" />
            <span>Upload New Dataset (CSV)</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploadFeedback && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* Dataset Inventory Table */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Available Datasets</h3>
            <p className="text-xs text-slate-400">Total {datasets.length} benchmark sets ready for inference</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-medium">Dataset Name</th>
                <th className="py-2.5 px-3 font-medium">Filename</th>
                <th className="py-2.5 px-3 font-medium">Records</th>
                <th className="py-2.5 px-3 font-medium">Features</th>
                <th className="py-2.5 px-3 font-medium">Upload Date</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {datasets.map((ds) => {
                const statusBadge = {
                  ready: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                  analyzed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  in_use: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                }[ds.status];

                return (
                  <tr key={ds.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span>{ds.name}</span>
                      </div>
                      {ds.description && (
                        <div className="text-[11px] text-slate-400 mt-0.5 max-w-sm truncate">
                          {ds.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{ds.filename}</td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-200">
                      {ds.recordsCount.toLocaleString()} rows
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-400 font-semibold">
                      {ds.featuresCount} cols
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      <div className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{ds.uploadDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${statusBadge}`}>
                        {ds.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedDatasetForInspection(ds)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                        >
                          Inspect Schema
                        </button>
                        <button
                          onClick={() => onNavigate('detection')}
                          className="px-2.5 py-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded border border-cyan-500/20 flex items-center gap-1 transition-colors"
                        >
                          <span>Detect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {datasets.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              {isLoading ? (
                <span>Loading registered datasets...</span>
              ) : errorMessage ? (
                <span className="text-amber-400">{errorMessage}</span>
              ) : (
                <span>No datasets uploaded yet. Upload a CSV dataset above to begin.</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feature Inspection Modal */}
      {selectedDatasetForInspection && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Feature Schema: {selectedDatasetForInspection.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standard 41-feature NSL-KDD vector extraction mapping
                </p>
              </div>
              <button
                onClick={() => setSelectedDatasetForInspection(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 mb-3 flex items-start gap-2 text-slate-300">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  These flow features are ingested by Scikit-learn's preprocessing pipeline (`StandardScaler` and `OneHotEncoder`) before inference with Random Forest, Decision Tree, and SVM.
                </span>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-2 font-medium">Feature Name</th>
                    <th className="py-2 px-2 font-medium">Type</th>
                    <th className="py-2 px-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {STANDARD_KDD_FEATURES.map((feat) => (
                    <tr key={feat.name} className="hover:bg-slate-800/40">
                      <td className="py-2 px-2 text-cyan-400 font-semibold">{feat.name}</td>
                      <td className="py-2 px-2 text-slate-400">{feat.type}</td>
                      <td className="py-2 px-2 font-sans text-slate-300">{feat.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDatasetForInspection(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
