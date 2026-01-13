import { SupportRequest, CreateSupportRequestData, ApiResponse } from '@shipit/shared-types';
import { apiClient } from '../lib/axios';

export const supportService = {
  async createSupportRequest(data: CreateSupportRequestData): Promise<SupportRequest> {
    const response = await apiClient.post<ApiResponse<SupportRequest>>('/support', data);
    return response.data.data!;
  },

  async getSupportRequests(): Promise<SupportRequest[]> {
    const response = await apiClient.get<ApiResponse<SupportRequest[]>>('/support');
    return response.data.data!;
  },
};
