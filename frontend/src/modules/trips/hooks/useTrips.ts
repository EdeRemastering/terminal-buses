import { useQuery } from '@tanstack/react-query';

import { getTrips } from '@/modules/trips/api/getTrips';

export const useTrips = () => {
  return useQuery({
    queryKey: ['trips'],
    queryFn: getTrips,
  });
};
