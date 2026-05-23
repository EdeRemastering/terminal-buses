export interface Bus {
  id: string;
  plate: string;
  model: string;
  capacity: number;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  type: 'EXPRESS' | 'LUXURY' | 'STANDARD';
  year: number;
  mileage: number;
  lastMaintenance: string;
}
