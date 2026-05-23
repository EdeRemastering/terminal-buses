import apiClient from '@/common/utils/api-client';
import type { CreateBusInput } from '@/modules/buses/schemas/busSchema';
import type { Bus } from '@/modules/buses/types';

export const createBus = async (input: CreateBusInput): Promise<Bus> => {
  const response = await apiClient.post('/buses', input);
  return response.data.data;
};
