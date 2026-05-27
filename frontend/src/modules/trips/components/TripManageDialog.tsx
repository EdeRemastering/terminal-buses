import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Bus as BusIcon, Clock, DollarSign, Calendar, Users, Loader2,
  User, Mail, Phone, FileText, CheckCircle2, AlertCircle, Award, Play, DoorOpen,
} from 'lucide-react';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Separator } from '@/common/components/ui/separator';
import { PermissionGate } from '@/common/components/PermissionGate';
import { cn, formatCurrency } from '@/common/utils';
import { BusSeatingLayout } from '@/modules/trips/components/BusSeatingLayout';
import { BusSeatingLayoutSkeleton } from '@/modules/trips/components/BusSeatingLayoutSkeleton';
import { useTripPassengers } from '@/modules/trips/hooks/useTripPassengers';
import { usePassengers } from '@/modules/passengers/hooks/usePassengers';
import { useCreatePassenger } from '@/modules/passengers/hooks/useCreatePassenger';
import { useDeletePassenger } from '@/modules/passengers/hooks/useDeletePassenger';
import { EditPassengerDialog } from '@/modules/passengers/components/EditPassengerDialog';
import { createPassengerSchema, type CreatePassengerInput } from '@/modules/passengers/schemas/passengerSchema';
import type { Trip, TripStatus } from '@/modules/trips/types';
import type { Passenger } from '@/modules/passengers/types';
import { statusConfig } from '@/modules/trips/components/tripStatusConfig';
import { useUpdateTripStatus } from '@/modules/trips/hooks/useUpdateTripStatus';

type FormErrors = Partial<Record<keyof CreatePassengerInput, string>>;

interface TripManageDialogProps {
  trip: Trip | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (trip: Trip) => void;
  onCancel: (trip: Trip) => void;
}

const formFields = [
  { name: 'name' as const, label: 'Nombre Completo', icon: User, placeholder: 'Ej. Juan Perez', type: 'text' },
  { name: 'email' as const, label: 'Correo Electronico', icon: Mail, placeholder: 'ej: juan@correo.com', type: 'email' },
  { name: 'phone' as const, label: 'Telefono', icon: Phone, placeholder: '300 123 4567', type: 'text' },
  { name: 'documentId' as const, label: 'Identificacion', icon: FileText, placeholder: 'Ej. CC-1012345678', type: 'text' },
];

const statusTransitions: Record<TripStatus, { status: TripStatus; label: string; icon: typeof Play }[] | null> = {
  PENDING: [{ status: 'BOARDING', label: 'Iniciar Abordaje', icon: DoorOpen }],
  BOARDING: [{ status: 'IN_PROGRESS', label: 'Iniciar Viaje', icon: Play }],
  IN_PROGRESS: [{ status: 'FINISHED', label: 'Finalizar Viaje', icon: CheckCircle2 }],
  FINISHED: null,
  CANCELLED: null,
};

const canCancel = (status: TripStatus) => status === 'PENDING' || status === 'BOARDING' || status === 'IN_PROGRESS';

