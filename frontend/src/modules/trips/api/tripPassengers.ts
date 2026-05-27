import apiClient from '@/common/utils/api-client';
import type { TripPassenger } from '@/modules/trips/types';

export const addTripPassenger = async (tripId: string, passengerId: string): Promise<TripPassenger[]> => {
  const response = await apiClient.post(`/trips/${tripId}/passengers`, { passenger_id: passengerId });
  return response.data.data;
};

export const removeTripPassenger = async (tripId: string, assignmentId: string): Promise<void> => {
  await apiClient.delete(`/trips/${tripId}/passengers/${assignmentId}`);
};

export const assignSeat = async (
  tripId: string,
  assignmentId: string,
  seatNumber: number
): Promise<{ passengers: TripPassenger[] }> => {
  const response = await apiClient.put(`/trips/${tripId}/passengers/${assignmentId}/seat`, { seatNumber });
  return response.data.data;
};

export const clearSeat = async (tripId: string, assignmentId: string): Promise<{ passengers: TripPassenger[] }> => {
  const response = await apiClient.delete(`/trips/${tripId}/passengers/${assignmentId}/seat`);
  return response.data.data;
};
