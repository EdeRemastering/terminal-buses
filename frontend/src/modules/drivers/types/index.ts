export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiration: string;
  phone: string;
  email: string;
  availability: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY';
  rating: number;
  completedTrips: number;
}
