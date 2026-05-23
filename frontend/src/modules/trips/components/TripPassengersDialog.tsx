import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import type { Trip } from '@/modules/trips/types';

interface TripPassengersDialogProps {
  trip: Trip | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TripPassengersDialog = ({ trip, open, onOpenChange }: TripPassengersDialogProps) => {
  if (!trip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div>
                <DialogTitle className="text-xl font-bold">Pasajeros del Viaje</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {trip.origin} → {trip.destination}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6">
          <p className="text-sm text-muted-foreground">No hay pasajeros registrados para este viaje.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
