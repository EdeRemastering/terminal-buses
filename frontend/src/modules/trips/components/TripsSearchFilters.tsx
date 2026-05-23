import { useState } from 'react';
import { Search, Filter, Clock, X } from 'lucide-react';
import { Input } from '@/common/components/ui/input';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import { cn } from '@/common/utils';
import type { TripStatus } from '@/modules/trips/types';
import { statusConfig } from '@/modules/trips/components/tripStatusConfig';

interface TripsSearchFiltersProps {
  placeholder: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  statusFilter?: TripStatus | 'ALL';
  onStatusFilterChange?: (status: TripStatus | 'ALL') => void;
  dateFilter?: 'ALL' | 'TODAY' | 'WEEK';
  onDateFilterChange?: (filter: 'ALL' | 'TODAY' | 'WEEK') => void;
}

const allStatuses: (TripStatus | 'ALL')[] = ['ALL', 'PENDING', 'BOARDING', 'IN_PROGRESS', 'FINISHED', 'CANCELLED'];

export const TripsSearchFilters = ({
  placeholder,
  searchValue = '',
  onSearchChange,
  statusFilter = 'ALL',
  onStatusFilterChange,
  dateFilter = 'ALL',
  onDateFilterChange,
}: TripsSearchFiltersProps) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <Card className="p-4 border-none shadow-sm flex flex-col md:flex-row gap-4 items-center bg-card/50 backdrop-blur-sm">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-10 h-11 bg-background border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange?.('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <DropdownMenu open={searchOpen} onOpenChange={setSearchOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className={cn(
              "rounded-xl h-11 px-4",
              statusFilter !== 'ALL' ? "border-primary/40 bg-primary/5" : "border-dashed"
            )}>
              <Filter className="w-4 h-4 mr-2" />
              {statusFilter === 'ALL' ? 'Estado: Todos' : statusConfig[statusFilter].label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-xl p-2 min-w-[180px]">
            {allStatuses.map((s) => (
              <DropdownMenuItem
                key={s}
                className={cn("rounded-lg", s === statusFilter && "bg-primary/5 font-semibold")}
                onClick={() => { onStatusFilterChange?.(s); setSearchOpen(false); }}
              >
                {s === 'ALL' ? 'Todos' : statusConfig[s].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className={cn(
              "rounded-xl h-11 px-4",
              dateFilter !== 'ALL' ? "border-primary/40 bg-primary/5" : "border-dashed"
            )}>
              <Clock className="w-4 h-4 mr-2" />
              {dateFilter === 'ALL' ? 'Todas las fechas' : dateFilter === 'TODAY' ? 'Hoy' : 'Esta semana'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-xl p-2 min-w-[180px]">
            <DropdownMenuItem className="rounded-lg" onClick={() => onDateFilterChange?.('ALL')}>Todas las fechas</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg" onClick={() => onDateFilterChange?.('TODAY')}>Hoy</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg" onClick={() => onDateFilterChange?.('WEEK')}>Esta semana</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
