import apiClient from '@/common/utils/api-client';
import type { Trip } from '@/modules/trips/types';

export const cancelTrip = async (id: string): Promise<Trip> => {
  const response = await apiClient.patch(`/trips/${id}/status`, { status: 'CANCELLED' });
  return response.data.data;
};
