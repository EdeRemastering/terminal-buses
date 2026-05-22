import apiClient from '@/common/utils/api-client';
import type { LoginRequest, LoginResponse } from '@/modules/auth/types';

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data.data;
};
