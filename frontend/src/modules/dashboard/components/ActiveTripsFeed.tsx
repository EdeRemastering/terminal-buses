import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { Separator } from '@/common/components/ui/separator';
import { cn } from '@/common/utils';
import type { RecentTrip } from '@/modules/dashboard/types';

interface ActiveTripsFeedProps {
  trips: RecentTrip[];
  operationalNotice?: string;
}

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  PENDING: { color: 'bg-amber-500', dot: 'bg-amber-500', label: 'Pendiente' },
  BOARDING: { color: 'bg-emerald-500', dot: 'bg-emerald-500', label: 'Abordando' },
  IN_PROGRESS: { color: 'bg-blue-500', dot: 'bg-blue-500 animate-pulse', label: 'En Curso' },
  FINISHED: { color: 'bg-gray-400', dot: 'bg-gray-400', label: 'Finalizado' },
  CANCELLED: { color: 'bg-red-500', dot: 'bg-red-500', label: 'Cancelado' },
};

const statusProgress: Record<string, number> = {
  PENDING: 10,
  BOARDING: 30,
  IN_PROGRESS: 65,
  FINISHED: 100,
  CANCELLED: 0,
};

export const ActiveTripsFeed = ({ trips, operationalNotice }: ActiveTripsFeedProps) => {
  const navigate = useNavigate();

  const displayTrips = trips.slice(0, 5);

  return (
    <Card className="p-6 border-none shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">Viajes Recientes</h3>
        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5" onClick={() => navigate('/trips')}>Ver todos</Button>
      </div>
      {displayTrips.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No hay viajes registrados</p>
      ) : (
        <div className="space-y-6">
          {displayTrips.map((trip) => {
            const config = statusConfig[trip.status] ?? { color: 'bg-gray-400', dot: 'bg-gray-400', label: trip.status };
            const progress = statusProgress[trip.status] ?? 0;
            const departureTime = new Date(trip.departure_time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={trip.id} className="group cursor-pointer" onClick={() => navigate('/trips')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", config.dot)} />
                    <span className="font-semibold text-sm">{trip.origin} → {trip.destination}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{departureTime}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>Bus: {trip.bus_code}</span>
                  <Badge variant="outline" className="text-[10px] py-0 border-muted-foreground/20">
                    {config.label}
                  </Badge>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", config.color)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Separator className="my-6" />

      <div className="bg-primary/5 rounded-2xl p-4 flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">Aviso Operacional</p>
          <p className="text-xs text-primary/70">{operationalNotice ?? 'Sin avisos operacionales.'}</p>
        </div>
      </div>
    </Card>
  );
};
