import { Plus } from 'lucide-react';
import { Button } from '@/common/components/ui/button';

interface RoutesPageHeaderProps {
  onCreateClick: () => void;
}

export const RoutesPageHeader = ({ onCreateClick }: RoutesPageHeaderProps) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Rutas Conectadas</h1>
      <p className="text-muted-foreground mt-1">Planificación de trayectos, paradas intermedias y tarifas de viaje</p>
    </div>
    <Button onClick={onCreateClick} className="rounded-xl shadow-lg shadow-primary/20 h-11 px-6">
      <Plus className="w-4 h-4 mr-2" />
      Nueva Ruta
    </Button>
  </div>
);
