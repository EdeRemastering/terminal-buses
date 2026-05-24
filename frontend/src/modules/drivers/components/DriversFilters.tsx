import { Search } from 'lucide-react';
import { Card } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { cn } from '@/common/utils';

interface DriversFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'ON_TRIP', label: 'En Ruta' },
  { value: 'OFF_DUTY', label: 'Descanso' },
];

export const DriversFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: DriversFiltersProps) => (
  <Card className="p-4 border-none shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-sm">
    <div className="relative w-full md:w-96">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por nombre, licencia o email..."
        className="pl-10 h-11 bg-background border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
      />
    </div>
    <div className="flex items-center gap-2 bg-background p-1 rounded-xl shadow-inner border border-muted/20 w-full md:w-auto">
      {STATUS_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onStatusFilterChange(value)}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex-1 md:flex-none text-center",
            statusFilter === value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  </Card>
);
