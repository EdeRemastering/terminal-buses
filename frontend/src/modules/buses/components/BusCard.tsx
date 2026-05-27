import { motion } from 'framer-motion';
import {
  Bus as BusIcon,
  Gauge,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  Hash,
  Users,
  Clock
} from 'lucide-react';
import { Badge } from '@/common/components/ui/badge';
import { Card } from '@/common/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/common/components/ui/dropdown-menu';
import { Button } from '@/common/components/ui/button';
import { PermissionGate } from '@/common/components/PermissionGate';
import { cn } from '@/common/utils';
import type { Bus } from '@/modules/buses/types';
import { statusConfig, typeLabels, busStatusOptions } from '@/modules/buses/components/busConfig';

interface BusCardProps {
  bus: Bus;
  onToggleStatus: (id: string, status: Bus['status']) => void;
  onDelete: (id: string) => void;
  onEdit?: (bus: Bus) => void;
  onViewHistory?: (bus: Bus) => void;
}

export const BusCard = ({ bus, onToggleStatus, onDelete, onEdit, onViewHistory }: BusCardProps) => {
  const status = statusConfig[bus.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="group relative border-none shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden bg-card/85 backdrop-blur-sm p-6 flex flex-col h-full justify-between">
        <div className={cn(
          "absolute top-0 left-0 w-full h-1.5 transition-colors",
          bus.status === 'OPERATIONAL' ? 'bg-emerald-500' :
          bus.status === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-rose-500'
        )} />

        <div>
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <BusIcon className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-lg tracking-tight">{bus.id}</h3>
              </div>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{bus.model}</p>
            </div>
            <Badge
              variant="outline"
              className={cn("rounded-lg border px-2.5 py-0.5 shadow-none text-xs font-bold flex items-center gap-1", status.color)}
            >
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </Badge>
          </div>

        <div className="grid grid-cols-2 gap-4 py-4 my-2 border-y border-muted/30">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Hash className="w-3 h-3" /> Placa
              </p>
              <p className="text-sm font-semibold text-foreground">{bus.plate}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" /> Capacidad
              </p>
              <p className="text-sm font-semibold text-foreground">{bus.capacity} Asientos</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3 h-3" /> Recorrido
              </p>
              <p className="text-sm font-semibold text-foreground">{bus.mileage.toLocaleString()} KM</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Mantenimiento
              </p>
              <p className="text-sm font-semibold text-foreground">{bus.lastMaintenance}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-2">
          <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase bg-muted/60 px-2 py-1 rounded-md">
            {typeLabels[bus.type]}
          </span>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/80">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl p-2">
                <PermissionGate permission="bus:edit">
                  <DropdownMenuItem
                    onClick={() => onEdit?.(bus)}
                    className="rounded-lg gap-2 font-medium"
                  >
                    <Pencil className="w-4 h-4" /> Editar Unidad
                  </DropdownMenuItem>
                </PermissionGate>
                <DropdownMenuItem
                  onClick={() => onViewHistory?.(bus)}
                  className="rounded-lg gap-2 font-medium"
                >
                  <Clock className="w-4 h-4" /> Ver Historial
                </DropdownMenuItem>
                <PermissionGate permission="bus:edit">
                  {busStatusOptions
                    .filter(opt => opt.value !== bus.status)
                    .map(opt => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => onToggleStatus(bus.id, opt.value)}
                        className={`rounded-lg ${opt.className} gap-2 font-medium`}
                      >
                        <opt.icon className="w-4 h-4" /> {opt.label}
                      </DropdownMenuItem>
                    ))}
                </PermissionGate>
                <PermissionGate permission="bus:delete">
                  <DropdownMenuItem
                    onClick={() => onDelete(bus.id)}
                    className="rounded-lg text-rose-600 dark:text-rose-400 gap-2 font-medium focus:bg-rose-50 dark:focus:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar Unidad
                  </DropdownMenuItem>
                </PermissionGate>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
