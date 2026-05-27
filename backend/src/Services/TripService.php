<?php

namespace App\Services;

use App\Repositories\TripRepository;
use App\Repositories\TripPassengerRepository;
use App\Repositories\TripHistoryRepository;
use App\Repositories\BusRepository;
use App\Repositories\DriverProfileRepository;
use App\Repositories\RouteRepository;
use App\Repositories\PassengerRepository;
use RuntimeException;

class TripService
{
    public function __construct(
        private TripRepository $tripRepo = new TripRepository(),
        private TripPassengerRepository $tripPassengerRepo = new TripPassengerRepository(),
        private TripHistoryRepository $historyRepo = new TripHistoryRepository(),
        private BusRepository $busRepo = new BusRepository(),
        private DriverProfileRepository $driverRepo = new DriverProfileRepository(),
        private RouteRepository $routeRepo = new RouteRepository(),
        private PassengerRepository $passengerRepo = new PassengerRepository(),
    ) {}

    private function attachAvailableSeats(array &$trips): void
    {
        $codes = array_map(fn($t) => $t['code'] ?? $t['trip_code'] ?? '', $trips);
        $codes = array_values(array_filter($codes));

        if (empty($codes)) return;

        $occupancyMap = $this->tripRepo->findOccupancyByCodes($codes);

        foreach ($trips as &$t) {
            $code = $t['code'] ?? $t['trip_code'] ?? '';
            $t['available_seats'] = $occupancyMap[$code] ?? 0;
        }
    }

    public function getAll(int $page = 1, int $perPage = 100): array
    {
        if ($perPage > 1000) $perPage = 1000;
        $trips = $this->tripRepo->findAllPaginated($page, $perPage);
        $this->attachAvailableSeats($trips);
        return array_map(fn($t) => $this->format($t), $trips);
    }

    public function getById(string $id): array
    {
        $trip = $this->tripRepo->findById($id);
        if (!$trip) throw new RuntimeException('Viaje no encontrado');

        $wrapped = [$trip];
        $this->attachAvailableSeats($wrapped);

        $result = $this->format($wrapped[0]);
        $result['passengers'] = $this->tripPassengerRepo->findByTripId($trip['id']);
        $result['history'] = $this->historyRepo->findByTripId($trip['id']);

        return $result;
    }

    private const VALID_TRANSITIONS = [
        'PENDING'    => ['BOARDING', 'CANCELLED'],
        'BOARDING'   => ['IN_PROGRESS', 'CANCELLED'],
        'IN_PROGRESS' => ['FINISHED', 'CANCELLED'],
        'FINISHED'   => [],
        'CANCELLED'  => [],
    ];

