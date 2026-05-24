import { useQuery } from '@tanstack/react-query';
import { getBuses } from '@/modules/buses/api/getBuses';

export const useBuses = () => {
  return useQuery({
    queryKey: ['buses'],
    queryFn: getBuses,
    // staleTime: 5 * 60 * 1000, // 5 min, los buses no cambian tan seguido
  });
};
