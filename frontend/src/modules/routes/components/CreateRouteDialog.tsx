import { useState } from 'react';
import { motion } from 'framer-motion';
import { Route as RouteIcon, MapPin, Navigation, Clock, DollarSign, Map, AlertCircle } from 'lucide-react';
import { Input } from '@/common/components/ui/input';
import { CurrencyInput } from '@/common/components/ui/currency-input';
import { Label } from '@/common/components/ui/label';
import { cn } from '@/common/utils';
import { BaseFormDialog } from '@/common/components/BaseFormDialog';
import { useFormDialog } from '@/common/hooks/useFormDialog';
import { createRouteSchema, type RouteFormData } from '@/modules/routes/schemas/routeSchema';
import { useCreateRoute } from '@/modules/routes/hooks/useCreateRoute';

interface CreateRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateRouteDialog = ({ open, onOpenChange }: CreateRouteDialogProps) => {
  const { mutate, isPending } = useCreateRoute();
  const { errors, setErrors, success, setSubmitted, startSuccess, buildFieldErrors, resetAll, isFormError } = useFormDialog<RouteFormData>();
  const [basePrice, setBasePrice] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitted(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: RouteFormData = {
      name: (formData.get('name') as string) ?? '',
      origin: (formData.get('origin') as string) ?? '',
      destination: (formData.get('destination') as string) ?? '',
      distanceKm: Number(formData.get('distanceKm')) || 0,
      durationHours: Number(formData.get('durationHours')) || 0,
      basePrice,
      stops: (formData.get('stops') as string) ?? '',
    };

    const result = createRouteSchema.safeParse(data);
    if (!result.success) {
      setErrors(buildFieldErrors(result.error.issues));
      return;
    }

    mutate(result.data, {
      onSuccess: () => startSuccess(() => onOpenChange(false)),
    });
  };

  const fieldConfig = [
    { name: 'name' as const, label: 'Nombre de Ruta', icon: RouteIcon, placeholder: 'Ej. Bogotá - Medellín', type: 'text' },
    { name: 'origin' as const, label: 'Origen', icon: MapPin, placeholder: 'Ej. Bogotá', type: 'text' },
    { name: 'destination' as const, label: 'Destino', icon: Navigation, placeholder: 'Ej. Medellín', type: 'text' },
    { name: 'distanceKm' as const, label: 'Distancia (km)', icon: Map, placeholder: 'Ej. 540', type: 'number' },
    { name: 'durationHours' as const, label: 'Duración (horas)', icon: Clock, placeholder: 'Ej. 6.5', type: 'number' },
    { name: 'basePrice' as const, label: 'Precio Base ($)', icon: DollarSign, placeholder: 'Ej. 550', type: 'number' },
    { name: 'stops' as const, label: 'Escalas Intermedias', icon: MapPin, placeholder: 'La Dorada, Armenia, Pereira', type: 'text' },
  ];

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={RouteIcon}
      title="Registrar Ruta"
      description="Ingresa los datos de la nueva ruta para agregarla al catálogo."
      successTitle="Ruta Registrada"
      successDescription="La ruta se agregó correctamente al catálogo."
      submitLabel="Registrar Ruta"
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
          {name === 'basePrice' ? (
            <CurrencyInput
              id={name} name={name}
              placeholder={placeholder}
              value={basePrice}
              onChange={setBasePrice}
              className={cn(
                "h-11 rounded-xl bg-background border transition-all",
                isFormError(name)
                  ? "border-red-300 dark:border-red-500/50 focus-visible:ring-red-400/30"
                  : "border-input focus-visible:ring-primary/20"
              )}
            />
          ) : (
            <Input
              id={name}
              name={name}
              type={type}
              placeholder={placeholder}
              step={name === 'durationHours' ? 0.5 : undefined}
              className={cn(
                "h-11 rounded-xl bg-background border transition-all",
                isFormError(name)
                  ? "border-red-300 dark:border-red-500/50 focus-visible:ring-red-400/30"
                  : "border-input focus-visible:ring-primary/20"
              )}
            />
          )}
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
    </BaseFormDialog>
  );
};
