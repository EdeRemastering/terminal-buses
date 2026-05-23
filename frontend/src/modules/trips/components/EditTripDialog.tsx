import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, MapPin, Clock, CalendarIcon, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover';
import { Calendar } from '@/common/components/ui/calendar';
import { cn } from '@/common/utils';
import { createTripSchema, type TripFormData } from '@/modules/trips/schemas/tripSchema';
import { useEditTrip } from '@/modules/trips/hooks/useEditTrip';
import type { Trip } from '@/modules/trips/types';

type FormErrors = Partial<Record<keyof TripFormData, string>>;

interface EditTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip | null;
}

export const EditTripDialog = ({ open, onOpenChange, trip }: EditTripDialogProps) => {
  const { mutate, isPending } = useEditTrip();
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>();
  const [tripRouteId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (trip) {
      setDepartureDate(new Date(trip.departureTime));
      setArrivalDate(new Date(trip.arrivalTime));
    }
  }, [trip]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitted(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = createTripSchema.safeParse({
      origin: (formData.get('origin') as string) ?? '',
      destination: (formData.get('destination') as string) ?? '',
      routeId: tripRouteId,
      departureDate: departureDate ? format(departureDate, 'yyyy-MM-dd') : '',
      departureTime: (formData.get('departureTime') as string) ?? '',
      arrivalDate: arrivalDate ? format(arrivalDate, 'yyyy-MM-dd') : '',
      arrivalTime: (formData.get('arrivalTime') as string) ?? '',
      busId: (formData.get('busId') as string) ?? '',
      price: Number((formData.get('price') as string)) || 0,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof TripFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (!trip) return;

    mutate(
      { id: trip.id, data: result.data },
      {
        onSuccess: () => {
          setSuccess(true);
          successTimeoutRef.current = setTimeout(() => {
            setSuccess(false);
            onOpenChange(false);
          }, 1200);
        },
      }
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setErrors({});
      setSuccess(false);
      setSubmitted(false);
    }
    onOpenChange(next);
  };

  const textFieldConfig = [
    { name: 'origin' as const, label: 'Origen', icon: MapPin, placeholder: 'Ej. Terminal Norte' },
    { name: 'destination' as const, label: 'Destino', icon: MapPin, placeholder: 'Ej. Terminal Sur' },
  ];

  const isFormError = (name: keyof TripFormData) => submitted && !!errors[name];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className={cn(
          "absolute top-0 left-0 w-full h-1.5 transition-colors duration-500",
          success ? "bg-emerald-500" : "bg-primary"
        )} />

        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <ArrowRight className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Editar Viaje</DialogTitle>
                <DialogDescription>
                  Modifica los datos del viaje.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg">Viaje Actualizado</h3>
                <p className="text-sm text-muted-foreground">Los cambios se guardaron correctamente.</p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="p-6 pt-4 space-y-5"
            >
              {textFieldConfig.map(({ name, label, icon: Icon, placeholder }) => (
                <div key={name} className="space-y-1.5">
                  <Label htmlFor={name} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Label>
                  <Input
                    id={name}
                    name={name}
                    type="text"
                    placeholder={placeholder}
                    defaultValue={trip?.[name] ?? ''}
                    className={cn(
                      "h-11 rounded-xl bg-background border transition-all",
                      isFormError(name)
                        ? "border-red-300 dark:border-red-500/50 focus-visible:ring-red-400/30"
                        : "border-input focus-visible:ring-primary/20"
                    )}
                  />
                  {isFormError(name) && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors[name]}
                    </motion.p>
                  )}
                </div>
              ))}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  Fecha de Salida
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-11 justify-start text-left font-normal rounded-xl border bg-background transition-all",
                        !departureDate && "text-muted-foreground",
                        isFormError('departureDate')
                          ? "border-red-300 dark:border-red-500/50"
                          : "border-input"
                      )}
                    >
                      {departureDate ? format(departureDate, 'dd/MM/yyyy') : 'Selecciona una fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={departureDate}
                      onSelect={setDepartureDate}
                      fromYear={2025}
                      toYear={2035}
                      captionLayout="dropdown"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {isFormError('departureDate') && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.departureDate}
                  </motion.p>
                )}
                <input type="hidden" name="departureDate" value={departureDate ? format(departureDate, 'yyyy-MM-dd') : ''} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="departureTime" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Hora de Salida
                </Label>
                <Input
                  id="departureTime"
                  name="departureTime"
                  type="time"
                  defaultValue={trip ? format(new Date(trip.departureTime), 'HH:mm') : ''}
                  className={cn(
                    "h-11 rounded-xl bg-background border transition-all",
                    isFormError('departureTime')
                      ? "border-red-300 dark:border-red-500/50 focus-visible:ring-red-400/30"
                      : "border-input focus-visible:ring-primary/20"
                  )}
                />
                {isFormError('departureTime') && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.departureTime}
                  </motion.p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="rounded-xl h-11 px-5"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 min-w-[140px]"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </span>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
