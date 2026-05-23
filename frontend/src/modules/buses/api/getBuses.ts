import apiClient from '@/common/utils/api-client';
import type { Bus } from '@/modules/buses/types';

export const getBuses = async (): Promise<Bus[]> => {
  const response = await apiClient.get('/buses');
  return response.data.data;
};
