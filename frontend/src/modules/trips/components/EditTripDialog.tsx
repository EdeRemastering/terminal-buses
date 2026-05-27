import { useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Search, Clock, CalendarIcon, Map, Bus as BusIcon, User, DollarSign, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover';
import { Calendar } from '@/common/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { cn, formatCurrency } from '@/common/utils';
import { CurrencyInput } from '@/common/components/ui/currency-input';
import { BaseFormDialog } from '@/common/components/BaseFormDialog';
import { useFormDialog } from '@/common/hooks/useFormDialog';
import { createTripSchema, type TripFormData } from '@/modules/trips/schemas/tripSchema';
import { useEditTrip } from '@/modules/trips/hooks/useEditTrip';
import { useRoutes } from '@/modules/routes/hooks/useRoutes';
import { useBuses } from '@/modules/buses/hooks/useBuses';
import { useDrivers } from '@/modules/drivers/hooks/useDrivers';
import type { Route } from '@/modules/routes/schemas/routeSchema';
import type { Trip } from '@/modules/trips/types';

interface EditTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip | null;
}

export const EditTripDialog = ({ open, onOpenChange, trip }: EditTripDialogProps) => {
  const { mutate, isPending } = useEditTrip();
  const { data: routes } = useRoutes();
  const { data: buses } = useBuses();
  const { data: drivers } = useDrivers();
  const { errors, setErrors, success, setSubmitted, startSuccess, buildFieldErrors, resetAll, isFormError } = useFormDialog<TripFormData>();
  const formRef = useRef<HTMLFormElement>(null);
  const [departureDate, setDepartureDate] = useState<Date | undefined>(trip ? new Date(trip.departureTime) : undefined);
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>(trip ? new Date(trip.arrivalTime) : undefined);
  const [tripRouteId, setTripRouteId] = useState(() => {
    if (!trip || !routes) return '';
    const match = routes.find(r => r.origin === trip.origin && r.destination === trip.destination);
    return match?.code ?? '';
  });
  const [busId, setBusId] = useState(trip?.busId ?? '');
  const [driverId, setDriverId] = useState(trip?.driverId ?? '');
  const [routeSearch, setRouteSearch] = useState('');
  const [routeOpen, setRouteOpen] = useState(false);
  const [price, setPrice] = useState(trip?.price ?? 0);
  const [hasChanges, setHasChanges] = useState(false);

  const markChanged = useCallback(() => setHasChanges(true), []);

  const selectedRoute = routes?.find(r => r.code === tripRouteId);

  const filteredRoutes = (routes ?? []).filter(r => {
    if (!routeSearch) return true;
    const q = routeSearch.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.origin.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q)
    );
  });

  const handleRouteSelect = (route: Route) => {
    setTripRouteId(route.code);
    setRouteSearch('');
    setRouteOpen(false);
    setPrice(route.basePrice);
    markChanged();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitted(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: TripFormData = {
      origin: (formData.get('origin') as string) ?? '',
      destination: (formData.get('destination') as string) ?? '',
      routeId: tripRouteId,
      departureDate: departureDate ? format(departureDate, 'yyyy-MM-dd') : '',
      departureTime: (formData.get('departureTime') as string) ?? '',
      arrivalDate: arrivalDate ? format(arrivalDate, 'yyyy-MM-dd') : '',
      arrivalTime: (formData.get('arrivalTime') as string) ?? '',
      busId,
      driverId: driverId || undefined,
      price,
    };

    const result = createTripSchema.safeParse(data);
    if (!result.success) {
      setErrors(buildFieldErrors(result.error.issues));
      return;
    }

    if (!trip) return;

    mutate(
      { id: trip.id, data: result.data },
      { onSuccess: () => startSuccess(() => onOpenChange(false)) }
    );
  };

  return (
    <BaseFormDialog
      key={trip?.id ?? 'edit'}
      open={open}
      onOpenChange={onOpenChange}
      icon={ArrowRight}
      title="Editar Viaje"
      description="Modifica los datos del viaje."
      successTitle="Viaje Actualizado"
      successDescription="Los cambios se guardaron correctamente."
      submitLabel="Guardar Cambios"
      submitPendingLabel="Guardando..."
      isPending={isPending}
      success={success}
      hasChanges={hasChanges}
      onChange={markChanged}
      formRef={formRef}
      onSubmit={handleSubmit}
      onReset={() => {
        resetAll();
        setDepartureDate(undefined);
        setArrivalDate(undefined);
        setTripRouteId('');
        setBusId('');
        setDriverId('');
        setRouteSearch('');
        setPrice(0);
        setHasChanges(false);
      }}
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Map className="w-3.5 h-3.5" />
            Ruta
          </Label>
          <Popover open={routeOpen} onOpenChange={setRouteOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full h-11 justify-start text-left font-normal rounded-xl border bg-background transition-all",
                  !selectedRoute && "text-muted-foreground",
                  isFormError('routeId') && "border-red-300 dark:border-red-500/50"
                )}
              >
                {selectedRoute
                  ? `${selectedRoute.origin} → ${selectedRoute.destination}`
                  : 'Buscar ruta...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 rounded-xl">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, origen o destino..."
                  value={routeSearch}
                  onChange={e => setRouteSearch(e.target.value)}
                  className="pl-9 h-10 rounded-lg"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {filteredRoutes.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRouteSelect(r)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors",
                      r.code === tripRouteId
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <span className="block truncate font-medium">{r.origin} → {r.destination}</span>
                    <span className="block text-[11px] text-muted-foreground truncate">
                      {r.name} — {formatCurrency(r.basePrice)}
                    </span>
                  </button>
                ))}
                {filteredRoutes.length === 0 && (
                  <p className="text-center py-6 text-sm text-muted-foreground">
                    {routeSearch ? 'Sin resultados' : 'No hay rutas disponibles'}
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
          {isFormError('routeId') && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.routeId}
            </motion.p>
          )}
          <input type="hidden" name="origin" value={selectedRoute?.origin ?? ''} />
          <input type="hidden" name="destination" value={selectedRoute?.destination ?? ''} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              Fecha de Salida
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full h-11 justify-start text-left font-normal rounded-xl border bg-background transition-all", !departureDate && "text-muted-foreground", isFormError('departureDate') ? "border-red-300 dark:border-red-500/50" : "border-input")}>
                  {departureDate ? format(departureDate, 'dd/MM/yyyy') : 'Selecciona una fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                <Calendar mode="single" selected={departureDate} onSelect={(d) => { setDepartureDate(d); markChanged(); }} startMonth={new Date(2025, 0)} endMonth={new Date(2035, 11)} captionLayout="dropdown" autoFocus />
              </PopoverContent>
            </Popover>
            {isFormError('departureDate') && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.departureDate}
              </motion.p>
            )}
            <input type="hidden" name="departureDate" value={departureDate ? format(departureDate, 'yyyy-MM-dd') : ''} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="departureTime" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Hora de Salida
            </Label>
            <Input id="departureTime" name="departureTime" type="time" defaultValue={trip ? format(new Date(trip.departureTime), 'HH:mm') : ''}
              className={cn("h-11 rounded-xl bg-background border transition-all", isFormError('departureTime') ? "border-red-300 dark:border-red-500/50 focus-visible:ring-red-400/30" : "border-input focus-visible:ring-primary/20")}
            />
            {isFormError('departureTime') && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.departureTime}
              </motion.p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              Fecha de Llegada
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full h-11 justify-start text-left font-normal rounded-xl border bg-background transition-all", !arrivalDate && "text-muted-foreground", isFormError('arrivalDate') ? "border-red-300 dark:border-red-500/50" : "border-input")}>
                  {arrivalDate ? format(arrivalDate, 'dd/MM/yyyy') : 'Selecciona una fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                <Calendar mode="single" selected={arrivalDate} onSelect={(d) => { setArrivalDate(d); markChanged(); }} startMonth={new Date(2025, 0)} endMonth={new Date(2035, 11)} captionLayout="dropdown" autoFocus />
              </PopoverContent>
            </Popover>
            {isFormError('arrivalDate') && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.arrivalDate}
              </motion.p>
            )}
            <input type="hidden" name="arrivalDate" value={arrivalDate ? format(arrivalDate, 'yyyy-MM-dd') : ''} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="arrivalTime" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Hora de Llegada
            </Label>
            <Input id="arrivalTime" name="arrivalTime" type="time" defaultValue={trip ? format(new Date(trip.arrivalTime), 'HH:mm') : ''}
              className={cn("h-11 rounded-xl bg-background border transition-all", isFormError('arrivalTime') ? "border-red-300 dark:border-red-500/50 focus-visible:ring-red-400/30" : "border-input focus-visible:ring-primary/20")}
            />
            {isFormError('arrivalTime') && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.arrivalTime}
              </motion.p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Conductor (opcional)
          </Label>
          <Select value={driverId} onValueChange={(v) => { setDriverId(v); markChanged(); }}>
            <SelectTrigger className="h-11 rounded-xl border bg-background border-input transition-all">
              <SelectValue placeholder="Selecciona un conductor" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {drivers?.map(d => (
                <SelectItem key={d.id} value={d.code} className="rounded-lg">
                  {d.name} — {d.code}
                </SelectItem>
              ))}
              {(!drivers || drivers.length === 0) && (
                <SelectItem value="" disabled>No hay conductores disponibles</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="busId" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BusIcon className="w-3.5 h-3.5" />
              Unidad (ID del Bus)
            </Label>
            <Select value={busId} onValueChange={(v) => { setBusId(v); markChanged(); }}>
              <SelectTrigger className={cn("h-11 rounded-xl border bg-background transition-all", isFormError('busId') ? "border-red-300 dark:border-red-500/50" : "border-input")}>
                <SelectValue placeholder="Selecciona un bus" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {buses?.map(b => (
                  <SelectItem key={b.id} value={b.code} className="rounded-lg">
                    {b.plate} — {b.model} ({b.type})
                  </SelectItem>
                ))}
                {(!buses || buses.length === 0) && (
                  <SelectItem value="" disabled>No hay buses disponibles</SelectItem>
                )}
              </SelectContent>
            </Select>
            {isFormError('busId') && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.busId}
              </motion.p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Precio por Boleto
            </Label>
            <CurrencyInput
              id="price" name="price"
              placeholder="Ej. 350"
              value={price}
              onChange={(v) => { setPrice(v); markChanged(); }}
              className={cn("h-11 rounded-xl bg-background border transition-all", isFormError('price') ? "border-red-300 dark:border-red-500/50 focus-visible:ring-red-400/30" : "border-input focus-visible:ring-primary/20")}
            />
            {isFormError('price') && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.price}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </BaseFormDialog>
  );
};