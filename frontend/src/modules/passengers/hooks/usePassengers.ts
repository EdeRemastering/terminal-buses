import { useQuery } from '@tanstack/react-query';
import { getPassengers } from '@/modules/passengers/api/getPassengers';

export const usePassengers = () => {
  return useQuery({
    queryKey: ['passengers'],
    queryFn: getPassengers,
  });
};
