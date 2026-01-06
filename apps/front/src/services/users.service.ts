import { User } from '@shipit/shared-types';
import { apiClient } from '../lib/axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: Record<string, unknown>;
  language?: 'fr' | 'en';
  theme?: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
}

export const usersService = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me', data);
    return response.data.data;
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
      '/users/me/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data.data;
  },

  async deleteAvatar(): Promise<void> {
    await apiClient.delete('/users/me/avatar');
  },
};
