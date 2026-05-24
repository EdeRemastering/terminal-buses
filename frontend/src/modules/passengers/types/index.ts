export interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentId: string;
  frequentTravelerPoints: number;
  status: 'ACTIVE' | 'INACTIVE';
  lastTripDate?: string;
  upcomingTrip?: {
    id: string;
    route: string;
    date: string;
  };
}
