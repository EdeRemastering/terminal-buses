import apiClient from '@/common/utils/api-client';
import type { CreatePassengerInput } from '@/modules/passengers/schemas/passengerSchema';
import type { Passenger } from '@/modules/passengers/types';

export const updatePassenger = async (id: string, input: CreatePassengerInput): Promise<Passenger> => {
  const response = await apiClient.put(`/passengers/${id}`, input);
  return response.data.data;
};
