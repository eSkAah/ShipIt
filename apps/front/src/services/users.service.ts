import { User, ApiResponse, UpdateProfileData } from '@shipit/shared-types';
import { apiClient } from '../lib/axios';

export type { UpdateProfileData };

export const usersService = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data.data!;
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me', data);
    return response.data.data!;
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
      '/users/me/avatar',
      formData,
    );
    return response.data.data!;
  },

  async deleteAvatar(): Promise<void> {
    await apiClient.delete('/users/me/avatar');
  },
};