    public function create(array $data): array
    {
        $routeCode = $data['routeCode'] ?? $data['routeId'] ?? null;
        $busCode = $data['busCode'] ?? $data['busId'] ?? null;

        if (!$routeCode || !$busCode) {
            throw new RuntimeException('El código de ruta y de bus son requeridos');
        }

        $route = $this->routeRepo->findByCode($routeCode);
        if (!$route) throw new RuntimeException('Ruta no encontrada: ' . $routeCode);

        if ($route['status'] !== 'ACTIVE') {
            throw new RuntimeException('La ruta "' . $route['name'] . '" no está activa');
        }

        $bus = $this->busRepo->findByCode($busCode);
        if (!$bus) throw new RuntimeException('Bus no encontrado: ' . $busCode);

        if ($bus['status'] !== 'OPERATIONAL') {
            throw new RuntimeException('El bus ' . $busCode . ' no está operativo (estado: ' . $bus['status'] . ')');
        }

        if (empty($data['departureDate']) || empty($data['departureTime'])) {
            throw new RuntimeException('La fecha y hora de salida son requeridas');
        }

        $departure = $data['departureDate'] . ' ' . $data['departureTime'];
        $arrivalDate = $data['arrivalDate'] ?? null;
        $arrivalTime = $data['arrivalTime'] ?? null;

        if ($arrivalDate === null && $arrivalTime !== null) {
            $arrivalDate = $data['departureDate'];
        }
        if ($arrivalTime === null) {
            $arrivalTime = $data['departureTime'];
        }

        $arrival = $arrivalDate . ' ' . $arrivalTime;

        if (strtotime($departure) <= time()) {
            throw new RuntimeException('La fecha de salida debe ser posterior al momento actual');
        }

        if (strtotime($arrival) <= strtotime($departure)) {
            throw new RuntimeException('La hora de llegada debe ser posterior a la de salida');
        }

        if ((strtotime($arrival) - strtotime($departure)) > 86400) {
            if (empty($data['arrivalDate'])) {
                throw new RuntimeException('Para viajes que cruzan la medianoche, la fecha de llegada es obligatoria');
            }
        }

        if (!isset($data['price']) || !is_numeric($data['price']) || (float)$data['price'] <= 0) {
            throw new RuntimeException('El precio es requerido y debe ser un número positivo');
        }

        $departureTime = $departure . ':00';
        $arrivalTimeFull = $arrival . ':00';

        if ($this->tripRepo->existsOverlappingBusTrip($bus['id'], $departureTime, $arrivalTimeFull)) {
            throw new RuntimeException('El bus ' . $busCode . ' ya tiene un viaje programado en ese horario');
        }

        $driverProfileId = null;
        if (!empty($data['driverId'])) {
            $driver = $this->driverRepo->findByCode($data['driverId']);
            if (!$driver) throw new RuntimeException('Conductor no encontrado: ' . $data['driverId']);

            if ($driver['availability'] !== 'AVAILABLE') {
                throw new RuntimeException('El conductor ' . $data['driverId'] . ' no está disponible (estado: ' . $driver['availability'] . ')');
            }

            if ($this->tripRepo->existsOverlappingDriverTrip($driver['id'], $departureTime, $arrivalTimeFull)) {
                throw new RuntimeException('El conductor ' . $data['driverId'] . ' ya tiene un viaje programado en ese horario');
            }

            $driverProfileId = $driver['id'];
        }

        $id = $this->tripRepo->create([
            'code'              => $this->tripRepo->nextCode(),
            'route_id'          => $route['id'],
            'bus_id'            => $bus['id'],
            'driver_profile_id' => $driverProfileId,
            'departure_time'    => $departureTime,
            'arrival_time'      => $arrivalTimeFull,
            'price'             => $data['price'],
            'status'            => 'PENDING',
        ]);

        return $this->getById($id);
    }

    public function update(string $id, array $data): array
    {
        $trip = $this->tripRepo->findById($id);
        if (!$trip) throw new RuntimeException('Viaje no encontrado');

        if ($trip['status'] !== 'PENDING') {
            throw new RuntimeException('No se puede editar un viaje en estado ' . $trip['status']);
        }

        if (array_key_exists('driverId', $data)) {
            if (!empty($data['driverId'])) {
                $driver = $this->driverRepo->findByCode($data['driverId']);
                if (!$driver) throw new RuntimeException('Conductor no encontrado: ' . $data['driverId']);

                if ($driver['availability'] !== 'AVAILABLE') {
                    throw new RuntimeException('El conductor ' . $data['driverId'] . ' no está disponible (estado: ' . $driver['availability'] . ')');
                }

                $data['driver_profile_id'] = $driver['id'];
            } else {
                $data['driver_profile_id'] = null;
            }
            unset($data['driverId']);
        }

        $scheduleChanged = array_key_exists('bus_id', $data) || array_key_exists('departure_time', $data) || array_key_exists('arrival_time', $data);
        $driverChanged = array_key_exists('driver_profile_id', $data);

        $effectiveBusId = $data['bus_id'] ?? $trip['bus_id'];
        $effectiveDeparture = $data['departure_time'] ?? $trip['departure_time'];
        $effectiveArrival = $data['arrival_time'] ?? $trip['arrival_time'];
        $effectiveDriverProfileId = $data['driver_profile_id'] ?? $trip['driver_profile_id'];

        if ($scheduleChanged) {
            $bus = $this->busRepo->findById($effectiveBusId);
            if ($bus && $bus['status'] !== 'OPERATIONAL') {
                throw new RuntimeException('El bus ' . $bus['code'] . ' no está operativo (estado: ' . $bus['status'] . ')');
            }

            if ($this->tripRepo->existsOverlappingBusTrip($effectiveBusId, $effectiveDeparture, $effectiveArrival, $id)) {
                $busCode = $bus['code'] ?? $effectiveBusId;
                throw new RuntimeException('El bus ' . $busCode . ' ya tiene un viaje programado en ese horario');
            }
        }

        if ($scheduleChanged || $driverChanged) {
            if (!empty($effectiveDriverProfileId)) {
                if ($this->tripRepo->existsOverlappingDriverTrip($effectiveDriverProfileId, $effectiveDeparture, $effectiveArrival, $id)) {
                    $driverCode = $data['driverId'] ?? $trip['driver_code'] ?? $effectiveDriverProfileId;
                    throw new RuntimeException('El conductor ' . $driverCode . ' ya tiene un viaje programado en ese horario');
                }
            }
        }

        $this->tripRepo->update($id, $data);
        return $this->getById($id);
    }

