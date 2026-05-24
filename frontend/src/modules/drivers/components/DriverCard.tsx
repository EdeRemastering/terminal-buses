import { motion } from 'framer-motion';
import {
  FileText,
  Phone,
  Star,
  Calendar,
  Briefcase,
  Award,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Bus as BusIcon,
  UserX,
} from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { Card } from '@/common/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import { cn } from '@/common/utils';
import { availabilityConfig } from './driverConfig';
import type { Driver } from '@/modules/drivers/types';

interface DriverCardProps {
  driver: Driver;
  index?: number;
  onToggleAvailability: (id: string, availability: Driver['availability']) => void;
  onDelete: (id: string) => void;
}

export const DriverCard = ({ driver, index = 0, onToggleAvailability, onDelete }: DriverCardProps) => {
  const availability = availabilityConfig[driver.availability];
  const StatusIcon = availability.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Card className="group relative border-none shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden bg-card/85 backdrop-blur-sm p-6 flex flex-col justify-between h-full">
        <div className={cn(
          "absolute top-0 left-0 w-full h-1.5 transition-colors",
          driver.availability === 'AVAILABLE' ? 'bg-emerald-500' :
          driver.availability === 'ON_TRIP' ? 'bg-blue-500' : 'bg-slate-400'
        )} />

        <div>
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {driver.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight">{driver.name}</h3>
                <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground/80" /> {driver.licenseNumber}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl p-2">
                <DropdownMenuItem
                  onClick={() => onToggleAvailability(driver.id, 'AVAILABLE')}
                  className="rounded-lg text-emerald-600 dark:text-emerald-400 gap-2 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4" /> Marcar Disponible
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onToggleAvailability(driver.id, 'ON_TRIP')}
                  className="rounded-lg text-blue-600 dark:text-blue-400 gap-2 font-medium"
                >
                  <BusIcon className="w-4 h-4" /> Asignar a Ruta
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onToggleAvailability(driver.id, 'OFF_DUTY')}
                  className="rounded-lg text-slate-600 dark:text-slate-400 gap-2 font-medium"
                >
                  <UserX className="w-4 h-4" /> Poner en Descanso
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(driver.id)}
                  className="rounded-lg text-rose-600 dark:text-rose-400 gap-2 font-medium focus:bg-rose-50 dark:focus:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar Conductor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-muted/30 text-sm my-3">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground/60" /> Categoría
              </p>
              <p className="text-xs font-semibold text-foreground">{driver.licenseType}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" /> Vencimiento
              </p>
              <p className="text-xs font-semibold text-foreground">{driver.licenseExpiration}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500" /> Calificación
              </p>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                {driver.rating} / 5.0
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-muted-foreground/60" /> Viajes Totales
              </p>
              <p className="text-xs font-semibold text-foreground">{driver.completedTrips} completados</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground/70" />
            <span>{driver.phone}</span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted/20">
            <Badge
              variant="outline"
              className={cn("rounded-lg border px-2.5 py-0.5 shadow-none text-[10px] font-bold flex items-center gap-1", availability.color)}
            >
              <StatusIcon className="w-3 h-3" />
              {availability.label}
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
