import {
  DatasetItem,
  DetectionResult,
  MLAlgorithm,
  ModelMetric,
  ProtocolDistributionPoint,
  SecurityAlert,
  SystemStats,
  TrafficChartPoint,
  AlertStatus
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Direct API Service for AI-Based Intrusion Detection System.
 * Connects directly to the Python FastAPI backend.
 */
class ApiService {
  public getBaseUrl(): string {
    return API_BASE_URL;
  }

  public async checkBackendHealth(): Promise<{ online: boolean; message: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return { online: true, message: 'Connected to Python FastAPI Backend' };
      }
    } catch {
      // Backend is offline or not reachable
    }
    return { online: false, message: `Backend offline (${API_BASE_URL})` };
  }

  public async getSystemStats(): Promise<SystemStats> {
    const res = await fetch(`${API_BASE_URL}/stats`);
    if (!res.ok) {
      throw new Error(`Failed to fetch stats: ${res.statusText}`);
    }
    return await res.json();
  }

  public async getTrafficChartData(): Promise<TrafficChartPoint[]> {
    const res = await fetch(`${API_BASE_URL}/traffic-chart`);
    if (!res.ok) {
      throw new Error(`Failed to fetch traffic timeline: ${res.statusText}`);
    }
    return await res.json();
  }

  public async getProtocolDistribution(): Promise<ProtocolDistributionPoint[]> {
    const res = await fetch(`${API_BASE_URL}/protocols`);
    if (!res.ok) {
      throw new Error(`Failed to fetch protocol distribution: ${res.statusText}`);
    }
    return await res.json();
  }

  public async detectIntrusion(
    datasetFile: File,
    algorithm: MLAlgorithm
  ): Promise<DetectionResult> {
    const formData = new FormData();
    formData.append('file', datasetFile);
    formData.append('algorithm', algorithm);

    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(errText || `Inference error (${res.status}): ${res.statusText}`);
    }

    return await res.json();
  }

  public async getDatasets(): Promise<DatasetItem[]> {
    const res = await fetch(`${API_BASE_URL}/datasets`);
    if (!res.ok) {
      throw new Error(`Failed to fetch datasets: ${res.statusText}`);
    }
    return await res.json();
  }

  public async uploadDataset(file: File): Promise<DatasetItem> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`);
    }

    return await res.json();
  }

  public async getModelMetrics(): Promise<ModelMetric[]> {
    const res = await fetch(`${API_BASE_URL}/models/metrics`);
    if (!res.ok) {
      throw new Error(`Failed to fetch model metrics: ${res.statusText}`);
    }
    return await res.json();
  }

  public async getSecurityAlerts(): Promise<SecurityAlert[]> {
    const res = await fetch(`${API_BASE_URL}/alerts`);
    if (!res.ok) {
      throw new Error(`Failed to fetch alerts: ${res.statusText}`);
    }
    return await res.json();
  }

  public async updateAlertStatus(alertId: string, status: AlertStatus): Promise<SecurityAlert> {
    const res = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update alert: ${res.statusText}`);
    }

    return await res.json();
  }
}

export const apiService = new ApiService();
