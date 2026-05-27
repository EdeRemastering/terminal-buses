import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { Users, Search, X, Armchair, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Badge } from '@/common/components/ui/badge';
import { PermissionGate } from '@/common/components/PermissionGate';
import { cn } from '@/common/utils';
import type { TripPassenger } from '@/modules/trips/types';
import type { Passenger } from '@/modules/passengers/types';

interface PassengerInfo {
  id: string;
  name: string;
  documentId: string;
  email: string;
  phone: string;
}

const toPassengerInfo = (p: { passenger_id: string; name: string; document_id: string; email: string; phone?: string }): PassengerInfo => ({
  id: p.passenger_id,
  name: p.name,
  documentId: p.document_id,
  email: p.email,
  phone: p.phone || '',
});

interface BusSeatingLayoutProps {
  capacity: number;
  passengers: TripPassenger[];
  availablePassengers: Passenger[];
  onDropOnSeat: (passengerId: string, seatNumber: number) => void;
  onRemovePassenger: (assignmentId: string) => void;
  onUnassignSeat?: (assignmentId: string) => void;
  onAddPassenger: (passengerId: string) => void;
  onEmptySeatClick?: (seatNumber: number) => void;
  onEditPassenger?: (passenger: Passenger) => void;
  onDeletePassenger?: (id: string) => void;
  isLoading?: boolean;
}

const SEATS_PER_ROW = 4;

interface SeatInfo {
  seatNumber: number;
  passenger: TripPassenger | null;
  side: 'left-window' | 'left-aisle' | 'right-aisle' | 'right-window';
  rowIndex: number;
}

const buildSeatGrid = (capacity: number, passengers: TripPassenger[]): SeatInfo[] => {
  const numRows = Math.ceil(capacity / SEATS_PER_ROW);
  const seats: SeatInfo[] = [];

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < SEATS_PER_ROW; col++) {
      const seatNumber = row * SEATS_PER_ROW + col + 1;
      if (seatNumber > capacity) break;

      const sideMap = ['left-window', 'left-aisle', 'right-aisle', 'right-window'] as const;
      const passenger = passengers.find(p => p.seat_number !== null && Number(p.seat_number) === seatNumber) || null;

      seats.push({
        seatNumber,
        passenger,
        side: sideMap[col],
        rowIndex: row,
      });
    }
  }

  return seats;
};

function DraggablePassenger({
  passenger,
  onAddPassenger,
  onEdit,
  onDelete,
}: {
  passenger: Passenger;
  onAddPassenger: (id: string) => void;
  onEdit?: (passenger: Passenger) => void;
  onDelete?: (id: string) => void;
}) {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: passenger.id,
    data: { type: 'passenger', passenger },
  });

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const handler = (e: MouseEvent) => {
      e.preventDefault();
      setMenuPos({ x: e.clientX, y: e.clientY });
    };

    el.addEventListener('contextmenu', handler);
    return () => el.removeEventListener('contextmenu', handler);
  }, []);

  return (
    <>
      <div
        ref={mergedRef}
        {...listeners}
        {...attributes}
        className={cn(
          'flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing group',
          isDragging
            ? 'opacity-40 border-primary/30 bg-primary/5'
            : 'bg-muted/30 border-transparent hover:border-primary/20 hover:bg-muted/60'
        )}
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
          {passenger.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{passenger.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{passenger.documentId}</p>
        </div>
        <PermissionGate permission="trip:manage-passengers">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => { e.stopPropagation(); onAddPassenger(passenger.id); }}
            title="Agregar sin asiento"
          >
            <Users className="w-3.5 h-3.5" />
          </Button>
        </PermissionGate>
      </div>

      {menuPos && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setMenuPos(null)} />
          <div
            className="fixed z-50 min-w-[140px] rounded-xl border bg-popover p-2 text-popover-foreground shadow-md"
            style={{ left: menuPos.x, top: menuPos.y }}
          >
            <PermissionGate permission="passenger:edit">
              <button
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => { setMenuPos(null); onEdit?.(passenger); }}
              >
                <Pencil className="w-4 h-4" /> Editar
              </button>
            </PermissionGate>
            <PermissionGate permission="passenger:delete">
              <button
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                onClick={() => { setMenuPos(null); onDelete?.(passenger.id); }}
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </PermissionGate>
          </div>
        </>
      )}
    </>
  );
}

