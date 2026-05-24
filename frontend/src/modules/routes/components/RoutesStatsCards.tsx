import { Route as RouteIcon, CheckCircle2, Compass, Map } from 'lucide-react';
import { Card } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';

interface RoutesStatsCardsProps {
  total: number;
  active: number;
  inactive: number;
  totalDistance: number;
  isLoading: boolean;
}

export const RoutesStatsCards = ({ total, active, inactive, totalDistance, isLoading }: RoutesStatsCardsProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400">
        <RouteIcon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">Rutas Totales</p>
        <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : total}</h3>
      </div>
    </Card>
    <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">Activas</p>
        <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : active}</h3>
      </div>
    </Card>
    <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400">
        <Compass className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">Inactivas</p>
        <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : inactive}</h3>
      </div>
    </Card>
    <Card className="p-5 border-none shadow-sm flex items-center gap-4 bg-card/60 backdrop-blur-sm">
      <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400">
        <Map className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">Distancia Total</p>
        <h3 className="text-2xl font-black">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : `${totalDistance.toLocaleString()} KM`}</h3>
      </div>
    </Card>
  </div>
);
