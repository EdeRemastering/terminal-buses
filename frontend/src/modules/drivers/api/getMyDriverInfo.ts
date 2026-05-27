import apiClient from '@/common/utils/api-client';

export interface DriverTrip {
  id: string;
  code: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  busCode: string;
  price: number;
  status: string;
  routeName: string;
  capacity: number;
  passengers?: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    document_id: string;
    seat_number: string | null;
    checked_in: boolean;
    ticket_price: number;
  }>;
}

export interface DriverInfo {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiration: string;
  availability: string;
  rating: number;
  completedTrips: number;
  currentTrip: DriverTrip | null;
  history: DriverTrip[];
}

export const getMyDriverInfo = async (): Promise<DriverInfo> => {
  const response = await apiClient.get('/driver/my-info');
  return response.data.data;
};
