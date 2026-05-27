import apiClient from '@/common/utils/api-client';
import type { Driver } from '@/modules/drivers/types';

export const updateDriverAvailability = async (id: string, availability: Driver['availability']): Promise<Driver> => {
  const response = await apiClient.patch(`/drivers/${id}/availability`, { availability });
  return response.data.data;
};
