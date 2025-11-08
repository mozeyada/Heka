// API client for frontend

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Redirect to login (handled by frontend)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { email: string; password: string; name: string; age: number; accept_terms: boolean; accept_privacy: boolean }) => {
    try {
      const response = await apiClient.post('/api/auth/register', data);
      return response.data;
    } catch (error: any) {
      // Provide better error messages
      if (error.response?.status === 400) {
        const detail = error.response.data?.detail || 'Registration failed';
        throw new Error(detail);
      }
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email); // OAuth2 uses 'username' field
    formData.append('password', password);
    
    const response = await apiClient.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Store token
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user_id,
        email: response.data.email,
      }));
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },
};

// Couples API
export const couplesAPI = {
  create: async (partnerEmail: string) => {
    const response = await apiClient.post('/api/couples/invite', {
      partner_email: partnerEmail,
    });
    return response.data;
  },

  getMyCouple: async () => {
    const response = await apiClient.get('/api/couples/me');
    return response.data;
  },

  resendInvitation: async (invitationId: string) => {
    const response = await apiClient.post(`/api/couples/resend-invitation/${invitationId}`);
    return response.data;
  },

  getPendingInvitations: async () => {
    const response = await apiClient.get('/api/couples/pending-invitations');
    return response.data;
  },
};

// Arguments API
export const argumentsAPI = {
  create: async (data: { title: string; category: string; priority?: string }) => {
    const response = await apiClient.post('/api/arguments/create', data);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get('/api/arguments/');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/arguments/${id}`);
    return response.data;
  },
};

// Perspectives API
export const perspectivesAPI = {
  create: async (argumentId: string, content: string) => {
    const response = await apiClient.post('/api/perspectives/create', {
      argument_id: argumentId,
      content,
    });
    return response.data;
  },

  getByArgument: async (argumentId: string) => {
    const response = await apiClient.get(`/api/perspectives/argument/${argumentId}`);
    return response.data;
  },
};

// Check-ins API
export const checkinsAPI = {
  getCurrent: async () => {
    const response = await apiClient.get('/api/checkins/current');
    return response.data;
  },

  complete: async (responses: Record<string, any>) => {
    const response = await apiClient.post('/api/checkins/current/complete', { responses });
    return response.data;
  },

  getHistory: async (limit: number = 10) => {
    const response = await apiClient.get(`/api/checkins/history?limit=${limit}`);
    return response.data;
  },
};

// Goals API
export const goalsAPI = {
  create: async (data: { title: string; description?: string; target_date?: string }) => {
    const response = await apiClient.post('/api/goals/create', data);
    return response.data;
  },

  getAll: async (statusFilter?: string) => {
    const url = statusFilter ? `/api/goals/?status_filter=${statusFilter}` : '/api/goals/';
    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (goalId: string) => {
    const response = await apiClient.get(`/api/goals/${goalId}`);
    return response.data;
  },

  updateProgress: async (goalId: string, data: { notes?: string; progress_value?: number }) => {
    const response = await apiClient.post(`/api/goals/${goalId}/progress`, data);
    return response.data;
  },

  complete: async (goalId: string) => {
    const response = await apiClient.post(`/api/goals/${goalId}/complete`);
    return response.data;
  },
};

// Subscriptions API
export const subscriptionsAPI = {
  getMySubscription: async () => {
    const response = await apiClient.get('/api/subscriptions/me');
    return response.data;
  },

  getUsage: async () => {
    const response = await apiClient.get('/api/subscriptions/usage');
    return response.data;
  },

  createCheckoutSession: async (data: { tier: string; success_url: string; cancel_url: string }) => {
    const response = await apiClient.post('/api/subscriptions/create-checkout-session', data);
    return response.data;
  },
};

// Users API (Data Export/Deletion)
export const usersAPI = {
  exportData: async () => {
    const response = await apiClient.get('/api/users/me/export');
    return response.data;
  },

  deleteAccount: async (confirmation: string) => {
    const response = await apiClient.delete('/api/users/me/account', {
      params: { confirmation }
    });
    return response.data;
  },
};

export default apiClient;

