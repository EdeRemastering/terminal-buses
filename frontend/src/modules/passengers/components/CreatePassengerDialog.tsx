import { motion } from 'framer-motion';
import { User, Mail, Phone, FileText, Award, AlertCircle } from 'lucide-react';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { cn } from '@/common/utils';
import { BaseFormDialog } from '@/common/components/BaseFormDialog';
import { useFormDialog } from '@/common/hooks/useFormDialog';
import { createPassengerSchema, type CreatePassengerInput } from '@/modules/passengers/schemas/passengerSchema';
import { useCreatePassenger } from '@/modules/passengers/hooks/useCreatePassenger';

interface CreatePassengerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePassengerDialog = ({ open, onOpenChange }: CreatePassengerDialogProps) => {
  const { mutate, isPending } = useCreatePassenger();
  const { errors, setErrors, success, setSubmitted, startSuccess, buildFieldErrors, resetAll, isFormError } = useFormDialog<CreatePassengerInput>();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitted(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: CreatePassengerInput = {
      name: (formData.get('name') as string) ?? '',
      email: (formData.get('email') as string) ?? '',
      phone: (formData.get('phone') as string) ?? '',
      documentId: (formData.get('documentId') as string) ?? '',
    };

    const result = createPassengerSchema.safeParse(data);
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
    { name: 'email' as const, label: 'Correo Electrónico', icon: Mail, placeholder: 'ej: juan@correo.com', type: 'email' },
    { name: 'phone' as const, label: 'Teléfono', icon: Phone, placeholder: '300 123 4567', type: 'text' },
    { name: 'documentId' as const, label: 'Identificación Oficial', icon: FileText, placeholder: 'Ej. CC-1012345678', type: 'text' },
  ];

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Award}
      title="Registrar Pasajero"
      description="Ingresa los datos del nuevo cliente para agregarlo al sistema."
      successTitle="Pasajero Registrado"
      successDescription="El cliente se agregó correctamente al sistema."
      submitLabel="Registrar Pasajero"
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
    </BaseFormDialog>
  );
};
