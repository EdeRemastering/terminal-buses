import { Clock, Download } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import type { DashboardStats } from '@/modules/dashboard/types';

interface DashboardHeaderProps {
  stats: DashboardStats | null | undefined;
}

export const DashboardHeader = ({ stats }: DashboardHeaderProps) => {
  const now = new Date();

  const handleDownloadReport = () => {
    const content = [
      '=== Reporte de Operaciones ===',
      `Generado: ${now.toLocaleString('es-CO')}`,
      '',
      `Buses Operativos: ${stats?.totalBuses ?? 0}`,
      `Viajes Hoy: ${stats?.tripsToday ?? 0}`,
      `Pasajeros Activos: ${stats?.totalPassengers ?? 0}`,
      `Conductores Disponibles: ${stats?.availableDrivers ?? 0}`,
      `Ocupación Promedio: ${stats?.avgOccupancy ?? 0}%`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-terminal-${now.toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Centro de Control</h1>
        <p className="text-muted-foreground mt-1">Monitoreo en tiempo real de la terminal</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="rounded-xl border-dashed">
          <Clock className="w-4 h-4 mr-2" />
          {now.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Button>
        <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={handleDownloadReport}>
          <Download className="w-4 h-4 mr-2" />
          Descargar Reporte
        </Button>
      </div>
    </div>
  );
};
