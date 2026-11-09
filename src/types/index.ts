export type MLAlgorithm = 'random_forest' | 'decision_tree' | 'svm';

export type TrafficStatus = 'normal' | 'suspicious' | 'malicious';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AlertStatus = 'active' | 'investigating' | 'mitigated' | 'false_positive';

export interface TrafficRecord {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  service: string;
  duration: number;
  srcBytes: number;
  dstBytes: number;
  prediction: TrafficStatus;
  confidence: number;
  attackCategory: string;
}

export interface DetectionResult {
  summary: {
    totalPackets: number;
    normalCount: number;
    suspiciousCount: number;
    maliciousCount: number;
    detectionRate: number;
    processingTimeMs: number;
    algorithmUsed: MLAlgorithm;
  };
  records: TrafficRecord[];
}

export interface DatasetItem {
  id: string;
  name: string;
  filename: string;
  recordsCount: number;
  featuresCount: number;
  uploadDate: string;
  sizeBytes: number;
  status: 'ready' | 'analyzed' | 'in_use';
  description?: string;
}

export interface ModelMetric {
  id: MLAlgorithm;
  name: string;
  fullName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingTimeSec: number;
  inferenceLatencyMs: number;
  description: string;
  strengths: string;
}

export interface SecurityAlert {
  id: string;
  alertId: string;
  timestamp: string;
  attackCategory: string;
  sourceIp: string;
  destinationIp: string;
  severity: AlertSeverity;
  status: AlertStatus;
  affectedPort: number;
  algorithmDetected: string;
}

export interface SystemStats {
  totalAnalyzed: number;
  normalCount: number;
  maliciousCount: number;
  detectionRate: number;
  activeSensors: number;
  currentEngine: string;
}

export interface TrafficChartPoint {
  time: string;
  normal: number;
  malicious: number;
}

export interface ProtocolDistributionPoint {
  name: string;
  value: number;
  color: string;
}
