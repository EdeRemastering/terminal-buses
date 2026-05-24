import apiClient from '@/common/utils/api-client';
import type { Driver } from '@/modules/drivers/types';

export const getDrivers = async (): Promise<Driver[]> => {
  const response = await apiClient.get('/drivers');
  return response.data.data;
};
