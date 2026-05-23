import apiClient from '@/common/utils/api-client';
import type { Trip } from '@/modules/trips/types';

export const getTrips = async (): Promise<Trip[]> => {
  const response = await apiClient.get('/trips');
  return response.data.data;
};
