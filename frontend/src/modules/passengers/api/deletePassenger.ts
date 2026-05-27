import apiClient from '@/common/utils/api-client';

export const deletePassenger = async (id: string): Promise<void> => {
  await apiClient.delete(`/passengers/${id}`);
};