function SeatDroppable({
  seat,
  onSeatClick,
  onKeyDown,
}: {
  seat: SeatInfo;
  onSeatClick: (seat: SeatInfo) => void;
  onKeyDown: (e: React.KeyboardEvent, seat: SeatInfo) => void;
}) {
  const droppable = useDroppable({
    id: `seat-${seat.seatNumber}`,
    data: { type: 'seat', seatNumber: seat.seatNumber },
  });

  const draggable = useDraggable({
    id: seat.passenger ? seat.passenger.passenger_id : `__empty-${seat.seatNumber}`,
    data: seat.passenger
      ? { type: 'seat-passenger', passenger: toPassengerInfo(seat.passenger), seatNumber: seat.seatNumber, assignmentId: seat.passenger.id }
      : { type: 'empty-seat', seatNumber: seat.seatNumber },
  });

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      droppable.setNodeRef(node);
      draggable.setNodeRef(node);
    },
    [droppable.setNodeRef, draggable.setNodeRef]
  );

  const hasPassenger = seat.passenger !== null;

  const color = hasPassenger
    ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-300'
    : droppable.isOver
      ? 'bg-primary/15 border-primary/50 scale-105 shadow-sm'
      : 'bg-muted/50 border-muted-foreground/20 text-muted-foreground hover:border-primary/30 hover:bg-muted/80';

  return (
    <div
      ref={mergedRef}
      {...(hasPassenger ? draggable.listeners : {})}
      {...(hasPassenger ? draggable.attributes : {})}
      role="button"
      tabIndex={0}
      onClick={() => onSeatClick(seat)}
      onKeyDown={(e) => onKeyDown(e, seat)}
      className={cn(
        'flex-1 h-14 min-w-[50px] rounded-xl border-2 transition-all duration-150 flex flex-col items-center justify-center relative text-[10px] font-semibold select-none',
        color,
        hasPassenger
          ? 'cursor-grab active:cursor-grabbing hover:border-primary/30 hover:ring-2 hover:ring-primary/10'
          : 'cursor-pointer hover:border-primary/50 hover:ring-2 hover:ring-primary/20',
        draggable.isDragging && 'opacity-40'
      )}
      title={hasPassenger ? `${seat.passenger!.name} - Asiento ${seat.seatNumber}${seat.passenger!.checked_in ? ' (Check-in)' : ''}` : `Asiento ${seat.seatNumber} — Click para asignar`}
    >
      {hasPassenger ? (
        <>
          <span className="truncate max-w-[70px] leading-tight text-xs font-bold">{seat.passenger!.name}</span>
          <span className="text-[9px] opacity-50">#{seat.seatNumber}</span>
        </>
      ) : (
        <>
          <Armchair className="w-4 h-4 mb-0.5 opacity-40" />
          <span className="text-[9px] opacity-50 font-medium">#{seat.seatNumber}</span>
        </>
      )}
    </div>
  );
}

