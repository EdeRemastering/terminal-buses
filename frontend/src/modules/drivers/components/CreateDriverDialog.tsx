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
import { useCreateDriver } from '@/modules/drivers/hooks/useCreateDriver';

const LICENSE_TYPES = [
  { value: 'Federal Categoría A', label: 'Federal Categoría A' },
  { value: 'Federal Categoría B', label: 'Federal Categoría B' },
  { value: 'Federal Categoría C', label: 'Federal Categoría C' },
  { value: 'Estatal', label: 'Estatal' },
];

interface CreateDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateDriverDialog = ({ open, onOpenChange }: CreateDriverDialogProps) => {
  const { mutate, isPending } = useCreateDriver();
  const { errors, setErrors, success, setSubmitted, startSuccess, buildFieldErrors, resetAll, isFormError } = useFormDialog<CreateDriverInput>();
  const [date, setDate] = useState<Date | undefined>();
  const [licenseType, setLicenseType] = useState<string>('');

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
      licenseType: licenseType,
      licenseExpiration: date ? format(date, 'yyyy-MM-dd') : '',
    };

    const result = createDriverSchema.safeParse(data);
    if (!result.success) {
      setErrors(buildFieldErrors(result.error.issues));
      return;
    }

    mutate(result.data, {
      onSuccess: () => startSuccess(() => onOpenChange(false)),
    });
  };

  const fieldConfig = [
    { name: 'name' as const, label: 'Nombre Completo', icon: User, placeholder: 'Ej. Juan Pérez', type: 'text' },
    { name: 'email' as const, label: 'Correo Electrónico', icon: Mail, placeholder: 'ej: juan@transporte.com', type: 'email' },
    { name: 'phone' as const, label: 'Teléfono', icon: Phone, placeholder: '300 123 4567', type: 'text' },
    { name: 'licenseNumber' as const, label: 'Número de Licencia', icon: FileText, placeholder: 'Ej. LIC-XXXX-CO', type: 'text' },
  ];

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Award}
      title="Registrar Conductor"
      description="Ingresa los datos del nuevo operador para agregarlo a la flota."
      successTitle="Conductor Registrado"
      successDescription="El operador se agregó correctamente a la flota."
      submitLabel="Registrar Conductor"
      submitPendingLabel="Registrando..."
      isPending={isPending}
      success={success}
      onSubmit={handleSubmit}
      onReset={resetAll}
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
          <Award className="w-3.5 h-3.5" />
          Tipo de Licencia
        </Label>
        <Select value={licenseType} onValueChange={setLicenseType} name="licenseType">
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
              onSelect={setDate}
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
