import { User, UserCheck, UserX, Award } from 'lucide-react';
import { Card } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';

interface Stats {
  total: number;
  active: number;
  inactive: number;
  premium: number;
}

interface PassengersStatsCardsProps {
  stats: Stats;
  isLoading: boolean;
}

export const PassengersStatsCards = ({ stats, isLoading }: PassengersStatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400">
          <User className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Pasajeros Totales</p>
          <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : stats.total}</h3>
        </div>
      </Card>
      <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Activos</p>
          <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : stats.active}</h3>
        </div>
      </Card>
      <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400">
          <UserX className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Inactivos</p>
          <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : stats.inactive}</h3>
        </div>
      </Card>
      <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Viajeros Premium</p>
          <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : stats.premium}</h3>
        </div>
      </Card>
    </div>
  );
};
