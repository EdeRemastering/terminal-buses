import apiClient from '@/common/utils/api-client';

export const deleteBus = async (id: string): Promise<void> => {
  await apiClient.delete(`/buses/${id}`);
};
