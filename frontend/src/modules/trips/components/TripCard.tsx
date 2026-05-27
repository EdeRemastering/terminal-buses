import { motion } from 'framer-motion';
import { MapPin, Bus as BusIcon, Users, MoreVertical, ArrowRight, Play, CheckCircle2, DoorOpen } from 'lucide-react';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import { PermissionGate } from '@/common/components/PermissionGate';
import { cn, formatCurrency } from '@/common/utils';
import type { Trip, TripStatus } from '@/modules/trips/types';
import { statusConfig } from '@/modules/trips/components/tripStatusConfig';

const statusTransitions: Record<TripStatus, { status: TripStatus; label: string; icon: typeof Play }[] | null> = {
  PENDING: [{ status: 'BOARDING', label: 'Iniciar Abordaje', icon: DoorOpen }],
  BOARDING: [{ status: 'IN_PROGRESS', label: 'Iniciar Viaje', icon: Play }],
  IN_PROGRESS: [{ status: 'FINISHED', label: 'Finalizar Viaje', icon: CheckCircle2 }],
  FINISHED: null,
  CANCELLED: null,
};

const canCancel = (status: TripStatus) => status === 'PENDING' || status === 'BOARDING' || status === 'IN_PROGRESS';

interface TripCardProps {
  trip: Trip;
  index: number;
  onManage?: (trip: Trip) => void;
  onEdit?: (trip: Trip) => void;
  onCancel?: (trip: Trip) => void;
  onStatusChange?: (trip: Trip, status: TripStatus) => void;
}

export const TripCard = ({ trip, index, onManage, onEdit, onCancel, onStatusChange }: TripCardProps) => {
  const transitions = statusTransitions[trip.status];
  return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
    <Card className="group border-none shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative bg-card/80 backdrop-blur-sm">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors" />

      <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-8">
        <div className="flex items-center gap-6 min-w-[300px]">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xl font-black">{new Date(trip.departureTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            <div className="w-0.5 h-8 bg-muted-foreground/20 rounded-full" />
            <span className="text-sm text-muted-foreground font-medium">{new Date(trip.arrivalTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-lg">{trip.origin}</h3>
            </div>
            <div className="flex items-center gap-2 px-1 text-muted-foreground/30">
              <div className="w-0.5 h-3 bg-current rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-bold text-lg text-muted-foreground">{trip.destination}</h3>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Unidad</p>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-muted rounded-lg">
                <BusIcon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm">{trip.busId}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Ocupación</p>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-muted rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{trip.capacity != null ? trip.capacity - trip.availableSeats : '?'} / {trip.capacity ?? '?'}</span>
                <div className="w-24 h-1 bg-muted rounded-full mt-1">
                  {trip.capacity != null && (
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${trip.capacity > 0 ? ((trip.capacity - trip.availableSeats) / trip.capacity) * 100 : 0}%`,
                        backgroundColor: trip.availableSeats < trip.capacity * 0.2
                          ? 'var(--color-emerald-500)'
                          : trip.availableSeats < trip.capacity * 0.5
                            ? 'var(--color-amber-500)'
                            : 'var(--color-red-500)'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Estado</p>
            <Badge
              variant="outline"
              className={cn(
                "rounded-lg border shadow-none px-3 py-1",
                statusConfig[trip.status].color
              )}
            >
              {statusConfig[trip.status].label}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 lg:border-l lg:pl-8">
          <div className="text-right mr-4 hidden sm:block">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Precio</p>
            <p className="text-lg font-black text-primary">{formatCurrency(trip.price)}</p>
          </div>

          <PermissionGate permission="trip:manage-passengers">
            <Button variant="secondary" className="rounded-xl font-bold px-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all" onClick={() => onManage?.(trip)}>
              Gestionar
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </PermissionGate>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-2">
              {transitions?.map(t => {
                const Icon = t.icon;
                return (
                  <PermissionGate key={t.status} permission="trip:edit">
                    <DropdownMenuItem className="rounded-lg" onClick={() => onStatusChange?.(trip, t.status)}>
                      <Icon className="w-4 h-4 mr-2" />
                      {t.label}
                    </DropdownMenuItem>
                  </PermissionGate>
                );
              })}
              {transitions && <DropdownMenuSeparator className="my-1" />}
              {trip.status === 'PENDING' && (
                <PermissionGate permission="trip:edit">
                  <DropdownMenuItem className="rounded-lg" onClick={() => onEdit?.(trip)}>Editar Viaje</DropdownMenuItem>
                </PermissionGate>
              )}
              {canCancel(trip.status) && (
                <PermissionGate permission="trip:delete">
                  <DropdownMenuItem className="rounded-lg text-destructive" onClick={() => onCancel?.(trip)}>Cancelar Viaje</DropdownMenuItem>
                </PermissionGate>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      </Card>
    </motion.div>
  );
};
