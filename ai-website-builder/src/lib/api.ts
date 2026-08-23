// API client for backend communication

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge with options.headers if provided
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value;
        }
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const status = response.status;

      // Handle 204 No Content
      if (status === 204) {
        return { status, data: undefined };
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          status,
          error: data?.detail || data?.message || 'Request failed',
        };
      }

      return { status, data };
    } catch (error) {
      return {
        status: 0,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const status = response.status;
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          status,
          error: data?.detail || data?.message || 'Request failed',
        };
      }

      return { status, data };
    } catch (error) {
      return {
        status: 0,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
  // Deployment methods
  async deployWebsite(websiteId: string, subdomain: string) {
    return this.post(`/api/deployments/websites/${websiteId}`, { subdomain });
  }

  async getDeployment(deploymentId: string) {
    return this.get(`/api/deployments/${deploymentId}`);
  }

  async getDeploymentLogs(deploymentId: string) {
    return this.get(`/api/deployments/${deploymentId}/logs`);
  }

  async getWebsiteDeployments(websiteId: string) {
    return this.get(`/api/deployments/website/${websiteId}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
