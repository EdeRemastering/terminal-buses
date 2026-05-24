import { User } from 'lucide-react';
import { Button } from '@/common/components/ui/button';

interface DriversEmptyStateProps {
  onReset: () => void;
}

export const DriversEmptyState = ({ onReset }: DriversEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
      <User className="w-12 h-12 text-muted-foreground/50" />
    </div>
    <div>
      <h3 className="text-xl font-bold">No se encontraron conductores</h3>
      <p className="text-muted-foreground max-w-xs mx-auto">Prueba restableciendo los filtros o la búsqueda.</p>
    </div>
    <Button onClick={onReset} className="rounded-xl">
      Restablecer Filtros
    </Button>
  </div>
);
