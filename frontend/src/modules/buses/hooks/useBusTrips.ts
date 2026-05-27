import { useQuery } from '@tanstack/react-query';
import { getBusTrips } from '@/modules/buses/api/getBusTrips';

export const useBusTrips = (busId: string | null) => {
  return useQuery({
    queryKey: ['bus-trips', busId],
    queryFn: () => getBusTrips(busId!),
    enabled: !!busId,
    retry: 1,
  });
};
