import apiClient from '@/common/utils/api-client';

export const logoutUser = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};
