import { User, LoginCredentials, SignupData, ResetPasswordData } from '@shipit/shared-types';
import { apiClient } from '../lib/axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  user: User;
}

export const authService = {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/signup', data);
    return { user: response.data.data };
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/login', credentials);
    return { user: response.data.data.user };
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('currentOrganizationId');
  },

  async getSession(): Promise<AuthResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/session');
      return { user: response.data.data.user };
    } catch {
      return null;
    }
  },

  async verifyEmail(token: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>('/auth/verify-email', { token });
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>('/auth/reset-password', data);
    return response.data;
  },

  async loginWithGoogle(): Promise<void> {
    window.location.href = `${apiClient.defaults.baseURL}/auth/oauth/google`;
  },

  async loginWithApple(): Promise<void> {
    window.location.href = `${apiClient.defaults.baseURL}/auth/oauth/apple`;
  },
};
