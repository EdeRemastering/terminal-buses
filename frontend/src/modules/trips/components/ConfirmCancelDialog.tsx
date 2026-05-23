import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { useCancelTrip } from '@/modules/trips/hooks/useCancelTrip';
import type { Trip } from '@/modules/trips/types';

interface ConfirmCancelDialogProps {
  trip: Trip | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ConfirmCancelDialog = ({ trip, open, onOpenChange }: ConfirmCancelDialogProps) => {
  const { mutate, isPending } = useCancelTrip();

  if (!trip) return null;

  const handleConfirm = () => {
    mutate(trip.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader>
            <div className="flex flex-col items-center text-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Cancelar Viaje</DialogTitle>
                <DialogDescription className="text-sm">
                  ¿Estás seguro de cancelar el viaje <strong>{trip.origin} → {trip.destination}</strong>?
                  <br />
                  Esta acción notificará a los pasajeros registrados y no se puede deshacer.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 bg-muted/40 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fecha</span>
              <span className="font-semibold">{new Date(trip.departureTime).toLocaleDateString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Horario</span>
              <span className="font-semibold">
                {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unidad</span>
              <span className="font-semibold">{trip.busId}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-11 px-5"
              disabled={isPending}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isPending}
              className="rounded-xl h-11 px-6 min-w-[140px]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelando...
                </span>
              ) : (
                'Sí, Cancelar Viaje'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
