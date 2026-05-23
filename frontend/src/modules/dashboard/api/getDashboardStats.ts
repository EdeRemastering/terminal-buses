import apiClient from '@/common/utils/api-client';
import type { DashboardStats } from '@/modules/dashboard/types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data.data;
};
