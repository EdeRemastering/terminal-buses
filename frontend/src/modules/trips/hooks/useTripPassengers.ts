import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/common/utils/api-client';
import { getErrorMessage } from '@/common/utils';
import {
  addTripPassenger,
  removeTripPassenger,
  assignSeat as assignSeatApi,
  clearSeat as clearSeatApi,
} from '@/modules/trips/api/tripPassengers';
import type { TripPassenger } from '@/modules/trips/types';

const setIfChanged = (prev: TripPassenger[], next: TripPassenger[]) => {
  if (prev.length !== next.length) return next;
  const prevStr = JSON.stringify(prev);
  const nextStr = JSON.stringify(next);
  return prevStr === nextStr ? prev : next;
};

export const useTripPassengers = (tripId: string) => {
  const queryClient = useQueryClient();
  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPassengers = useCallback(async () => {
    if (!tripId) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/trips/${tripId}`);
      setPassengers(prev => setIfChanged(prev, response.data.data.passengers || []));
    } catch {
      console.warn('[useTripPassengers] error al cargar pasajeros');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  const addPassenger = useCallback(async (passengerId: string) => {
    try {
      const result = await addTripPassenger(tripId, passengerId);
      const updated = Array.isArray(result) ? result : [result];
      setPassengers(prev => setIfChanged(prev, updated));
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Pasajero agregado al viaje');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [tripId, queryClient]);

  const removePassengerById = useCallback(async (assignmentId: string) => {
    setPassengers(prev => prev.filter(p => p.id !== assignmentId));
    try {
      await removeTripPassenger(tripId, assignmentId);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Pasajero removido del viaje');
    } catch (err) {
      await loadPassengers();
      toast.error(getErrorMessage(err));
    }
  }, [tripId, queryClient, loadPassengers]);

  const assignSeatToPassenger = useCallback(async (assignmentId: string, seatNumber: number) => {
    setPassengers(prev =>
      prev.map(p => p.id === assignmentId ? { ...p, seat_number: seatNumber } : p)
    );
    try {
      const result = await assignSeatApi(tripId, assignmentId, seatNumber);
      if (result.passengers) setPassengers(prev => setIfChanged(prev, result.passengers));
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success(`Asiento ${seatNumber} asignado`);
    } catch (err) {
      await loadPassengers();
      toast.error(getErrorMessage(err));
    }
  }, [tripId, queryClient, loadPassengers]);

  const unassignSeat = useCallback(async (assignmentId: string) => {
    setPassengers(prev =>
      prev.map(p => p.id === assignmentId ? { ...p, seat_number: null } : p)
    );
    try {
      const result = await clearSeatApi(tripId, assignmentId);
      if (result.passengers) setPassengers(prev => setIfChanged(prev, result.passengers));
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Asiento liberado');
    } catch (err) {
      await loadPassengers();
      toast.error(getErrorMessage(err));
    }
  }, [tripId, queryClient, loadPassengers]);

  const dropOnSeat = useCallback(async (passengerId: string, seatNumber: number) => {
    const alreadyAssigned = passengers.find(p => p.passenger_id === passengerId);
    if (alreadyAssigned) {
      setPassengers(prev =>
        prev.map(p => p.passenger_id === passengerId ? { ...p, seat_number: seatNumber } : p)
      );
      try {
        const result = await assignSeatApi(tripId, alreadyAssigned.id, seatNumber);
        if (result.passengers) setPassengers(prev => setIfChanged(prev, result.passengers));
        queryClient.invalidateQueries({ queryKey: ['trips'] });
      } catch (err) {
        await loadPassengers();
        toast.error(getErrorMessage(err));
      }
    } else {
      try {
        const result = await addTripPassenger(tripId, passengerId);
        const added = Array.isArray(result) ? result : [result];
        const newAssignment = added.find((p: TripPassenger) => p.passenger_id === passengerId);
        if (newAssignment) {
          const result2 = await assignSeatApi(tripId, newAssignment.id, seatNumber);
          if (result2.passengers) setPassengers(prev => setIfChanged(prev, result2.passengers));
        }
        queryClient.invalidateQueries({ queryKey: ['trips'] });
      } catch (err) {
        await loadPassengers();
        toast.error(getErrorMessage(err));
      }
    }
  }, [passengers, tripId, queryClient, loadPassengers]);

  return {
    passengers,
    isLoading,
    loadPassengers,
    addPassenger,
    removePassenger: removePassengerById,
    assignSeat: assignSeatToPassenger,
    unassignSeat,
    dropOnSeat,
  };
};
