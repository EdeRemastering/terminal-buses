import { useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Bus as BusIcon, Gauge, Hash, Calendar as CalendarIcon, ShieldCheck, AlertCircle, Users } from 'lucide-react';
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
import { Button } from '@/common/components/ui/button';
import { cn } from '@/common/utils';
import { BaseFormDialog } from '@/common/components/BaseFormDialog';
import { useFormDialog } from '@/common/hooks/useFormDialog';
import { BUS_TYPES } from '@/modules/buses/components/busConfig';
import { createBusSchema, type CreateBusInput } from '@/modules/buses/schemas/busSchema';
import { useUpdateBus } from '@/modules/buses/hooks/useUpdateBus';
import type { Bus } from '@/modules/buses/types';

interface EditBusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bus: Bus | null;
}

export const EditBusDialog = ({ open, onOpenChange, bus }: EditBusDialogProps) => {
  const { mutate, isPending } = useUpdateBus();
  const { errors, setErrors, success, setSubmitted, startSuccess, buildFieldErrors, resetAll, isFormError } = useFormDialog<CreateBusInput>();
  const formRef = useRef<HTMLFormElement>(null);
  const [date, setDate] = useState<Date | undefined>(
    bus?.lastMaintenance ? new Date(bus.lastMaintenance + 'T00:00:00') : undefined
  );
  const [busType, setBusType] = useState<string>(bus?.type ?? '');
  const [hasChanges, setHasChanges] = useState(false);
  const markChanged = useCallback(() => setHasChanges(true), []);

  const getDefaultValue = (name: keyof CreateBusInput): string => {
    if (!bus) return '';
    const val = bus[name as keyof typeof bus];
    return val != null ? String(val) : '';
  };

  const buildFormData = (form: HTMLFormElement): CreateBusInput => {
    const fd = new FormData(form);
    return {
      plate: (fd.get('plate') as string) ?? '',
      model: (fd.get('model') as string) ?? '',
      capacity: fd.get('capacity') ? Number(fd.get('capacity')) : 0,
      type: busType as CreateBusInput['type'],
      year: fd.get('year') ? Number(fd.get('year')) : 0,
      mileage: fd.get('mileage') ? Number(fd.get('mileage')) : 0,
      lastMaintenance: date ? format(date, 'yyyy-MM-dd') : '',
    };
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitted(true);

    const data = buildFormData(e.currentTarget);
    const result = createBusSchema.safeParse(data);
    if (!result.success) {
      setErrors(buildFieldErrors(result.error.issues));
      return;
    }

    if (!bus) return;

    mutate(
      { id: bus.id, data: result.data },
      {
        onSuccess: () => startSuccess(() => onOpenChange(false)),
      }
    );
  };

  const fieldConfig = [
    { name: 'plate' as const, label: 'Placa', icon: Hash, placeholder: 'Ej. ABC-123', type: 'text' },
    { name: 'model' as const, label: 'Modelo', icon: BusIcon, placeholder: 'Ej. Mercedes-Benz Sprinter', type: 'text' },
    { name: 'capacity' as const, label: 'Capacidad (Asientos)', icon: Users, placeholder: 'Ej. 40', type: 'number' },
    { name: 'year' as const, label: 'Año', icon: ShieldCheck, placeholder: 'Ej. 2024', type: 'number' },
    { name: 'mileage' as const, label: 'Kilometraje (KM)', icon: Gauge, placeholder: 'Ej. 15000', type: 'number' },
  ];

  return (
    <BaseFormDialog
      key={bus?.id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      icon={BusIcon}
      title="Editar Unidad"
      description="Modifica los datos del autobús."
      successTitle="Unidad Actualizada"
      successDescription="Los cambios se guardaron correctamente."
      submitLabel="Guardar Cambios"
      submitPendingLabel="Guardando..."
      isPending={isPending}
      success={success}
      onSubmit={handleSubmit}
      hasChanges={hasChanges}
      onChange={markChanged}
      formRef={formRef}
      onReset={() => {
        resetAll();
        setDate(undefined);
        setBusType('');
        setHasChanges(false);
      }}
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
            defaultValue={getDefaultValue(name)}
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
          onValueChange={(v) => { setBusType(v); markChanged(); }}
          name="type"
        >
          <SelectTrigger
            className={cn(
              "h-11 rounded-xl border bg-background transition-all",
              isFormError('type') ? "border-red-300 dark:border-red-500/50" : "border-input"
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
                isFormError('lastMaintenance') ? "border-red-300 dark:border-red-500/50" : "border-input"
              )}
            >
              {date ? format(date, 'dd/MM/yyyy') : 'Selecciona una fecha'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => { setDate(d); markChanged(); }}
              startMonth={new Date(2018, 0)}
              endMonth={new Date(2030, 11)}
              captionLayout="dropdown"
              autoFocus
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
    </BaseFormDialog>
  );
};