function DraggableAssignedRow({
  tripPassenger,
  onUnassignSeat,
  onRemovePassenger,
}: {
  tripPassenger: TripPassenger;
  onUnassignSeat?: (assignmentId: string) => void;
  onRemovePassenger: (assignmentId: string) => void;
}) {
  const passengerInfo = useMemo(() => toPassengerInfo(tripPassenger), [tripPassenger]);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: tripPassenger.passenger_id,
    data: { type: 'passenger', passenger: passengerInfo },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center justify-between p-2 rounded-lg text-xs transition-colors group',
        isDragging ? 'opacity-40 bg-muted/30' : 'bg-muted/20 hover:bg-muted/40'
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn(
          'w-5 h-5 rounded flex items-center justify-center font-mono font-bold shrink-0 text-[9px]',
          tripPassenger.seat_number
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
        )}>
          {tripPassenger.seat_number ?? '—'}
        </span>
        <span className="truncate font-medium cursor-grab active:cursor-grabbing">{tripPassenger.name}</span>
      </div>
      <div className="flex items-center gap-0.5 shrink-0 ml-2">
        <PermissionGate permission="trip:manage-passengers">
          {tripPassenger.seat_number && onUnassignSeat && (
            <button
              onClick={(e) => { e.stopPropagation(); onUnassignSeat(tripPassenger.id); }}
              className="text-muted-foreground/60 hover:text-amber-600 transition-colors p-0.5"
              title="Liberar asiento"
            >
              <Armchair className="w-3 h-3" />
            </button>
          )}
        </PermissionGate>
        <PermissionGate permission="trip:manage-passengers">
          <button
            onClick={(e) => { e.stopPropagation(); onRemovePassenger(tripPassenger.id); }}
            className="text-muted-foreground/60 hover:text-destructive transition-colors p-0.5"
            title="Quitar del viaje"
          >
            <X className="w-3 h-3" />
          </button>
        </PermissionGate>
      </div>
    </div>
  );
}

