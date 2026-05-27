import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Bus, ShieldCheck, ArrowRight, Loader2, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/common/components/ui/dialog';

import { loginSchema, type LoginFormValues } from '@/modules/auth/schemas/loginSchema';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Card } from '@/common/components/ui/card';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (credentials: LoginFormValues) => {
    try {
      setError(null);
      await login(credentials);
      onSuccess();
    } catch {
      setError('Credenciales inválidas. Por favor intente de nuevo.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="text-center lg:text-left mb-10">
        <div className="lg:hidden flex justify-center mb-6">
          <Bus className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-3xl font-bold tracking-tight text-foreground mb-2">Bienvenido de nuevo</h3>
        <p className="text-muted-foreground">Ingresa tus credenciales para acceder al centro de control</p>
      </div>

      <Card className="p-8 border-none shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-all duration-300 group-hover:w-2" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-start gap-3"
            >
              <div className="text-destructive mt-0.5 text-sm font-medium">{error}</div>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder="nombre@terminal.com"
                className="pl-4 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Contraseña</Label>
              <button type="button" className="text-xs text-primary hover:underline font-medium" onClick={() => setShowResetDialog(true)}>¿Olvidaste tu contraseña?</button>
            </div>
            <Input
              {...register('password')}
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-4 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all"
            />
            {errors.password && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Autenticando...
              </>
            ) : (
              <>
                Entrar al Sistema
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </Card>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restablecer Contraseña</DialogTitle>
            <DialogDescription>
              Contacta al administrador del sistema para restablecer tu contraseña.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
            <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              Envía un correo a <strong>admin@terminal.com</strong> solicitando el restablecimiento.
            </p>
          </div>
          <a
            href="mailto:admin@terminal.com?subject=Solicitud%20de%20restablecimiento%20de%20contraseña&body=Hola,%20solicito%20el%20restablecimiento%20de%20mi%20contraseña%20de%20acceso%20al%20sistema."
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors mt-2"
          >
            <Mail className="w-4 h-4" />
            Enviar Correo
          </a>
        </DialogContent>
      </Dialog>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="w-4 h-4" />
        <span>Acceso seguro y encriptado</span>
      </div>
    </motion.div>
  );
};
