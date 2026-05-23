import { AlertTriangle } from 'lucide-react';
import { Button } from '@/common/components/ui/button';

interface BusesErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const BusesErrorState = ({ message, onRetry }: BusesErrorStateProps) => (
  <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
    <div className="p-4 bg-destructive/10 text-destructive rounded-full">
      <AlertTriangle className="w-12 h-12 text-red-500" />
    </div>
    <h2 className="text-xl font-bold">Error al cargar la flota</h2>
    <p className="text-muted-foreground">{message}</p>
    {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
  </div>
);