    public function updateStatus(string $id, string $status): array
    {
        $valid = ['PENDING', 'BOARDING', 'IN_PROGRESS', 'FINISHED', 'CANCELLED'];
        if (!in_array($status, $valid)) {
            throw new RuntimeException('Estado inválido. Use: ' . implode(', ', $valid));
        }

        $trip = $this->tripRepo->findById($id);
        if (!$trip) throw new RuntimeException('Viaje no encontrado');

        $allowed = self::VALID_TRANSITIONS[$trip['status']] ?? [];
        if (!in_array($status, $allowed)) {
            throw new RuntimeException(
                'No se puede cambiar el estado de "' . $trip['status'] . '" a "' . $status . '". ' .
                'Transiciones permitidas: ' . (empty($allowed) ? 'ninguna' : implode(', ', $allowed))
            );
        }

        if ($status === 'FINISHED') {
            $passengers = $this->tripPassengerRepo->findByTripId($id);
            if (empty($passengers)) {
                throw new RuntimeException('No se puede finalizar un viaje sin pasajeros');
            }
        }

        $this->tripRepo->updateStatus($id, $status);

        if (!empty($trip['driver_profile_id'])) {
            $driverId = $trip['driver_profile_id'];

            if ($status === 'IN_PROGRESS') {
                $this->driverRepo->updateAvailability($driverId, 'ON_TRIP');
            } elseif ($status === 'FINISHED') {
                $this->driverRepo->updateAvailability($driverId, 'AVAILABLE');
                $this->driverRepo->incrementCompletedTrips($driverId);
            } elseif ($status === 'CANCELLED' && in_array($trip['status'], ['BOARDING', 'IN_PROGRESS'])) {
                $this->driverRepo->updateAvailability($driverId, 'AVAILABLE');
            }
        }

        return $this->getById($id);
    }

    public function addPassenger(string $tripId, array $data): array
    {
        $trip = $this->tripRepo->findById($tripId);
        if (!$trip) throw new RuntimeException('Viaje no encontrado');

        if (!in_array($trip['status'], ['PENDING', 'BOARDING'])) {
            throw new RuntimeException('No se pueden agregar pasajeros a un viaje ' . $trip['status']);
        }

        $passengerId = $data['passengerId'] ?? $data['passenger_id'] ?? '';
        if (!$passengerId) throw new RuntimeException('ID de pasajero requerido');

        $passenger = $this->passengerRepo->findById($passengerId);
        if (!$passenger) throw new RuntimeException('Pasajero no encontrado');

        if ($passenger['status'] !== 'ACTIVE') {
            throw new RuntimeException('El pasajero "' . $passenger['name'] . '" no está activo');
        }

        $alreadyInTrip = $this->tripPassengerRepo->existsByPassengerAndTrip($passengerId, $tripId);
        if ($alreadyInTrip) {
            throw new RuntimeException('El pasajero ya está registrado en este viaje');
        }

        $occupancyMap = $this->tripRepo->findOccupancyByCodes([$trip['code']]);
        $available = $occupancyMap[$trip['code']] ?? (int) $trip['capacity'];
        if ($available <= 0) throw new RuntimeException('El viaje esta completamente ocupado');

        $this->tripPassengerRepo->create([
            'trip_id'      => $tripId,
            'passenger_id' => $passengerId,
            'ticket_price' => $data['ticketPrice'] ?? $data['ticket_price'] ?? $trip['price'],
        ]);

        return $this->tripPassengerRepo->findByTripId($tripId);
    }

