import apiClient from '@/common/utils/api-client';
import type { LoginResponse } from '@/modules/auth/types';

export const getCurrentUser = async (): Promise<LoginResponse> => {
  const response = await apiClient.get('/auth/me');
  return response.data.data;
};
