import { Bus as BusIcon, CheckCircle2, Wrench, Ban } from 'lucide-react';
import { Card } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';

interface BusesStats {
  total: number;
  operational: number;
  maintenance: number;
  outOfService: number;
}

interface BusesStatsCardsProps {
  stats: BusesStats;
  isLoading: boolean;
}

export const BusesStatsCards = ({ stats, isLoading }: BusesStatsCardsProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400">
        <BusIcon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">Flota Total</p>
        <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : stats.total}</h3>
      </div>
    </Card>
    <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">Operativos</p>
        <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : stats.operational}</h3>
      </div>
    </Card>
    <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400">
        <Wrench className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">En Taller</p>
        <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : stats.maintenance}</h3>
      </div>
    </Card>
    <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400">
        <Ban className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">Inactivos</p>
        <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : stats.outOfService}</h3>
      </div>
    </Card>
  </div>
);
