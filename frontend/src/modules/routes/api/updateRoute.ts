import apiClient from '@/common/utils/api-client';
import type { CreateRouteInput } from '@/modules/routes/schemas/routeSchema';
import type { Route } from '@/modules/routes/schemas/routeSchema';

export const updateRoute = async (id: string, input: CreateRouteInput): Promise<Route> => {
  const response = await apiClient.put(`/routes/${id}`, input);
  return response.data.data;
};
