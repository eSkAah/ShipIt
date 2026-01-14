import { Feedback, CreateFeedbackData, ApiResponse } from '@shipit/shared-types';
import { apiClient } from '../lib/axios';

export const feedbackService = {
  async submitFeedback(data: CreateFeedbackData): Promise<Feedback> {
    const response = await apiClient.post<ApiResponse<Feedback>>('/feedback', data);
    return response.data.data!;
  },
};
