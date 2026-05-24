import { User } from 'lucide-react';
import { Button } from '@/common/components/ui/button';

interface PassengersEmptyStateProps {
  onResetFilters: () => void;
}

export const PassengersEmptyState = ({ onResetFilters }: PassengersEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
        <User className="w-12 h-12 text-muted-foreground/50" />
      </div>
      <div>
        <h3 className="text-xl font-bold">No se encontraron pasajeros</h3>
        <p className="text-muted-foreground max-w-xs mx-auto">Ajusta la búsqueda o restablece los filtros.</p>
      </div>
      <Button onClick={onResetFilters} className="rounded-xl">
        Restablecer Filtros
      </Button>
    </div>
  );
};
