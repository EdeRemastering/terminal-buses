import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Route as RouteIcon, MapPin, Navigation, Clock, DollarSign, Map, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { cn } from '@/common/utils';
import { createRouteSchema, type CreateRouteInput } from '@/modules/routes/schemas/routeSchema';
import { useCreateRoute } from '@/modules/routes/hooks/useCreateRoute';

type FormErrors = Partial<Record<keyof CreateRouteInput, string>>;

interface CreateRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateRouteDialog = ({ open, onOpenChange }: CreateRouteDialogProps) => {
  const { mutate, isPending } = useCreateRoute();
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitted(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: CreateRouteInput = {
      name: (formData.get('name') as string) ?? '',
      origin: (formData.get('origin') as string) ?? '',
      destination: (formData.get('destination') as string) ?? '',
      distanceKm: Number(formData.get('distanceKm')) || 0,
      durationHours: Number(formData.get('durationHours')) || 0,
      basePrice: Number(formData.get('basePrice')) || 0,
      stops: (formData.get('stops') as string) ?? '',
    };

    const result = createRouteSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateRouteInput;
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
      setSubmitted(false);
    }
    onOpenChange(next);
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

  const isFormError = (name: keyof CreateRouteInput) => submitted && !!errors[name];

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
                <RouteIcon className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Registrar Ruta</DialogTitle>
                <DialogDescription>
                  Ingresa los datos de la nueva ruta para agregarla al catálogo.
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
                <h3 className="font-bold text-lg">Ruta Registrada</h3>
                <p className="text-sm text-muted-foreground">La ruta se agregó correctamente al catálogo.</p>
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
                    step={name === 'durationHours' ? 0.5 : undefined}
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
                    'Registrar Ruta'
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
