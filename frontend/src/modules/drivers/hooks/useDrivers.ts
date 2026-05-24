import { useQuery } from '@tanstack/react-query';
import { getDrivers } from '@/modules/drivers/api/getDrivers';

export const useDrivers = () => {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: getDrivers,
  });
};