export const TripManageDialog = ({ trip, open, onOpenChange, onEdit, onCancel }: TripManageDialogProps) => {
  const [activeTab, setActiveTab] = useState('info');
  const [seatToFill, setSeatToFill] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const { mutate: updateStatus, isPending: isStatusUpdating } = useUpdateTripStatus();

  const {
    passengers,
    isLoading: tripPassengersLoading,
    loadPassengers,
    addPassenger,
    removePassenger,
    unassignSeat,
    dropOnSeat,
  } = useTripPassengers(trip?.id ?? '');

  const { data: allPassengers, isLoading: passengersLoading } = usePassengers();
  const { mutateAsync: createPassenger, isPending: isCreating } = useCreatePassenger();

  useEffect(() => {
    if (open && trip) {
      loadPassengers();
      setActiveTab('info');
    }
  }, [open, trip, loadPassengers]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});
    setFormSubmitted(true);

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
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreatePassengerInput;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setFormErrors(fieldErrors);
      return;
    }

    try {
      const newPassenger = await createPassenger(result.data);
      setFormSuccess(true);
      if (seatToFill && trip) {
        await dropOnSeat(newPassenger.id, seatToFill);
      }
      setTimeout(() => {
        setFormSuccess(false);
        setSeatToFill(null);
        setFormSubmitted(false);
      }, 800);
    } catch {
      setFormSuccess(false);
      setSeatToFill(null);
      setFormSubmitted(false);
    }
  };

  const handleSeatFormClose = () => {
    setSeatToFill(null);
    setFormErrors({});
    setFormSuccess(false);
    setFormSubmitted(false);
  };

  const { mutate: deletePassenger } = useDeletePassenger();

  const handleEditPassenger = (passenger: Passenger) => {
    setEditingPassenger(passenger);
  };

  const handleDeletePassenger = (id: string) => {
    deletePassenger(id);
  };

  if (!trip) return null;

  const canManagePassengers = trip.status === 'PENDING' || trip.status === 'BOARDING';
  const isFormError = (name: keyof CreatePassengerInput) => formSubmitted && !!formErrors[name];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden max-h-[95vh] flex flex-col">
          <div className={cn(
            "absolute top-0 left-0 w-full h-1.5 transition-colors shrink-0",
            statusConfig[trip.status].color.split(' ')[0]
          )} />

          <div className="p-6 pb-0 shrink-0">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold">
                      {trip.origin} &rarr; {trip.destination}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Gestion del viaje
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn("rounded-lg border shadow-none px-3 py-1", statusConfig[trip.status].color)}
                >
                  {statusConfig[trip.status].label}
                </Badge>
              </div>
            </DialogHeader>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="px-6 shrink-0">
              <TabsList className="rounded-xl">
                <TabsTrigger value="info" className="rounded-lg">Informacion</TabsTrigger>
                <TabsTrigger value="seats" className="rounded-lg" disabled={!canManagePassengers}>
                  Asientos
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="info" className="flex-1 overflow-y-auto p-6 pt-4 m-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 border-none bg-muted/30 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Fecha
                  </p>
                  <p className="font-bold text-sm">{new Date(trip.departureTime).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}</p>
                </Card>
                <Card className="p-4 border-none bg-muted/30 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Horario
                  </p>
                  <p className="font-bold text-sm">
                    {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &mdash; {new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </Card>
                <Card className="p-4 border-none bg-muted/30 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
                    <BusIcon className="w-3 h-3" /> Unidad
                  </p>
                  <p className="font-bold text-sm">{trip.busId}</p>
                </Card>
                <Card className="p-4 border-none bg-muted/30 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Precio
                  </p>
                  <p className="font-bold text-sm">{formatCurrency(trip.price)}</p>
                </Card>
              </div>

              {trip.driverName && (
                <div className="mt-4 p-4 rounded-xl bg-muted/20 border border-muted/30">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Conductor asignado</p>
                  <p className="font-semibold">{trip.driverName}</p>
                </div>
              )}

              <Separator className="my-6" />

              <div className="flex flex-wrap items-center justify-end gap-3">
                <PermissionGate permission="trip:manage-passengers">
                  {canManagePassengers && (
                    <Button variant="outline" className="rounded-xl" onClick={() => setActiveTab('seats')}>
                      <Users className="w-4 h-4 mr-2" />
                      Administrar Asientos ({passengers.length})
                    </Button>
                  )}
                </PermissionGate>
                <PermissionGate permission="trip:edit">
                  {statusTransitions[trip.status]?.map(t => {
                    const Icon = t.icon;
                    return (
                      <Button
                        key={t.status}
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => updateStatus({ id: trip.id, status: t.status })}
                        disabled={isStatusUpdating}
                      >
                        {isStatusUpdating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Icon className="w-4 h-4 mr-2" />
                        )}
                        {t.label}
                      </Button>
                    );
                  })}
                </PermissionGate>
                <PermissionGate permission="trip:edit">
                  {trip.status === 'PENDING' && (
                    <Button variant="outline" className="rounded-xl" onClick={() => { onEdit(trip); onOpenChange(false); }}>
                      Editar Viaje
                    </Button>
                  )}
                </PermissionGate>
                <PermissionGate permission="trip:delete">
                  {canCancel(trip.status) && (
                    <Button variant="destructive" className="rounded-xl" onClick={() => { onCancel(trip); onOpenChange(false); }}>
                      Cancelar Viaje
                    </Button>
                  )}
                </PermissionGate>
              </div>
            </TabsContent>

            <TabsContent value="seats" className="flex-1 overflow-y-auto p-6 pt-4 m-0">
              {passengersLoading || tripPassengersLoading ? (
                <BusSeatingLayoutSkeleton capacity={trip.capacity ?? 40} />
              ) : (
                <BusSeatingLayout
                  capacity={trip.capacity ?? 40}
                  passengers={passengers}
                  availablePassengers={allPassengers ?? []}
                  onDropOnSeat={dropOnSeat}
                  onRemovePassenger={removePassenger}
                  onUnassignSeat={unassignSeat}
                  onAddPassenger={addPassenger}
                  onEmptySeatClick={setSeatToFill}
                  onEditPassenger={handleEditPassenger}
                  onDeletePassenger={handleDeletePassenger}
                  isLoading={tripPassengersLoading}
                />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={seatToFill !== null} onOpenChange={(next) => { if (!next) handleSeatFormClose(); }}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <div className={cn(
            "absolute top-0 left-0 w-full h-1.5 transition-colors duration-500",
            formSuccess ? "bg-emerald-500" : "bg-primary"
          )} />

          <div className="p-6 pb-0">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">
                    Asiento #{seatToFill}
                  </DialogTitle>
                  <DialogDescription>
                    Ingresa los datos del pasajero para este asiento.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <AnimatePresence mode="wait">
            {formSuccess ? (
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
                  <h3 className="font-bold text-lg">Pasajero Asignado</h3>
                  <p className="text-sm text-muted-foreground">El pasajero se asigno al asiento #{seatToFill}.</p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleFormSubmit}
                className="p-6 pt-4 space-y-5"
              >
                {formFields.map(({ name, label, icon: Icon, placeholder, type }) => (
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
                        {formErrors[name]}
                      </motion.p>
                    )}
                  </div>
                ))}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-muted/30">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSeatFormClose}
                    className="rounded-xl h-11 px-5"
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 min-w-[140px]"
                  >
                    {isCreating ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Asignando...
                      </span>
                    ) : (
                      'Asignar Pasajero'
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <EditPassengerDialog
        open={editingPassenger !== null}
        onOpenChange={(next) => { if (!next) setEditingPassenger(null); }}
        passenger={editingPassenger}
      />
    </>
  );
};