export const BusSeatingLayout = ({
  capacity,
  passengers,
  availablePassengers,
  onDropOnSeat,
  onRemovePassenger,
  onUnassignSeat,
  onAddPassenger,
  onEmptySeatClick,
  onEditPassenger,
  onDeletePassenger,
  isLoading,
}: BusSeatingLayoutProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePassenger, setActivePassenger] = useState<PassengerInfo | null>(null);

  const seats = useMemo(() => buildSeatGrid(capacity, passengers), [capacity, passengers]);

  const occupiedSeats = passengers.filter(p => p.seat_number !== null).length;
  const pct = capacity > 0 ? Math.round((occupiedSeats / capacity) * 100) : 0;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  );

  const combinedList = useMemo(() => {
    const q = searchQuery.toLowerCase();

    const result: Array<{ type: 'available'; passenger: Passenger } | { type: 'assigned'; tripPassenger: TripPassenger }> = [];

    for (const p of availablePassengers) {
      const alreadyAssigned = passengers.some(tp => tp.passenger_id === p.id);
      if (alreadyAssigned) continue;
      if (q && !p.name.toLowerCase().includes(q) && !p.documentId.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) continue;
      result.push({ type: 'available', passenger: p });
    }

    for (const tp of passengers) {
      if (q && !tp.name.toLowerCase().includes(q) && !tp.document_id.toLowerCase().includes(q) && !tp.email.toLowerCase().includes(q)) continue;
      result.push({ type: 'assigned', tripPassenger: tp });
    }

    result.sort((a, b) => {
      const seatA = a.type === 'assigned' ? Number(a.tripPassenger.seat_number) : null;
      const seatB = b.type === 'assigned' ? Number(b.tripPassenger.seat_number) : null;
      if (seatA !== null && seatB !== null) return seatA - seatB;
      if (seatA !== null) return -1;
      if (seatB !== null) return 1;
      const nameA = a.type === 'assigned' ? a.tripPassenger.name : a.passenger.name;
      const nameB = b.type === 'assigned' ? b.tripPassenger.name : b.passenger.name;
      return nameA.localeCompare(nameB);
    });

    return result;
  }, [availablePassengers, passengers, searchQuery]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as { type: string; passenger: PassengerInfo } | undefined;
    if ((data?.type === 'passenger' || data?.type === 'seat-passenger') && data?.passenger) {
      setActivePassenger(data.passenger);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActivePassenger(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as { type: string; passenger?: PassengerInfo; seatNumber?: number } | undefined;
    if (!activeData || (activeData.type !== 'passenger' && activeData.type !== 'seat-passenger')) return;

    const overData = over.data.current as { type: string; seatNumber: number } | undefined;
    if (overData?.type !== 'seat') return;

    const seatNumber = overData.seatNumber;
    if (activeData.seatNumber === seatNumber) return;

    const passengerId = active.id as string;
    if (passengerId && seatNumber > 0) {
      onDropOnSeat(passengerId, seatNumber);
    }
  }, [onDropOnSeat]);

  const handleSeatClick = useCallback((seat: SeatInfo) => {
    if (!seat.passenger && onEmptySeatClick) {
      onEmptySeatClick(seat.seatNumber);
    }
  }, [onEmptySeatClick]);

  const handleSeatKeyDown = useCallback((e: React.KeyboardEvent, seat: SeatInfo) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSeatClick(seat);
    }
  }, [handleSeatClick]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Ocupacion</span>
            <Badge variant="outline" className="rounded-lg font-mono">
              {occupiedSeats} / {capacity}
            </Badge>
            <Badge variant={pct >= 80 ? 'default' : pct >= 50 ? 'secondary' : 'outline'} className="rounded-lg">
              {pct}%
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300 dark:bg-blue-500/20 dark:border-blue-500/30" />
              Ocupado
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-muted/50 border border-muted-foreground/20" />
              Disponible
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="relative bg-card border rounded-2xl p-6 pt-10 shadow-sm">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                Cabina
              </div>

              <div className="w-full max-w-sm mx-auto space-y-2">
                {Array.from({ length: Math.ceil(seats.length / SEATS_PER_ROW) }).map((_, rowIdx) => {
                  const rowSeats = seats.slice(rowIdx * SEATS_PER_ROW, rowIdx * SEATS_PER_ROW + SEATS_PER_ROW);
                  return (
                    <div key={rowIdx} className="flex items-center gap-2">
                      <span className="w-5 text-[10px] font-bold text-muted-foreground/30 text-right shrink-0">
                        {rowIdx + 1}
                      </span>
                      {rowSeats.slice(0, 2).map(seat => (
                        <SeatDroppable
                          key={seat.seatNumber}
                          seat={seat}
                          onSeatClick={handleSeatClick}
                          onKeyDown={handleSeatKeyDown}
                        />
                      ))}

                      <div className="w-8 flex items-center justify-center">
                        <div className="w-4 h-full flex items-center justify-center">
                          {rowIdx === 0 && (
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="w-0.5 h-2 bg-muted-foreground/10 rounded-full" />
                              <div className="w-0.5 h-2 bg-muted-foreground/10 rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>

                      {rowSeats.slice(2, 4).map(seat => (
                        <SeatDroppable
                          key={seat.seatNumber}
                          seat={seat}
                          onSeatClick={handleSeatClick}
                          onKeyDown={handleSeatKeyDown}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center text-[10px] text-muted-foreground/30 uppercase tracking-[0.15em] font-bold">
                Panel frontal
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 shrink-0 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pasajero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5 pr-1">
              {isLoading ? (
                <div className="text-center py-8 text-sm text-muted-foreground">Cargando pasajeros...</div>
              ) : combinedList.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  {searchQuery ? 'Sin resultados' : 'No hay pasajeros disponibles'}
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto space-y-1.5">
                  {combinedList.map(item => {
                    if (item.type === 'available') {
                      return (
                        <DraggablePassenger
                          key={item.passenger.id}
                          passenger={item.passenger}
                          onAddPassenger={onAddPassenger}
                          onEdit={onEditPassenger}
                          onDelete={onDeletePassenger}
                        />
                      );
                    }
                    return (
                      <DraggableAssignedRow
                        key={item.tripPassenger.id}
                        tripPassenger={item.tripPassenger}
                        onUnassignSeat={onUnassignSeat}
                        onRemovePassenger={onRemovePassenger}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DragOverlay modifiers={[snapCenterToCursor]}>
        {activePassenger ? (
          <div className="h-14 w-[70px] rounded-xl border-2 border-primary/40 bg-blue-100 dark:bg-blue-500/20 dark:border-blue-500/30 shadow-lg cursor-grabbing pointer-events-none flex flex-col items-center justify-center text-[10px] font-semibold select-none">
            <span className="truncate max-w-[60px] leading-tight text-xs font-bold text-blue-800 dark:text-blue-300">{activePassenger.name}</span>
            <span className="text-[9px] opacity-40 text-blue-800 dark:text-blue-300">asiento</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
