import apiClient from '@/common/utils/api-client';
import type { CreateDriverInput } from '@/modules/drivers/schemas/driverSchema';
import type { Driver } from '@/modules/drivers/types';

export const createDriver = async (input: CreateDriverInput): Promise<Driver> => {
  const response = await apiClient.post('/drivers', input);
  return response.data.data;
};
