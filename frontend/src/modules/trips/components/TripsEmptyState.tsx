import { Bus as BusIcon } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { PermissionGate } from '@/common/components/PermissionGate';

interface TripsEmptyStateProps {
  onCreateClick?: () => void;
}

export const TripsEmptyState = ({ onCreateClick }: TripsEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
      <BusIcon className="w-12 h-12 text-muted-foreground/50" />
    </div>
    <div>
      <h3 className="text-xl font-bold">No hay viajes programados</h3>
      <p className="text-muted-foreground max-w-xs mx-auto">Comienza programando una nueva ruta para hoy.</p>
    </div>
    <PermissionGate permission="trip:create">
      <Button className="rounded-xl" onClick={onCreateClick}>Programar Primer Viaje</Button>
    </PermissionGate>
  </div>
);
