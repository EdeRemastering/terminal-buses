import apiClient from '@/common/utils/api-client';
import type { Bus } from '@/modules/buses/types';

export const updateBusStatus = async (id: string, status: Bus['status']): Promise<Bus> => {
  const response = await apiClient.patch(`/buses/${id}/status`, { status });
  return response.data.data;
};
