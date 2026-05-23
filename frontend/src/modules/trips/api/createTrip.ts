import apiClient from '@/common/utils/api-client';
import type { TripFormData } from '@/modules/trips/schemas/tripSchema';
import type { Trip } from '@/modules/trips/types';

export const createTrip = async (input: TripFormData): Promise<Trip> => {
  const response = await apiClient.post('/trips', input);
  return response.data.data;
};
