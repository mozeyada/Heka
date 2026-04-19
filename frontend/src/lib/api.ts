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

export function getApiErrorMessage(error: any, fallback: string): string {
  const detail = error.response?.data?.detail;

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const firstMessage = detail.find((item) => typeof item?.msg === 'string')?.msg;
    if (firstMessage) {
      return firstMessage;
    }
  }

  return error.message || fallback;
}

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
      // Don't redirect on login/register endpoints - these are expected to return 401 for wrong credentials
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/register');

      if (!isAuthEndpoint) {
        // Token expired or invalid on protected endpoints
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        // Redirect to login (handled by frontend)
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
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
      if (error.response?.status === 400 || error.response?.status === 422) {
        throw new Error(getApiErrorMessage(error, 'Registration failed'));
      }
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
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
    } catch (error: any) {
      // Provide better error messages for login failures
      if (error.response?.status === 401) {
        throw new Error(getApiErrorMessage(error, 'Incorrect email or password'));
      }
      if (error.response?.status === 403) {
        throw new Error(getApiErrorMessage(error, 'Account is inactive'));
      }
      if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      // Network or other errors
      throw new Error(getApiErrorMessage(error, 'Login failed. Please check your connection and try again.'));
    }
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

export interface NotificationChannelPreference {
  email: boolean;
  in_app: boolean;
}

export interface RelationshipNotificationPreferences {
  invites: NotificationChannelPreference;
  partner_activity: NotificationChannelPreference;
  check_in_reminders: NotificationChannelPreference;
  goal_updates: NotificationChannelPreference;
  ai_insights: NotificationChannelPreference;
}

export interface NotificationPreferences {
  account_emails: {
    security_and_recovery: boolean;
    billing_and_subscription: boolean;
    legal_and_policy: boolean;
  };
  relationship_notifications: RelationshipNotificationPreferences;
  can_edit_account_emails: boolean;
}

export interface InAppNotification {
  id: string;
  category: string;
  title: string;
  body: string;
  resource_type?: string | null;
  resource_id?: string | null;
  action_path?: string | null;
  actor_user_id?: string | null;
  metadata: Record<string, any>;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface DashboardSubscriptionOverview {
  tier: string;
  status: string;
  trial_end?: string | null;
  period_start?: string | null;
  period_end?: string | null;
}

export interface DashboardUsageOverview {
  count: number;
  limit: number;
  is_unlimited: boolean;
  period_start?: string | null;
  period_end?: string | null;
}

export interface DashboardOverview {
  subscription: DashboardSubscriptionOverview;
  usage: DashboardUsageOverview;
  arguments: any[];
  goals: any[];
  current_checkin: any;
  week_start_date: string;
}

export const notificationsAPI = {
  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get('/api/notifications/preferences');
    return response.data;
  },

  updatePreferences: async (
    relationshipNotifications: RelationshipNotificationPreferences
  ): Promise<NotificationPreferences> => {
    const response = await apiClient.put('/api/notifications/preferences', {
      relationship_notifications: relationshipNotifications,
    });
    return response.data;
  },

  getFeed: async (limit: number = 20, offset: number = 0): Promise<{ items: InAppNotification[]; unread_count: number }> => {
    const response = await apiClient.get(`/api/notifications/feed?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const response = await apiClient.get('/api/notifications/unread-count');
    return response.data;
  },

  markRead: async (notificationId: string) => {
    await apiClient.post(`/api/notifications/${notificationId}/read`);
  },

  markAllRead: async () => {
    await apiClient.post('/api/notifications/read-all');
  },
};

export const dashboardAPI = {
  getOverview: async (): Promise<DashboardOverview> => {
    const response = await apiClient.get('/api/dashboard/overview');
    return response.data;
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
  create: async (data: { title: string; category: string; priority?: string; initial_perspective: string }) => {
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

  delete: async (id: string) => {
    await apiClient.delete(`/api/arguments/${id}`);
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/api/arguments/${id}/status`, { status });
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

  updateMine: async (argumentId: string, content: string) => {
    const response = await apiClient.patch(`/api/perspectives/argument/${argumentId}/mine`, {
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
  create: async (data: { title: string; description?: string; target_date?: string; first_step: string }) => {
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

  delete: async (goalId: string) => {
    const response = await apiClient.delete(`/api/goals/${goalId}`);
    return response.data;
  },

  reactToProgress: async (goalId: string, progressId: string, emoji: string) => {
    const response = await apiClient.post(`/api/goals/${goalId}/progress/${progressId}/react`, { emoji });
    return response.data;
  },
};

// AI Suggestions API
export const aiSuggestionsAPI = {
  getGoalSuggestions: async () => {
    const response = await apiClient.get('/api/ai/goals/suggestions');
    return response.data;
  },

  getCheckinSuggestions: async () => {
    const response = await apiClient.get('/api/ai/checkins/suggestions');
    return response.data;
  },

  generateArgumentGoals: async (argumentId: string) => {
    const response = await apiClient.post(`/api/ai/arguments/${argumentId}/generate-goals`);
    return response.data;
  },

  generateArgumentCheckins: async (argumentId: string) => {
    const response = await apiClient.post(`/api/ai/arguments/${argumentId}/generate-checkins`);
    return response.data;
  },

  getInsightsForArgument: async (argumentId: string) => {
    const response = await apiClient.get(`/api/ai/arguments/${argumentId}/insights`);
    return response.data;
  },

  analyzeArgument: async (argumentId: string) => {
    const response = await apiClient.post(`/api/ai/arguments/${argumentId}/analyze`, {});
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

  createCheckoutSession: async (data: { tier: string; interval: string; success_url: string; cancel_url: string }) => {
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
