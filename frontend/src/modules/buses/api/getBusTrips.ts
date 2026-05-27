import apiClient from '@/common/utils/api-client';

export interface BusTrip {
  id: string;
  code: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  routeName: string;
  driverName: string;
  status: string;
}

export const getBusTrips = async (busId: string): Promise<BusTrip[]> => {
  const response = await apiClient.get(`/buses/${busId}/trips`);
  return response.data.data;
};
