export type TripStatus = 'PENDING' | 'BOARDING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  busId: string;
  price: number;
  status: 'PENDING' | 'BOARDING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  availableSeats: number;
  routeName?: string;
  driverId?: string;
  driverName?: string;
  capacity?: number;
}

export interface CreateTripRequest {
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  busId: string;
  price: number;
}

export interface TripPassenger {
  id: string;
  trip_id: string;
  passenger_id: string;
  seat_number: number | null;
  checked_in: boolean;
  ticket_price: string;
  name: string;
  email: string;
  phone: string;
  document_id: string;
}
