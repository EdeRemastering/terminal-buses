import apiClient from '@/common/utils/api-client';

export const deleteRoute = async (id: string): Promise<void> => {
  await apiClient.delete(`/routes/${id}`);
};
