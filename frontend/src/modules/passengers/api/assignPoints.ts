import apiClient from '@/common/utils/api-client';
import type { Passenger } from '@/modules/passengers/types';

export const assignPoints = async (id: string, totalPoints: number): Promise<Passenger> => {
  const response = await apiClient.put(`/passengers/${id}`, {
    frequentTravelerPoints: totalPoints,
  });
  return response.data.data;
};
