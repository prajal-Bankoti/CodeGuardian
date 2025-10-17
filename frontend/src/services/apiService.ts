// API service for communicating with our backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('bitbucket_access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP ${response.status}`,
          error: data.error,
        } as ApiResponse<T>;
      }

      return {
        success: true,
        data: data.data || data,
      } as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        message: 'Network error',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse<T>;
    }
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP ${response.status}`,
          error: data.error,
        } as ApiResponse<T>;
      }

      return {
        success: true,
        data: data.data || data,
      } as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        message: 'Network error',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse<T>;
    }
  }

  // Bitbucket-specific methods
  async getUserInfo(): Promise<ApiResponse<any>> {
    return this.get('/bitbucket/user');
  }

  async getRepositories(page = 1, pagelen = 20): Promise<ApiResponse<any[]>> {
    return this.get(`/bitbucket/repositories?page=${page}&pagelen=${pagelen}`);
  }

  async getPullRequests(repository?: string, page = 1, pagelen = 20): Promise<ApiResponse<any[]>> {
    const endpoint = repository && repository !== 'all'
      ? `/bitbucket/pullrequests?repository=${encodeURIComponent(repository)}&page=${page}&pagelen=${pagelen}`
      : `/bitbucket/pullrequests?page=${page}&pagelen=${pagelen}`;
    return this.get(endpoint);
  }

  async getPullRequestDetails(repository: string, prId: string): Promise<ApiResponse<any>> {
    return this.get(`/bitbucket/pullrequests/${encodeURIComponent(repository)}/${encodeURIComponent(prId)}`);
  }

  async getPullRequestDiff(repository: string, prId: string): Promise<ApiResponse<any>> {
    return this.get(`/bitbucket/pullrequests/${encodeURIComponent(repository)}/${encodeURIComponent(prId)}/diff`);
  }
}

export const apiService = new ApiService();
