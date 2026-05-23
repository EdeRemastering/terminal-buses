import { Search, Filter } from 'lucide-react';
import { Input } from '@/common/components/ui/input';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/common/components/ui/dropdown-menu';
import { cn } from '@/common/utils';
import { typeLabels } from '@/modules/buses/components/busConfig';

interface BusesFiltersPanelProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
}

const statuses = ['ALL', 'OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE'] as const;

const statusLabels: Record<string, string> = {
  ALL: 'Todos',
  OPERATIONAL: 'Operativo',
  MAINTENANCE: 'Taller',
  OUT_OF_SERVICE: 'Inactivo'
};

export const BusesFiltersPanel = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange
}: BusesFiltersPanelProps) => (
  <Card className="p-4 border-none shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-sm">
    <div className="relative w-full lg:w-96">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por ID, placa o modelo..."
        className="pl-10 h-11 bg-background border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
      />
    </div>
    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
      <div className="flex items-center gap-1.5 bg-background p-1 rounded-xl shadow-inner border border-muted/20">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => onStatusFilterChange(status)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              statusFilter === status
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-xl h-11 px-4 border-dashed bg-background">
            <Filter className="w-4 h-4 mr-2" />
            Tipo: {typeFilter === 'ALL' ? 'Todos' : typeLabels[typeFilter]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-xl p-2" align="end">
          <DropdownMenuItem onClick={() => onTypeFilterChange('ALL')} className="rounded-lg">Todos</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTypeFilterChange('LUXURY')} className="rounded-lg">De Lujo</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTypeFilterChange('EXPRESS')} className="rounded-lg">Exprés</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTypeFilterChange('STANDARD')} className="rounded-lg">Estándar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </Card>
);
