import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { cn } from '@/common/utils';

interface BaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  successTitle: string;
  successDescription: string;
  submitLabel: string;
  submitPendingLabel: string;
  isPending: boolean;
  success: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  hasChanges?: boolean;
  onChange?: (e: React.FormEvent<HTMLFormElement>) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
  children: ReactNode;
  onReset: () => void;
  maxWidth?: string;
}

export const BaseFormDialog = ({
  open,
  onOpenChange,
  icon: Icon,
  title,
  description,
  successTitle,
  successDescription,
  submitLabel,
  submitPendingLabel,
  isPending,
  success,
  onSubmit,
  hasChanges,
  onChange,
  formRef,
  children,
  onReset,
  maxWidth = 'sm:max-w-lg',
}: BaseFormDialogProps) => {
  const handleOpenChange = (next: boolean) => {
    if (!next) onReset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`${maxWidth} p-0 gap-0 overflow-hidden`}>
        <div
          className={cn(
            'absolute top-0 left-0 w-full h-1.5 transition-colors duration-500',
            success ? 'bg-emerald-500' : 'bg-primary'
          )}
        />

        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
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
                <h3 className="font-bold text-lg">{successTitle}</h3>
                <p className="text-sm text-muted-foreground">{successDescription}</p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              ref={formRef}
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={onSubmit}
              onChange={onChange}
              className="p-6 pt-4 space-y-5"
            >
              {children}

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
                  disabled={isPending || (hasChanges !== undefined && !hasChanges)}
                  className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 min-w-[140px]"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {submitPendingLabel}
                    </span>
                  ) : (
                    submitLabel
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
