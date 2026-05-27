import apiClient from '@/common/utils/api-client';
import type { CreateDriverInput } from '@/modules/drivers/schemas/driverSchema';
import type { Driver } from '@/modules/drivers/types';

export const updateDriver = async (id: string, input: CreateDriverInput): Promise<Driver> => {
  const response = await apiClient.put(`/drivers/${id}`, input);
  return response.data.data;
};
