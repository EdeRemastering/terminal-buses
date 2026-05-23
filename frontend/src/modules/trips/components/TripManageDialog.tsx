import { motion } from 'framer-motion';
import { MapPin, Bus as BusIcon, Clock, DollarSign, Calendar } from 'lucide-react';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Separator } from '@/common/components/ui/separator';
import { cn } from '@/common/utils';
import type { Trip } from '@/modules/trips/types';
import { statusConfig } from '@/modules/trips/components/tripStatusConfig';


interface TripManageDialogProps {
  trip: Trip | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (trip: Trip) => void;
  onViewPassengers: (trip: Trip) => void;
  onCancel: (trip: Trip) => void;
}

export const TripManageDialog = ({ trip, open, onOpenChange, onEdit, onViewPassengers, onCancel }: TripManageDialogProps) => {
  if (!trip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className={cn(
          "absolute top-0 left-0 w-full h-1.5 transition-colors",
          statusConfig[trip.status].color.split(' ')[0]
        )} />

        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">
                    {trip.origin} → {trip.destination}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Gestión del viaje
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn("rounded-lg border shadow-none px-3 py-1", statusConfig[trip.status].color)}
              >
                {statusConfig[trip.status].label}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 border-none bg-muted/30 space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Fecha
              </p>
              <p className="font-bold text-sm">{new Date(trip.departureTime).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}</p>
            </Card>
            <Card className="p-4 border-none bg-muted/30 space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Horario
              </p>
              <p className="font-bold text-sm">{new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </Card>
            <Card className="p-4 border-none bg-muted/30 space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
                <BusIcon className="w-3 h-3" /> Unidad
              </p>
              <p className="font-bold text-sm">{trip.busId}</p>
            </Card>
            <Card className="p-4 border-none bg-muted/30 space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Precio
              </p>
              <p className="font-bold text-sm">${trip.price}</p>
            </Card>
          </div>

          <Separator />

          {(trip.status === 'PENDING' || trip.status === 'BOARDING') && (
            <>
              <Separator />
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" className="rounded-xl" onClick={() => { onEdit(trip); onOpenChange(false); }}>
                  Editar Viaje
                </Button>
                <Button variant="destructive" className="rounded-xl" onClick={() => { onCancel(trip); onOpenChange(false); }}>
                  Cancelar Viaje
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
