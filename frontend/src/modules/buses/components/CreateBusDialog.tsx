import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Bus, Gauge, Hash, Calendar as CalendarIcon, ShieldCheck, CheckCircle2, AlertCircle, Users } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover';
import { Calendar } from '@/common/components/ui/calendar';
import { cn } from '@/common/utils';
import { createBusSchema, type CreateBusInput } from '@/modules/buses/schemas/busSchema';
import { useCreateBus } from '@/modules/buses/hooks/useCreateBus';

const BUS_TYPES = [
  { value: 'LUXURY', label: 'Servicio de Lujo' },
  { value: 'EXPRESS', label: 'Servicio Exprés' },
  { value: 'STANDARD', label: 'Servicio Estándar' },
];

type FormErrors = Partial<Record<keyof CreateBusInput, string>>;

interface CreateBusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateBusDialog = ({ open, onOpenChange }: CreateBusDialogProps) => {
  const { mutate, isPending } = useCreateBus();
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [busType, setBusType] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitted(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const rawCapacity = formData.get('capacity') as string;
    const rawYear = formData.get('year') as string;
    const rawMileage = formData.get('mileage') as string;

    const data: CreateBusInput = {
      plate: (formData.get('plate') as string) ?? '',
      model: (formData.get('model') as string) ?? '',
      capacity: rawCapacity ? Number(rawCapacity) : 0,
      type: busType as CreateBusInput['type'],
      year: rawYear ? Number(rawYear) : 0,
      mileage: rawMileage ? Number(rawMileage) : 0,
      lastMaintenance: date ? format(date, 'yyyy-MM-dd') : '',
    };

    const result = createBusSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateBusInput;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    mutate(result.data, {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onOpenChange(false);
        }, 1200);
      },
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setErrors({});
      setSuccess(false);
      setDate(undefined);
      setBusType('');
      setSubmitted(false);
    }
    onOpenChange(next);
  };

  const fieldConfig = [
    { name: 'plate' as const, label: 'Placa', icon: Hash, placeholder: 'Ej. ABC-123', type: 'text' },
    { name: 'model' as const, label: 'Modelo', icon: Bus, placeholder: 'Ej. Mercedes-Benz Sprinter', type: 'text' },
    { name: 'capacity' as const, label: 'Capacidad (Asientos)', icon: Users, placeholder: 'Ej. 40', type: 'number' },
    { name: 'year' as const, label: 'Año', icon: ShieldCheck, placeholder: 'Ej. 2024', type: 'number' },
    { name: 'mileage' as const, label: 'Kilometraje (KM)', icon: Gauge, placeholder: 'Ej. 15000', type: 'number' },
  ];

  const isFormError = (name: keyof CreateBusInput) => submitted && !!errors[name];

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
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Registrar Unidad</DialogTitle>
                <DialogDescription>
                  Ingresa los datos del nuevo autobús para agregarlo a la flota.
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
                <h3 className="font-bold text-lg">Unidad Registrada</h3>
                <p className="text-sm text-muted-foreground">El autobús se agregó correctamente a la flota.</p>
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
              {fieldConfig.map(({ name, label, icon: Icon, placeholder, type }) => (
                <div key={name} className="space-y-1.5">
                  <Label htmlFor={name} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Label>
                  <Input
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
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
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Tipo de Unidad
                </Label>
                <Select
                  value={busType}
                  onValueChange={setBusType}
                  name="type"
                >
                  <SelectTrigger
                    className={cn(
                      "h-11 rounded-xl border bg-background transition-all",
                      isFormError('type')
                        ? "border-red-300 dark:border-red-500/50"
                        : "border-input"
                    )}
                  >
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {BUS_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="rounded-lg">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isFormError('type') && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.type}
                  </motion.p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  Último Mantenimiento
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-11 justify-start text-left font-normal rounded-xl border bg-background transition-all",
                        !date && "text-muted-foreground",
                        isFormError('lastMaintenance')
                          ? "border-red-300 dark:border-red-500/50"
                          : "border-input"
                      )}
                    >
                      {date ? format(date, 'dd/MM/yyyy') : 'Selecciona una fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      fromYear={2018}
                      toYear={2030}
                      captionLayout="dropdown"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {isFormError('lastMaintenance') && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.lastMaintenance}
                  </motion.p>
                )}
                <input type="hidden" name="lastMaintenance" value={date ? format(date, 'yyyy-MM-dd') : ''} />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="rounded-xl h-11 px-5"
                  disabled={isPending}
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
                      Registrando...
                    </span>
                  ) : (
                    'Registrar Unidad'
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
