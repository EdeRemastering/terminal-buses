export interface DashboardStats {
  totalBuses: number;
  activeTrips: number;
  totalPassengers: number;
  availableDrivers: number;
  tripsToday: number;
  avgOccupancy: number;
  recentTrips: RecentTrip[];
}

export interface RecentTrip {
  id: string;
  code: string;
  route_id: string;
  bus_id: string;
  driver_profile_id: string | null;
  departure_time: string;
  arrival_time: string;
  price: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  origin: string;
  destination: string;
  bus_code: string;
}
