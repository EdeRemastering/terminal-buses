import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User, Mail, Phone, FileText, CalendarIcon, Award, CheckCircle2, AlertCircle } from 'lucide-react';
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
import { createDriverSchema, type CreateDriverInput } from '@/modules/drivers/schemas/driverSchema';
import { useCreateDriver } from '@/modules/drivers/hooks/useCreateDriver';

const LICENSE_TYPES = [
  { value: 'Federal Categoría A', label: 'Federal Categoría A' },
  { value: 'Federal Categoría B', label: 'Federal Categoría B' },
  { value: 'Federal Categoría C', label: 'Federal Categoría C' },
  { value: 'Estatal', label: 'Estatal' },
];

type FormErrors = Partial<Record<keyof CreateDriverInput, string>>;

interface CreateDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateDriverDialog = ({ open, onOpenChange }: CreateDriverDialogProps) => {
  const { mutate, isPending } = useCreateDriver();
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [licenseType, setLicenseType] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

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
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateDriverInput;
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
      setLicenseType('');
      setSubmitted(false);
    }
    onOpenChange(next);
  };

  const fieldConfig = [
    { name: 'name' as const, label: 'Nombre Completo', icon: User, placeholder: 'Ej. Juan Pérez', type: 'text' },
    { name: 'email' as const, label: 'Correo Electrónico', icon: Mail, placeholder: 'ej: juan@transporte.com', type: 'email' },
    { name: 'phone' as const, label: 'Teléfono', icon: Phone, placeholder: '+57 300 123 4567', type: 'text' },
    { name: 'licenseNumber' as const, label: 'Número de Licencia', icon: FileText, placeholder: 'Ej. LIC-XXXX-CO', type: 'text' },
  ];

  const isFormError = (name: keyof CreateDriverInput) => submitted && !!errors[name];

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
                <Award className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Registrar Conductor</DialogTitle>
                <DialogDescription>
                  Ingresa los datos del nuevo operador para agregarlo a la flota.
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
                <h3 className="font-bold text-lg">Conductor Registrado</h3>
                <p className="text-sm text-muted-foreground">El operador se agregó correctamente a la flota.</p>
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
                  <Award className="w-3.5 h-3.5" />
                  Tipo de Licencia
                </Label>
                <Select
                  value={licenseType}
                  onValueChange={setLicenseType}
                  name="licenseType"
                >
                  <SelectTrigger
                    className={cn(
                      "h-11 rounded-xl border bg-background transition-all",
                      isFormError('licenseType')
                        ? "border-red-300 dark:border-red-500/50"
                        : "border-input"
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
                        isFormError('licenseExpiration')
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
                      fromYear={2025}
                      toYear={2035}
                      captionLayout="dropdown"
                      initialFocus
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
                    'Registrar Conductor'
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
