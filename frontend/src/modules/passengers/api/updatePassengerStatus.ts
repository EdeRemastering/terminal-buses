import apiClient from '@/common/utils/api-client';
import type { Passenger } from '@/modules/passengers/types';

export const updatePassengerStatus = async (id: string, status: Passenger['status']): Promise<Passenger> => {
  const response = await apiClient.patch(`/passengers/${id}/status`, { status });
  return response.data.data;
};
