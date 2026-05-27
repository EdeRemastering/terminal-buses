import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { User, Mail, Phone, FileText, CalendarIcon, Award, AlertCircle } from 'lucide-react';
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
import { createDriverSchema, type CreateDriverInput } from '@/modules/drivers/schemas/driverSchema';
import { useUpdateDriver } from '@/modules/drivers/hooks/useUpdateDriver';
import type { Driver } from '@/modules/drivers/types';

const LICENSE_TYPES = [
  { value: 'Federal Categoría A', label: 'Federal Categoría A' },
  { value: 'Federal Categoría B', label: 'Federal Categoría B' },
  { value: 'Federal Categoría C', label: 'Federal Categoría C' },
  { value: 'Estatal', label: 'Estatal' },
];

const normalizeDriver = (d: Driver): CreateDriverInput => ({
  name: d.name,
  email: d.email,
  phone: (d.phone ?? '').trim().replace(/\s+/g, ''),
  licenseNumber: d.licenseNumber,
  licenseType: d.licenseType,
  licenseExpiration: d.licenseExpiration ? format(new Date(d.licenseExpiration), 'yyyy-MM-dd') : '',
});

interface EditDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
}

export const EditDriverDialog = ({ open, onOpenChange, driver }: EditDriverDialogProps) => {
  const { mutate, isPending } = useUpdateDriver();
  const { errors, setErrors, success, setSubmitted, startSuccess, buildFieldErrors, resetAll, isFormError } = useFormDialog<CreateDriverInput>();
  const [date, setDate] = useState<Date | undefined>(driver?.licenseExpiration ? new Date(driver.licenseExpiration) : undefined);
  const [licenseType, setLicenseType] = useState(driver?.licenseType ?? '');
  const [hasChanges, setHasChanges] = useState(false);

  const markChanged = () => setHasChanges(true);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitted(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: CreateDriverInput = {
      name: (formData.get('name') as string) ?? '',
      email: (formData.get('email') as string) ?? '',
      phone: (formData.get('phone') as string) ?? '',
      licenseNumber: (formData.get('licenseNumber') as string) ?? '',
      licenseType,
      licenseExpiration: date ? format(date, 'yyyy-MM-dd') : '',
    };

    const result = createDriverSchema.safeParse(data);
    if (!result.success) {
      setErrors(buildFieldErrors(result.error.issues));
      return;
    }

    if (!driver) return;

    const normalized = normalizeDriver(driver);
    if (JSON.stringify(result.data) === JSON.stringify(normalized)) return;

    mutate(
      { id: driver.id, data: result.data },
      { onSuccess: () => startSuccess(() => onOpenChange(false)) }
    );
  };

  const fieldConfig = [
    { name: 'name' as const, label: 'Nombre Completo', icon: User, placeholder: 'Ej. Juan Pérez', type: 'text' },
    { name: 'email' as const, label: 'Correo Electrónico', icon: Mail, placeholder: 'ej: juan@transporte.com', type: 'email' },
    { name: 'phone' as const, label: 'Teléfono', icon: Phone, placeholder: '300 123 4567', type: 'text' },
    { name: 'licenseNumber' as const, label: 'Número de Licencia', icon: FileText, placeholder: 'Ej. LIC-XXXX-CO', type: 'text' },
  ];

  return (
    <BaseFormDialog
      key={driver?.id ?? 'edit'}
      open={open}
      onOpenChange={onOpenChange}
      icon={Award}
      title="Editar Conductor"
      description="Modifica los datos del operador."
      successTitle="Conductor Actualizado"
      successDescription="Los cambios se guardaron correctamente."
      submitLabel="Guardar Cambios"
      submitPendingLabel="Guardando..."
      isPending={isPending}
      success={success}
      hasChanges={hasChanges}
      onSubmit={handleSubmit}
      onReset={() => { resetAll(); setDate(undefined); setLicenseType(''); setHasChanges(false); }}
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
            defaultValue={driver?.[name] ?? ''}
            onChange={markChanged}
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
          <Award className="w-3.5 h-3.5" />
          Tipo de Licencia
        </Label>
        <Select value={licenseType} onValueChange={(v) => { setLicenseType(v); markChanged(); }} name="licenseType">
          <SelectTrigger
            className={cn(
              "h-11 rounded-xl border bg-background transition-all",
              isFormError('licenseType') ? "border-red-300 dark:border-red-500/50" : "border-input"
            )}
          >
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {LICENSE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="rounded-lg">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFormError('licenseType') && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1"
          >
            <AlertCircle className="w-3 h-3" />
            {errors.licenseType}
          </motion.p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5" />
          Vencimiento de Licencia
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-11 justify-start text-left font-normal rounded-xl border bg-background transition-all",
                !date && "text-muted-foreground",
                isFormError('licenseExpiration') ? "border-red-300 dark:border-red-500/50" : "border-input"
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
              startMonth={new Date(2025, 0)}
              endMonth={new Date(2035, 11)}
              captionLayout="dropdown"
              autoFocus
            />
          </PopoverContent>
        </Popover>
        {isFormError('licenseExpiration') && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1"
          >
            <AlertCircle className="w-3 h-3" />
            {errors.licenseExpiration}
          </motion.p>
        )}
        <input type="hidden" name="licenseExpiration" value={date ? format(date, 'yyyy-MM-dd') : ''} />
      </div>
    </BaseFormDialog>
  );
};
