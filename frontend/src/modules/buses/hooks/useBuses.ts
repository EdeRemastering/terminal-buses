import { useQuery } from '@tanstack/react-query';
import { getBuses } from '@/modules/buses/api/getBuses';

export const useBuses = () => {
  return useQuery({
    queryKey: ['buses'],
    queryFn: getBuses,
  });
};
