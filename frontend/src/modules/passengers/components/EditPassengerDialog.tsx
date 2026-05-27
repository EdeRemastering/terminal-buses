import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, FileText, Award, AlertCircle } from 'lucide-react';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { cn } from '@/common/utils';
import { BaseFormDialog } from '@/common/components/BaseFormDialog';
import { useFormDialog } from '@/common/hooks/useFormDialog';
import { createPassengerSchema, type CreatePassengerInput } from '@/modules/passengers/schemas/passengerSchema';
import { useUpdatePassenger } from '@/modules/passengers/hooks/useUpdatePassenger';
import type { Passenger } from '@/modules/passengers/types';

const normalizePassenger = (p: Passenger): CreatePassengerInput => ({
  name: p.name,
  email: p.email,
  phone: (p.phone ?? '').trim().replace(/\s+/g, ''),
  documentId: p.documentId,
});

interface EditPassengerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passenger: Passenger | null;
}

export const EditPassengerDialog = ({ open, onOpenChange, passenger }: EditPassengerDialogProps) => {
  const { mutate, isPending } = useUpdatePassenger();
  const { errors, setErrors, success, setSubmitted, startSuccess, buildFieldErrors, resetAll, isFormError } = useFormDialog<CreatePassengerInput>();
  const [hasChanges, setHasChanges] = useState(false);

  const markChanged = () => setHasChanges(true);

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

    if (!passenger) return;

    const normalized = normalizePassenger(passenger);
    if (JSON.stringify(result.data) === JSON.stringify(normalized)) return;

    mutate(
      { id: passenger.id, data: result.data },
      {
        onSuccess: () => startSuccess(() => onOpenChange(false)),
      }
    );
  };

  const fieldConfig = [
    { name: 'name' as const, label: 'Nombre Completo', icon: User, placeholder: 'Ej. Juan Pérez', type: 'text' },
    { name: 'email' as const, label: 'Correo Electrónico', icon: Mail, placeholder: 'ej: juan@correo.com', type: 'email' },
    { name: 'phone' as const, label: 'Teléfono', icon: Phone, placeholder: '300 123 4567', type: 'text' },
    { name: 'documentId' as const, label: 'Identificación Oficial', icon: FileText, placeholder: 'Ej. CC-1012345678', type: 'text' },
  ];

  return (
    <BaseFormDialog
      key={passenger?.id ?? 'edit'}
      open={open}
      onOpenChange={onOpenChange}
      icon={Award}
      title="Editar Pasajero"
      description="Modifica los datos del pasajero."
      successTitle="Pasajero Actualizado"
      successDescription="Los cambios se guardaron correctamente."
      submitLabel="Guardar Cambios"
      submitPendingLabel="Guardando..."
      isPending={isPending}
      success={success}
      hasChanges={hasChanges}
      onSubmit={handleSubmit}
      onReset={() => { resetAll(); setHasChanges(false); }}
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
            defaultValue={passenger?.[name] ?? ''}
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
    </BaseFormDialog>
  );
};
