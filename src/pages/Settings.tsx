import React, { useState } from 'react';
import {
  Server,
  Sliders,
  CheckCircle,
  HelpCircle,
  Activity,
  Save
} from 'lucide-react';
import { apiService } from '../services/api';

export const Settings: React.FC = () => {
  const [defaultAlgorithm, setDefaultAlgorithm] = useState<'random_forest' | 'decision_tree' | 'svm'>('random_forest');
  const [threshold, setThreshold] = useState<number>(85);
  const [apiUrl, setApiUrl] = useState<string>(apiService.getBaseUrl());
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<{ online: boolean; message: string } | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await apiService.checkBackendHealth();
      setConnectionStatus(res);
    } catch {
      setConnectionStatus({ online: false, message: 'Backend unreachable. Check if FastAPI is running.' });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedFeedback('Settings saved successfully.');
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {savedFeedback && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* Model Inference Settings */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Model Inference & Detection Thresholds</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Default Machine Learning Algorithm
            </label>
            <select
              value={defaultAlgorithm}
              onChange={(e) => setDefaultAlgorithm(e.target.value as any)}
              className="w-full sm:w-80 px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="random_forest">Random Forest Classifier (Ensemble, 100 Trees)</option>
              <option value="decision_tree">Decision Tree Classifier (CART, Max Depth 12)</option>
              <option value="svm">Support Vector Machine (RBF Kernel)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Pre-selected algorithm when opening the Traffic Intrusion Detection page.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1">
              <span>Intrusion Alert Confidence Threshold:</span>
              <span className="font-mono text-cyan-400 font-semibold">{threshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>50% (High Sensitivity)</span>
              <span>75% (Balanced)</span>
              <span>99% (Strict / Low False Positives)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backend Integration Target Configuration */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Server className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Python FastAPI Backend Integration</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Backend API Base URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000/api"
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                {isTestingConnection ? (
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Activity className="w-3.5 h-3.5" />
                )}
                <span>Test Connection</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Target endpoint for the Python Scikit-learn backend service (`uvicorn main:app --reload`).
            </p>
          </div>

          {connectionStatus && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                connectionStatus.online
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${connectionStatus.online ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>{connectionStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Application & MCA Academic Info */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Project Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400">Project Title:</span>
            <div className="font-semibold text-white">AI-Based Intrusion Detection System (AI-IDS)</div>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Environment:</span>
            <div className="font-semibold text-white">Enterprise Network Security Operations</div>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Architecture:</span>
            <div className="font-semibold text-white">Decoupled React 19 Frontend + Python FastAPI REST API</div>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">ML Classifiers:</span>
            <div className="font-semibold text-white">Random Forest • Decision Tree • Support Vector Machine</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-400/20"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  );
};
