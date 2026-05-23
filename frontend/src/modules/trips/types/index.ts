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
