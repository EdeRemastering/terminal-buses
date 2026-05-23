import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/modules/dashboard/api/getDashboardStats';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30_000,
  });
};
