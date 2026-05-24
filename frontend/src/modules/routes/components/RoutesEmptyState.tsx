import { Route as RouteIcon } from 'lucide-react';
import { Button } from '@/common/components/ui/button';

interface RoutesEmptyStateProps {
  onReset: () => void;
}

export const RoutesEmptyState = ({ onReset }: RoutesEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
      <RouteIcon className="w-12 h-12 text-muted-foreground/50" />
    </div>
    <div>
      <h3 className="text-xl font-bold">No se encontraron rutas</h3>
      <p className="text-muted-foreground max-w-xs mx-auto">Prueba cambiando la búsqueda o los filtros.</p>
    </div>
    <Button onClick={onReset} className="rounded-xl">
      Restablecer Filtros
    </Button>
  </div>
);
