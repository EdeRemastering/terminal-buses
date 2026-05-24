import { Mail, Phone, FileText, Award, Calendar, MoreVertical, Trash2, UserCheck, UserX, Clock } from 'lucide-react';
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
import type { Passenger } from '@/modules/passengers/types';

interface PassengerCardProps {
  passenger: Passenger;
  onToggleStatus: (id: string, status: Passenger['status']) => void;
  onDelete: (id: string) => void;
  onAssignPoints?: (passenger: Passenger) => void;
}

export const PassengerCard = ({ passenger: p, onToggleStatus, onDelete, onAssignPoints }: PassengerCardProps) => {
  return (
    <Card className="group relative border-none shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden bg-card/85 backdrop-blur-sm p-6 flex flex-col justify-between h-full">
      <div className={cn(
        "absolute top-0 left-0 w-1.5 h-full transition-colors",
        p.status === 'ACTIVE' ? 'bg-primary/20 group-hover:bg-primary' : 'bg-rose-500'
      )} />

      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
              p.frequentTravelerPoints >= 1000
                ? "bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 ring-2 ring-violet-500/20"
                : "bg-primary/10 text-primary"
            )}>
              {p.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">{p.name}</h3>
                {p.frequentTravelerPoints >= 1000 && (
                  <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 hover:bg-violet-100 border-none rounded-md px-1.5 py-0">
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                <FileText className="w-3.5 h-3.5" /> ID: {p.documentId}
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
              <DropdownMenuItem className="rounded-lg gap-2" onClick={() => onAssignPoints?.(p)}>
                <Award className="w-4 h-4" /> Asignar Puntos
              </DropdownMenuItem>
              {p.status === 'ACTIVE' ? (
                <DropdownMenuItem
                  onClick={() => onToggleStatus(p.id, 'INACTIVE')}
                  className="rounded-lg text-rose-600 dark:text-rose-400 gap-2 font-medium"
                >
                  <UserX className="w-4 h-4" /> Desactivar Cliente
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => onToggleStatus(p.id, 'ACTIVE')}
                  className="rounded-lg text-emerald-600 dark:text-emerald-400 gap-2 font-medium"
                >
                  <UserCheck className="w-4 h-4" /> Activar Cliente
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(p.id)}
                className="rounded-lg text-rose-600 dark:text-rose-400 gap-2 font-medium focus:bg-rose-50 dark:focus:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4" /> Eliminar Registro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 py-3 border-t border-muted/30 text-sm text-muted-foreground font-medium">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-muted-foreground/70" />
            <span>{p.email}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-muted-foreground/70" />
            <span>{p.phone}</span>
          </div>
          {p.frequentTravelerPoints > 0 && (
            <div className="flex items-center gap-2.5 text-violet-600 dark:text-violet-400 font-bold">
              <Award className="w-4 h-4 text-violet-500" />
              <span>{p.frequentTravelerPoints} Puntos del Club</span>
            </div>
          )}
        </div>
      </div>

      {p.upcomingTrip ? (
        <div className="mt-4 bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Próximo viaje</p>
              <p className="text-xs font-bold text-foreground">{p.upcomingTrip.route}</p>
            </div>
          </div>
          <Badge className="bg-primary/20 text-primary border-none shadow-none rounded-lg text-[10px]">
            {p.upcomingTrip.date}
          </Badge>
        </div>
      ) : p.lastTripDate ? (
        <div className="mt-4 bg-muted/40 rounded-2xl p-4 flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground/60" /> Último viaje:
          </span>
          <span className="font-semibold">{p.lastTripDate}</span>
        </div>
      ) : null}
    </Card>
  );
};