    public function removePassenger(string $tripId, string $passengerAssignmentId): void
    {
        $trip = $this->tripRepo->findById($tripId);
        if (!$trip) throw new RuntimeException('Viaje no encontrado');

        if (!in_array($trip['status'], ['PENDING', 'BOARDING'])) {
            throw new RuntimeException('No se pueden remover pasajeros de un viaje ' . $trip['status']);
        }

        $assignment = $this->tripPassengerRepo->findById($passengerAssignmentId);
        if (!$assignment || $assignment['trip_id'] !== $tripId) {
            throw new RuntimeException('La asignación de pasajero no pertenece a este viaje');
        }

        $this->tripPassengerRepo->delete($passengerAssignmentId);
    }

    public function assignSeat(string $tripId, string $passengerAssignmentId, array $data): array
    {
        $trip = $this->tripRepo->findById($tripId);
        if (!$trip) throw new RuntimeException('Viaje no encontrado');

        if (!in_array($trip['status'], ['PENDING', 'BOARDING'])) {
            throw new RuntimeException('No se pueden asignar asientos en un viaje ' . $trip['status']);
        }

        $assignment = $this->tripPassengerRepo->findById($passengerAssignmentId);
        if (!$assignment || $assignment['trip_id'] !== $tripId) {
            throw new RuntimeException('La asignación de pasajero no pertenece a este viaje');
        }

        $seatNumber = (int) ($data['seatNumber'] ?? $data['seat_number'] ?? 0);
        if ($seatNumber < 1) throw new RuntimeException('Numero de asiento invalido');

        $bus = $this->busRepo->findById($trip['bus_id']);
        $capacity = $bus ? (int) $bus['capacity'] : 0;
        if ($capacity > 0 && $seatNumber > $capacity) {
            throw new RuntimeException('El asiento ' . $seatNumber . ' excede la capacidad del bus (' . $capacity . ')');
        }

        if ($this->tripPassengerRepo->isSeatTaken($tripId, $seatNumber)) {
            throw new RuntimeException('El asiento ' . $seatNumber . ' ya esta ocupado');
        }

        $this->tripPassengerRepo->updateSeat($passengerAssignmentId, $seatNumber);

        return ['passengers' => $this->tripPassengerRepo->findByTripId($tripId)];
    }

    public function clearSeat(string $tripId, string $passengerAssignmentId): array
    {
        $trip = $this->tripRepo->findById($tripId);
        if (!$trip) throw new RuntimeException('Viaje no encontrado');

        if (!in_array($trip['status'], ['PENDING', 'BOARDING'])) {
            throw new RuntimeException('No se pueden liberar asientos en un viaje ' . $trip['status']);
        }

        $assignment = $this->tripPassengerRepo->findById($passengerAssignmentId);
        if (!$assignment || $assignment['trip_id'] !== $tripId) {
            throw new RuntimeException('La asignación de pasajero no pertenece a este viaje');
        }

        $this->tripPassengerRepo->clearSeat($passengerAssignmentId);

        return ['passengers' => $this->tripPassengerRepo->findByTripId($tripId)];
    }

    public function delete(string $id): void
    {
        $trip = $this->tripRepo->findById($id);
        if (!$trip) throw new RuntimeException('Viaje no encontrado');

        if (!in_array($trip['status'], ['PENDING', 'CANCELLED', 'FINISHED'])) {
            throw new RuntimeException('No se puede eliminar un viaje en estado ' . $trip['status']);
        }

        $passengers = $this->tripPassengerRepo->findByTripId($id);
        if (!empty($passengers)) {
            throw new RuntimeException('No se puede eliminar un viaje que tiene pasajeros asignados');
        }

        $this->tripRepo->delete($id);
    }

    private function format(array $trip): array
    {
        return [
            'id'             => $trip['id'],
            'code'           => $trip['code'],
            'origin'         => $trip['origin'],
            'destination'    => $trip['destination'],
            'departureTime'  => $trip['departure_time'],
            'arrivalTime'    => $trip['arrival_time'],
            'busId'          => $trip['bus_code'],
            'price'          => (float) $trip['price'],
            'status'         => $trip['status'],
            'availableSeats' => (int) ($trip['available_seats'] ?? 0),
            'routeName'      => $trip['route_name'] ?? '',
            'driverId'       => $trip['driver_code'] ?? '',
            'driverName'     => $trip['driver_name'] ?? '',
            'capacity'       => (int) $trip['capacity'],
        ];
    }
}
