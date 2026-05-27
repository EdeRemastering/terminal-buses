import { useQuery } from '@tanstack/react-query';
import { getMyDriverInfo } from '@/modules/drivers/api/getMyDriverInfo';

export const useDriverInfo = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['driver-info'],
    queryFn: getMyDriverInfo,
    retry: 1,
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
};
