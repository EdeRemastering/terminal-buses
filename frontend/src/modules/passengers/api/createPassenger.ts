import apiClient from '@/common/utils/api-client';
import type { Passenger } from '@/modules/passengers/types';
import type { CreatePassengerInput } from '@/modules/passengers/schemas/passengerSchema';

export const createPassenger = async (input: CreatePassengerInput): Promise<Passenger> => {
  const response = await apiClient.post('/passengers', input);
  return response.data.data;
};
