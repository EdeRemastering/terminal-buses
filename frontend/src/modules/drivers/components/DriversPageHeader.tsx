import { Plus } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { PermissionGate } from '@/common/components/PermissionGate';

interface DriversPageHeaderProps {
  onCreateClick: () => void;
}

export const DriversPageHeader = ({ onCreateClick }: DriversPageHeaderProps) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Conductores Operacionales</h1>
      <p className="text-muted-foreground mt-1">Gestión de personal de conducción, licencias federales e historiales de viaje</p>
    </div>
    <PermissionGate permission="driver:create">
      <Button onClick={onCreateClick} className="rounded-xl shadow-lg shadow-primary/20 h-11 px-6">
        <Plus className="w-4 h-4 mr-2" />
        Registrar Conductor
      </Button>
    </PermissionGate>
  </div>
);
