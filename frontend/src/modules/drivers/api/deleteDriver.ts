import apiClient from '@/common/utils/api-client';

export const deleteDriver = async (id: string): Promise<void> => {
  await apiClient.delete(`/drivers/${id}`);
};
