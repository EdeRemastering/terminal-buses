import apiClient from '@/common/utils/api-client';
import type { Route } from '@/modules/routes/schemas/routeSchema';

export const updateRouteStatus = async (id: string, status: Route['status']): Promise<Route> => {
  const response = await apiClient.patch(`/routes/${id}/status`, { status });
  return response.data.data;
};
