import apiClient from '@/common/utils/api-client';
import type { Passenger } from '@/modules/passengers/types';

export const getPassengers = async (): Promise<Passenger[]> => {
  const response = await apiClient.get('/passengers');
  return response.data.data;
};
