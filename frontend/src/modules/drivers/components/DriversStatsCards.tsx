import { User, CheckCircle2, Bus as BusIcon, UserX } from 'lucide-react';
import { Card } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';

interface DriversStats {
  total: number;
  available: number;
  onTrip: number;
  offDuty: number;
}

interface DriversStatsCardsProps {
  stats: DriversStats;
  isLoading: boolean;
}

export const DriversStatsCards = ({ stats, isLoading }: DriversStatsCardsProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400">
        <User className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">Conductores Activos</p>
        <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : stats.total}</h3>
      </div>
    </Card>
    <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">Disponibles</p>
        <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : stats.available}</h3>
      </div>
    </Card>
    <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-500 dark:text-blue-400">
        <BusIcon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">En Ruta</p>
        <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : stats.onTrip}</h3>
      </div>
    </Card>
    <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400">
        <UserX className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">En Descanso</p>
        <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : stats.offDuty}</h3>
      </div>
    </Card>
  </div>
);
