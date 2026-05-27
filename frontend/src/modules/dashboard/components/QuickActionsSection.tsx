import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowUpRight, Bus, ChevronRight } from 'lucide-react';
import { Card } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';

import type { DashboardStats } from '@/modules/dashboard/types';

interface QuickActionsSectionProps {
  stats: DashboardStats | undefined;
}

export const QuickActionsSection = ({ stats }: QuickActionsSectionProps) => {
  const navigate = useNavigate();

  const busCount = stats?.totalBuses ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card className="p-6 border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110">
          <MapPin className="w-24 h-24" />
        </div>
        <h4 className="text-xl font-bold mb-2">Optimización de Rutas</h4>
        <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Analiza el rendimiento de tus rutas y optimiza los tiempos de llegada.</p>
        <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold" onClick={() => navigate('/routes')}>
          Explorar Mapas
          <ArrowUpRight className="ml-2 w-4 h-4" />
        </Button>
      </Card>

      <Card className="p-6 border-none shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold">Estado de Flota</h4>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex -space-x-3 overflow-hidden">
            {Array.from({ length: Math.min(busCount, 4) }).map((_, i) => (
              <div key={i} className="inline-block h-10 w-10 rounded-xl ring-2 ring-background bg-muted flex items-center justify-center">
                <Bus className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
            {busCount > 4 && (
              <div className="inline-block h-10 w-10 rounded-xl ring-2 ring-background bg-primary flex items-center justify-center text-xs font-bold text-white">
                +{busCount - 4}
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            {busCount} buses operativos
          </span>
        </div>
        <Button variant="outline" className="w-full rounded-xl" onClick={() => navigate('/buses')}>Gestionar Flota</Button>
      </Card>

      <Card className="p-6 border-none shadow-sm">
        <h4 className="font-bold mb-4">Próximas Salidas</h4>
        <div className="space-y-4">
          {(stats?.recentTrips ?? []).slice(0, 2).map((trip) => {
            const departureTime = new Date(trip.departure_time);
            const minutesUntil = Math.round((departureTime.getTime() - Date.now()) / 60000);

            return (
              <div key={trip.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/trips')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                    {minutesUntil > 0 ? minutesUntil : '0'}
                    <span className="text-[8px] ml-0.5">MIN</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{trip.destination}</p>
                    <p className="text-[10px] text-muted-foreground">Bus {trip.bus_code}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            );
          })}
          {(stats?.recentTrips ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No hay viajes próximos</p>
          )}
        </div>
      </Card>
    </div>
  );
};
