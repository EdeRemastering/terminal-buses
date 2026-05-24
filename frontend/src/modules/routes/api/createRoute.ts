import apiClient from '@/common/utils/api-client';
import type { CreateRouteInput } from '@/modules/routes/schemas/routeSchema';
import type { Route } from '@/modules/routes/schemas/routeSchema';

export const createRoute = async (input: CreateRouteInput): Promise<Route> => {
  const response = await apiClient.post('/routes', input);
  return response.data.data;
};
