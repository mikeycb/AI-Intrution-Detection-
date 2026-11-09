import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Play,
  RotateCcw,
  CheckCircle,
  AlertOctagon,
  AlertTriangle,
  Cpu,
  Check
} from 'lucide-react';
import { MLAlgorithm, DetectionResult, TrafficStatus } from '../types';
import { apiService } from '../services/api';

export const TrafficDetection: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<MLAlgorithm>('random_forest');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | TrafficStatus>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setErrorMessage('Please upload a valid CSV file containing network traffic features.');
        return;
      }
      setErrorMessage(null);
      setUploadedFile(file);
      setDetectionResult(null);
    }
  };

  const handleRunDetection = async () => {
    if (!uploadedFile) {
      setErrorMessage('Please select or upload a network traffic CSV file first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      setProcessingStep('Sending network flow features to Python ML backend...');
      const result = await apiService.detectIntrusion(uploadedFile, selectedAlgorithm);
      setDetectionResult(result);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
        `Backend inference failed. Ensure Python FastAPI is running at ${apiService.getBaseUrl()}`
      );
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setDetectionResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredRecords = detectionResult
    ? detectionResult.records.filter((rec) => {
        if (statusFilter === 'all') return true;
        return rec.prediction === statusFilter;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Configuration & Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: CSV Upload Area (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>1. Network Traffic Dataset (CSV)</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Upload packet capture flow logs containing IP, port, byte metrics, and protocol headers.
            </p>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${
                uploadedFile
                  ? 'border-cyan-500/40 bg-cyan-500/5'
                  : 'border-slate-700/80 hover:border-cyan-500/30 hover:bg-slate-800/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                <UploadCloud className="w-5 h-5" />
              </div>

              {uploadedFile ? (
                <div>
                  <div className="text-sm font-semibold text-white flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{uploadedFile.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    {(uploadedFile.size / 1024).toFixed(1)} KB • Ready for ML ingestion
                  </p>
                  <span className="inline-block mt-3 text-xs text-cyan-400 hover:underline">
                    Click to replace file
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-slate-300">
                    Drag and drop your network traffic CSV here, or <span className="text-cyan-400">browse file</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Accepts standard NSL-KDD, CICIDS2017 or custom NetFlow CSV exports
                  </p>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Files are streamed directly to <code className="text-cyan-400 font-mono">POST /api/predict</code> on your Python backend.
          </div>
        </div>

        {/* Right Column: Model Selection & Actions (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>2. Select Machine Learning Algorithm</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select the Scikit-learn model architecture to evaluate against the flow vectors.
            </p>

            {/* Algorithm Selector Cards */}
            <div className="space-y-2.5">
              {[
                {
                  id: 'random_forest' as MLAlgorithm,
                  name: 'Random Forest',
                  tag: 'Ensemble',
                  desc: 'Multi-tree bootstrap ensemble. Superior robustness against noisy traffic logs.'
                },
                {
                  id: 'decision_tree' as MLAlgorithm,
                  name: 'Decision Tree',
                  tag: 'Interpretable',
                  desc: 'Hierarchical CART rule-based classification. Transparent and interpretable rules.'
                },
                {
                  id: 'svm' as MLAlgorithm,
                  name: 'Support Vector Machine',
                  tag: 'Kernel-based',
                  desc: 'RBF kernel maximum margin hyperplane. High precision for complex attack patterns.'
                }
              ].map((algo) => {
                const isSelected = selectedAlgorithm === algo.id;
                return (
                  <div
                    key={algo.id}
                    onClick={() => setSelectedAlgorithm(algo.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-sm shadow-cyan-500/10'
                        : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="algorithm"
                          checked={isSelected}
                          onChange={() => setSelectedAlgorithm(algo.id)}
                          className="text-cyan-500 focus:ring-cyan-500 h-3.5 w-3.5 border-slate-700 bg-slate-900"
                        />
                        <span className="text-xs font-semibold text-white">{algo.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-medium text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {algo.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-5">
                      {algo.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-5 mt-4 border-t border-slate-800 flex items-center gap-3">
            <button
              onClick={handleRunDetection}
              disabled={isProcessing || !uploadedFile}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                isProcessing || !uploadedFile
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Running Inference...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Detect Intrusion</span>
                </>
              )}
            </button>

            {detectionResult && (
              <button
                onClick={handleReset}
                className="p-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-750 transition-colors"
                title="Reset detection"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Processing Status Feedback */}
      {isProcessing && (
        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center gap-3 animate-pulse">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <div className="text-xs font-semibold text-white">Machine Learning Engine Processing</div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">{processingStep}</div>
          </div>
        </div>
      )}

      {/* Detection Results Section */}
      {detectionResult && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400">Total Analyzed</span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {detectionResult.summary.totalPackets} packets
              </div>
              <span className="text-[11px] text-slate-400">Inference: {detectionResult.summary.processingTimeMs}ms</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Normal Traffic</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {detectionResult.summary.normalCount}
              </div>
              <span className="text-[11px] text-slate-400">
                {detectionResult.summary.totalPackets > 0
                  ? ((detectionResult.summary.normalCount / detectionResult.summary.totalPackets) * 100).toFixed(0)
                  : 0}% benign
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Suspicious Anomalies</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {detectionResult.summary.suspiciousCount}
              </div>
              <span className="text-[11px] text-slate-400">Requires triage</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Confirmed Malicious</span>
                <AlertOctagon className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xl font-bold font-mono text-rose-500 mt-1">
                {detectionResult.summary.maliciousCount}
              </div>
              <span className="text-[11px] text-slate-400">Intrusion flagged</span>
            </div>
          </div>

          {/* Detailed Prediction Table */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Detection Classification Results</h3>
                <p className="text-xs text-slate-400">
                  Individual packet flow classification by <strong className="text-slate-300 capitalize">{selectedAlgorithm.replace('_', ' ')}</strong>
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({detectionResult.records.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('normal')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      statusFilter === 'normal'
                        ? 'bg-emerald-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Normal ({detectionResult.summary.normalCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('suspicious')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      statusFilter === 'suspicious'
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Suspicious ({detectionResult.summary.suspiciousCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('malicious')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      statusFilter === 'malicious'
                        ? 'bg-rose-500 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Malicious ({detectionResult.summary.maliciousCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3 font-medium">Time</th>
                    <th className="py-2.5 px-3 font-medium">Source → Destination</th>
                    <th className="py-2.5 px-3 font-medium">Proto / Service</th>
                    <th className="py-2.5 px-3 font-medium">Payload Bytes</th>
                    <th className="py-2.5 px-3 font-medium">Classification</th>
                    <th className="py-2.5 px-3 font-medium">Confidence</th>
                    <th className="py-2.5 px-3 font-medium">Identified Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {filteredRecords.map((rec) => {
                    const badgeStyles = {
                      normal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      suspicious: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      malicious: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                    }[rec.prediction];

                    return (
                      <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400">{rec.timestamp}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-white">{rec.sourceIp}</span>
                          <span className="text-slate-400 mx-1.5">→</span>
                          <span className="text-slate-300">{rec.destinationIp}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          <span className="text-cyan-400 font-semibold">{rec.protocol}</span> / {rec.service}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {rec.srcBytes} B ↑ / {rec.dstBytes} B ↓
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${badgeStyles}`}>
                            {rec.prediction}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  rec.prediction === 'normal'
                                    ? 'bg-emerald-500'
                                    : rec.prediction === 'suspicious'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${rec.confidence}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-slate-300">{rec.confidence}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-200">
                          {rec.attackCategory}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredRecords.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No records match the selected filter ({statusFilter}).
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
