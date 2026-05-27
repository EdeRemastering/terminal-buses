import apiClient from '@/common/utils/api-client';
import type { UpdateBusInput } from '@/modules/buses/schemas/busSchema';
import type { Bus } from '@/modules/buses/types';

export const updateBus = async (id: string, input: UpdateBusInput): Promise<Bus> => {
  const response = await apiClient.put(`/buses/${id}`, input);
  return response.data.data;
};
