import apiClient from '@/common/utils/api-client';
import type { Trip, TripStatus } from '@/modules/trips/types';

export const updateTripStatus = async (id: string, status: TripStatus): Promise<Trip> => {
  const response = await apiClient.patch(`/trips/${id}/status`, { status });
  return response.data.data;
};
