import { motion } from 'framer-motion';
import {
  ChevronRight,
  Navigation,
  Clock,
  DollarSign,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  UserX
} from 'lucide-react';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/common/components/ui/dropdown-menu';
import { PermissionGate } from '@/common/components/PermissionGate';
import { cn, formatCurrency } from '@/common/utils';
import type { Route } from '@/modules/routes/schemas/routeSchema';

interface RouteCardProps {
  route: Route;
  onToggleStatus: (id: string, status: Route['status']) => void;
  onDelete: (id: string) => void;
  onEdit?: (route: Route) => void;
  index?: number;
}

export const RouteCard = ({ route, onToggleStatus, onDelete, onEdit, index = 0 }: RouteCardProps) => (
  <motion.div
    key={route.id}
    layout
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2, delay: index * 0.05 }}
  >
    <Card className="group relative border-none shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden bg-card/85 backdrop-blur-sm p-6 flex flex-col justify-between h-full">
      <div className={cn(
        "absolute top-0 left-0 w-1.5 h-full transition-colors",
        route.status === 'ACTIVE' ? 'bg-primary/20 group-hover:bg-primary' : 'bg-rose-500'
      )} />

      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase bg-muted/60 px-2 py-0.5 rounded-md">
              {route.id}
            </span>
            <h3 className="font-extrabold text-lg tracking-tight mt-2 flex items-center gap-1">
              {route.origin} <ChevronRight className="w-4 h-4 text-muted-foreground" /> {route.destination}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "rounded-lg border px-2.5 py-0.5 shadow-none text-xs font-bold",
                route.status === 'ACTIVE'
                  ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
              )}
            >
              {route.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/80">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl p-2">
                <PermissionGate permission="route:edit">
                  {route.status === 'ACTIVE' ? (
                    <DropdownMenuItem
                      onClick={() => onToggleStatus(route.id, 'INACTIVE')}
                      className="rounded-lg text-rose-600 dark:text-rose-400 gap-2 font-medium"
                    >
                      <UserX className="w-4 h-4" /> Desactivar Ruta
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => onToggleStatus(route.id, 'ACTIVE')}
                      className="rounded-lg text-emerald-600 dark:text-emerald-400 gap-2 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Activar Ruta
                    </DropdownMenuItem>
                  )}
                </PermissionGate>
                <PermissionGate permission="route:edit">
                  <DropdownMenuItem
                    onClick={() => onEdit?.(route)}
                    className="rounded-lg gap-2 font-medium"
                  >
                    <Pencil className="w-4 h-4" /> Editar Ruta
                  </DropdownMenuItem>
                </PermissionGate>
                <PermissionGate permission="route:delete">
                  <DropdownMenuItem
                    onClick={() => onDelete(route.id)}
                    className="rounded-lg text-rose-600 dark:text-rose-400 gap-2 font-medium focus:bg-rose-50 dark:focus:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar Ruta
                  </DropdownMenuItem>
                </PermissionGate>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 my-2 border-t border-muted/30 text-sm">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-muted-foreground/60" /> Distancia
            </p>
            <p className="text-xs font-semibold text-foreground">{route.distanceKm} KM</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground/60" /> Duración
            </p>
            <p className="text-xs font-semibold text-foreground">{route.durationHours} hrs</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-primary" /> Precio Base
            </p>
            <p className="text-xs font-semibold text-primary font-bold">{formatCurrency(route.basePrice)}</p>
          </div>
        </div>
      </div>

      {route.stops && route.stops.length > 0 && (
        <div className="mt-4 pt-3 border-t border-muted/20">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Escalas Intermedias</p>
          <div className="flex flex-wrap gap-1.5">
            {route.stops.map((stop, idx) => (
              <Badge key={idx} variant="secondary" className="rounded-lg text-[10px] px-2 py-0.5 bg-muted/60 border-none font-semibold">
                {stop}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  </motion.div>
);
