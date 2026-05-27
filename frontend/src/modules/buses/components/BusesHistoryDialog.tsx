import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Route as RouteIcon, Calendar, Clock, Bus as BusIcon, User, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Badge } from '@/common/components/ui/badge';
import { cn } from '@/common/utils';
import { useBusTrips } from '@/modules/buses/hooks/useBusTrips';
import type { Bus } from '@/modules/buses/types';

interface BusesHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bus: Bus | null;
}

export const BusesHistoryDialog = ({ open, onOpenChange, bus }: BusesHistoryDialogProps) => {
  const { data: trips, isLoading } = useBusTrips(bus?.id ?? null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden max-h-[80vh]">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />

        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <BusIcon className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Historial de Viajes</DialogTitle>
                <DialogDescription>
                  {bus?.plate} &middot; {bus?.model}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4 space-y-3 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : trips && trips.length > 0 ? (
            <AnimatePresence>
              {trips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 rounded-xl bg-muted/30 border border-muted/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {trip.origin} &rarr; {trip.destination}
                    </div>
                    <Badge variant="outline" className={cn(
                      "rounded-lg border-none text-[10px] font-bold",
                      trip.status === 'FINISHED' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700' :
                      trip.status === 'CANCELLED' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700' :
                      trip.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700' :
                      'bg-slate-100 dark:bg-slate-500/10 text-slate-700'
                    )}>
                      {trip.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(trip.departureTime).toLocaleDateString('es-CO')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {new Date(trip.departureTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RouteIcon className="w-3 h-3" />
                      {trip.routeName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      {trip.driverName || 'Sin conductor'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BusIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-medium">Sin viajes registrados</p>
              <p className="text-sm">Este bus no tiene viajes en su historial.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
