import { Bus, MapPin, Users, Clock, Route as RouteIcon, Calendar, DollarSign, CheckCircle2, Navigation } from 'lucide-react';
import { Card } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import { cn, formatCurrency } from '@/common/utils';
import type { DriverInfo } from '@/modules/drivers/api/getMyDriverInfo';

interface DriverDashboardProps {
  driverInfo: DriverInfo | null;
}

export const DriverDashboard = ({ driverInfo }: DriverDashboardProps) => {
  if (!driverInfo) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No se pudo cargar la información del conductor.</p>
        </Card>
      </div>
    );
  }

  const currentTrip = driverInfo.currentTrip;

  return (
    <div className="container mx-auto p-6 space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Bienvenido, {driverInfo.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {driverInfo.code} &middot; {driverInfo.licenseType}
        </p>
      </div>

      {currentTrip ? (
        <>
          <Card className="relative border-none shadow-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 p-6">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Viaje Activo</h2>
                <p className="text-sm text-muted-foreground">{currentTrip.code}</p>
              </div>
              <Badge className="ml-auto rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-none font-bold">
                {currentTrip.status === 'IN_PROGRESS' ? 'En Curso' : currentTrip.status === 'BOARDING' ? 'Abordando' : 'Pendiente'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{currentTrip.origin}</span>
                  <Navigation className="w-3 h-3 text-muted-foreground" />
                  <span className="font-semibold">{currentTrip.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RouteIcon className="w-4 h-4" />
                  <span>{currentTrip.routeName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bus className="w-4 h-4" />
                  <span>Bus: {currentTrip.busCode}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Salida: {new Date(currentTrip.departureTime).toLocaleString('es-CO')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Llegada: {new Date(currentTrip.arrivalTime).toLocaleString('es-CO')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatCurrency(currentTrip.price)} por pasajero</span>
                </div>
              </div>
            </div>
          </Card>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Pasajeros Asignados</h2>
              <Badge variant="outline" className="rounded-lg ml-auto">
                {currentTrip.passengers?.length ?? 0} / {currentTrip.capacity}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentTrip.passengers && currentTrip.passengers.length > 0 ? (
                currentTrip.passengers.map((p) => (
                  <Card key={p.id} className="p-4 border-none shadow-sm bg-card/85 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.document_id}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {p.seat_number ? <p className="font-medium">Asiento {p.seat_number}</p> : <p>Sin asiento</p>}
                        {p.checked_in && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto mt-1" />}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-full">No hay pasajeros asignados aún.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <Card className="p-8 text-center border-none shadow-sm bg-card/85 backdrop-blur-sm">
          <Bus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-bold text-lg mb-1">Sin Viaje Activo</h2>
          <p className="text-sm text-muted-foreground">No tienes ningún viaje asignado en este momento.</p>
        </Card>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Historial de Viajes</h2>
          <Badge variant="outline" className="rounded-lg ml-auto">
            {driverInfo.completedTrips} completados
          </Badge>
        </div>
        <div className="space-y-2">
          {driverInfo.history && driverInfo.history.length > 0 ? (
            driverInfo.history.map((trip) => (
              <Card key={trip.id} className="p-4 border-none shadow-sm bg-card/85 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <RouteIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{trip.origin} &rarr; {trip.destination}</p>
                      <p className="text-xs text-muted-foreground">{trip.code} &middot; {trip.routeName}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{new Date(trip.departureTime).toLocaleDateString('es-CO')}</p>
                    <Badge variant="outline" className={cn(
                      "mt-1 rounded-lg border-none text-[10px] font-bold",
                      trip.status === 'FINISHED' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700' :
                      trip.status === 'CANCELLED' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700' :
                      'bg-blue-100 dark:bg-blue-500/10 text-blue-700'
                    )}>
                      {trip.status === 'FINISHED' ? 'Finalizado' : trip.status === 'CANCELLED' ? 'Cancelado' : trip.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No hay historial de viajes.</p>
          )}
        </div>
      </div>
    </div>
  );
};
