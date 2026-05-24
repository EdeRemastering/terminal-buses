import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
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
import type { Passenger } from '@/modules/passengers/types';
import { assignPoints } from '@/modules/passengers/api/assignPoints';

interface AssignPointsDialogProps {
  passenger: Passenger | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREMIUM_THRESHOLD = 1000;
const MAX_POINTS = 10000;
const DEFAULT_POINTS = '100';

export const AssignPointsDialog = ({ passenger, open, onOpenChange }: AssignPointsDialogProps) => {
  const [points, setPoints] = useState(DEFAULT_POINTS);
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (totalPoints: number) => assignPoints(passenger!.id, totalPoints),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
    },
  });

  if (!passenger) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTotal = passenger.frequentTravelerPoints + Number(points);
    mutation.mutate(newTotal);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPoints(DEFAULT_POINTS);
      setReason('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className={cn(
          "absolute top-0 left-0 w-full h-1.5 transition-colors duration-500",
          success ? "bg-violet-500" : "bg-violet-500"
        )} />

        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Asignar Puntos del Club</DialogTitle>
                <DialogDescription>
                  {passenger.name} — {passenger.frequentTravelerPoints} puntos actuales
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <AnimatePresence mode="wait">
          {mutation.isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg">Puntos Asignados</h3>
                <p className="text-sm text-muted-foreground">Se añadieron {points} puntos a {passenger.name}.</p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl mt-2"
                onClick={() => { mutation.reset(); handleOpenChange(false); }}
              >
                Cerrar
              </Button>
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
              <div className="space-y-1.5">
                <Label htmlFor="points" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Puntos a Asignar
                </Label>
                <Input
                  id="points"
                  type="number"
                  min={1}
                  max={MAX_POINTS}
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="h-11 rounded-xl bg-background border border-input focus-visible:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Motivo (opcional)
                </Label>
                <Input
                  id="reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej. Bono por viaje frecuente"
                  className="h-11 rounded-xl bg-background border border-input focus-visible:ring-primary/20"
                />
              </div>

              {mutation.isError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
                </div>
              )}

              <div className="bg-violet-50 dark:bg-violet-500/5 rounded-2xl p-4 flex items-center gap-3">
                <Award className="w-5 h-5 text-violet-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-violet-700 dark:text-violet-400">
                    {passenger.name} tendrá {passenger.frequentTravelerPoints + Number(points)} puntos
                  </p>
                  <p className="text-xs text-violet-600/60 dark:text-violet-400/60">
                    {passenger.frequentTravelerPoints + Number(points) >= PREMIUM_THRESHOLD ? '¡Alcanzará el nivel Premium!' : `${PREMIUM_THRESHOLD - (passenger.frequentTravelerPoints + Number(points))} puntos para Premium`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={mutation.isPending}
                  className="rounded-xl h-11 px-5"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="rounded-xl h-11 px-6 shadow-lg shadow-violet-500/20 min-w-[140px] bg-violet-600 hover:bg-violet-700"
                >
                  {mutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Asignando...</>
                  ) : (
                    'Asignar Puntos'
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
