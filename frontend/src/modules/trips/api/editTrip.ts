import apiClient from '@/common/utils/api-client';
import type { TripFormData } from '@/modules/trips/schemas/tripSchema';
import type { Trip } from '@/modules/trips/types';

export const editTrip = async (id: string, input: Partial<TripFormData>): Promise<Trip> => {
  const response = await apiClient.put(`/trips/${id}`, input);
  return response.data.data;
};
