/**
 * Centralized API Client for WAPSI Causal Decision Engine Backend.
 * Connects React frontend to FastAPI via Vite /api proxy with resilient fallback.
 */

export type BackendConnectionStatus = 'LIVE' | 'STARTING' | 'OFFLINE';

export interface HealthStatusResponse {
  status: string;
  service: string;
  version: string;
  models_ready: boolean;
  tee_boundary?: Record<string, any>;
  audit_ledger_status?: {
    is_valid: boolean;
    total_blocks: number;
    latest_block_hash: string;
  };
}

class ApiClient {
  private baseUrl: string = '/api/v1';
  private connectionStatus: BackendConnectionStatus = 'OFFLINE';
  private statusListeners: Array<(status: BackendConnectionStatus) => void> = [];
  private lastHealthCheck: HealthStatusResponse | null = null;
  private isChecking: boolean = false;

  constructor() {
    // Initial health probe
    this.checkHealth().catch(() => {});
  }

  public onStatusChange(listener: (status: BackendConnectionStatus) => void) {
    this.statusListeners.push(listener);
    listener(this.connectionStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private setStatus(status: BackendConnectionStatus) {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.statusListeners.forEach((l) => l(status));
    }
  }

  public getStatus(): BackendConnectionStatus {
    return this.connectionStatus;
  }

  public getLastHealth(): HealthStatusResponse | null {
    return this.lastHealthCheck;
  }

  public async checkHealth(): Promise<HealthStatusResponse | null> {
    if (this.isChecking) return this.lastHealthCheck;
    this.isChecking = true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/v1/health', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: HealthStatusResponse = await res.json();
        this.lastHealthCheck = data;
        if (data.models_ready) {
          this.setStatus('LIVE');
        } else {
          this.setStatus('STARTING');
        }
        return data;
      } else {
        this.setStatus('OFFLINE');
        return null;
      }
    } catch {
      this.setStatus('OFFLINE');
      return null;
    } finally {
      this.isChecking = false;
    }
  }

  public async get<T>(path: string, queryParams?: Record<string, string | number | boolean | undefined>): Promise<T> {
    let url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    if (queryParams) {
      const sp = new URLSearchParams();
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null) sp.append(k, String(v));
      });
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  }

  public async post<T>(path: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  }

  public async put<T>(path: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  }
}

export const apiClient = new ApiClient();
