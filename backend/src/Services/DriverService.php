<?php

namespace App\Services;

use App\Repositories\DriverProfileRepository;
use App\Repositories\UserRepository;
use App\Repositories\TripRepository;
use App\Repositories\TripPassengerRepository;
use App\Repositories\TripHistoryRepository;
use RuntimeException;

class DriverService
{
    public function __construct(
        private DriverProfileRepository $driverRepo = new DriverProfileRepository(),
        private UserRepository $userRepo = new UserRepository(),
        private TripRepository $tripRepo = new TripRepository(),
        private TripPassengerRepository $tripPassengerRepo = new TripPassengerRepository(),
        private TripHistoryRepository $historyRepo = new TripHistoryRepository(),
    ) {}

    public function getMyInfo(string $userId): array
    {
        $profile = $this->driverRepo->findByUserId($userId);
        if (!$profile) throw new RuntimeException('Perfil de conductor no encontrado');

        $currentTrips = $this->tripRepo->findByDriverProfileId($profile['id'], ['PENDING', 'BOARDING', 'IN_PROGRESS']);
        $currentTrip = !empty($currentTrips) ? $currentTrips[0] : null;

        $history = $this->tripRepo->findByDriverProfileId($profile['id'], ['FINISHED']);

        $result = $this->format($profile);
        $result['currentTrip'] = $currentTrip ? $this->formatTrip($currentTrip) : null;
        $result['history'] = array_map(fn($t) => $this->formatTrip($t), $history);

        if ($currentTrip) {
            $result['currentTrip']['passengers'] = $this->tripPassengerRepo->findByTripId($currentTrip['id']);
        }

        return $result;
    }

    private function formatTrip(array $trip): array
    {
        return [
            'id'            => $trip['id'],
            'code'          => $trip['code'],
            'origin'        => $trip['origin'],
            'destination'   => $trip['destination'],
            'departureTime' => $trip['departure_time'],
            'arrivalTime'   => $trip['arrival_time'],
            'busCode'       => $trip['bus_code'],
            'price'         => (float) $trip['price'],
            'status'        => $trip['status'],
            'routeName'     => $trip['route_name'] ?? '',
            'capacity'      => (int) $trip['capacity'],
        ];
    }

    public function getAll(int $page = 1, int $perPage = 100): array
    {
        if ($perPage > 1000) $perPage = 1000;
        $drivers = $this->driverRepo->findAllPaginated($page, $perPage);
        return array_map(fn($d) => $this->format($d), $drivers);
    }

    public function getById(string $id): array
    {
        $driver = $this->driverRepo->findById($id);
        if (!$driver) throw new RuntimeException('Conductor no encontrado');
        return $this->format($driver);
    }

    public function create(array $data): array
    {
        if (empty($data['name']) || empty($data['email'])) {
            throw new RuntimeException('El nombre y el correo son requeridos');
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Formato de correo inválido');
        }

        if (empty($data['licenseNumber']) || empty($data['licenseType']) || empty($data['licenseExpiration'])) {
            throw new RuntimeException('Número, tipo y vencimiento de licencia son requeridos');
        }

        if (strtotime($data['licenseExpiration']) < strtotime(date('Y-m-d'))) {
            throw new RuntimeException('La licencia ya está vencida (venció: ' . $data['licenseExpiration'] . ')');
        }

        if ($this->driverRepo->findByLicenseNumber($data['licenseNumber'])) {
            throw new RuntimeException('El número de licencia "' . $data['licenseNumber'] . '" ya está registrado');
        }

        if ($this->userRepo->findByEmail($data['email'])) {
            throw new RuntimeException('El correo ya está en uso');
        }

        if (!empty($data['phone'])) {
            $digits = preg_replace('/\D/', '', $data['phone']);
            if (strlen($digits) < 7 || strlen($digits) > 10) {
                throw new RuntimeException('El teléfono debe tener entre 7 y 10 dígitos');
            }
        }

        $userId = $this->userRepo->create([
            'email'         => $data['email'],
            'name'          => $data['name'],
            'password_hash' => password_hash(bin2hex(random_bytes(8)), PASSWORD_BCRYPT),
            'phone'         => $data['phone'] ?? null,
            'role'          => 'DRIVER',
        ]);

        $driverId = $this->driverRepo->create([
            'user_id'                 => $userId,
            'code'                    => $this->driverRepo->nextCode(),
            'license_number'          => $data['licenseNumber'],
            'license_type'            => $data['licenseType'],
            'license_expiration_date' => $data['licenseExpiration'],
        ]);

        return $this->getById($driverId);
    }

    public function update(string $id, array $data): array
    {
        $driver = $this->driverRepo->findById($id);
        if (!$driver) throw new RuntimeException('Conductor no encontrado');

        if (array_key_exists('license_number', $data)) {
            $existing = $this->driverRepo->findByLicenseNumber($data['license_number']);
            if ($existing && $existing['id'] !== $id) {
                throw new RuntimeException('El número de licencia "' . $data['license_number'] . '" ya está registrado por otro conductor');
            }
        }

        if (array_key_exists('license_expiration_date', $data)) {
            if (strtotime($data['license_expiration_date']) < strtotime(date('Y-m-d'))) {
                throw new RuntimeException('La licencia ya está vencida (venció: ' . $data['license_expiration_date'] . ')');
            }
        }

        if (array_key_exists('availability', $data)) {
            if (!in_array($data['availability'], ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY'])) {
                throw new RuntimeException('Estado de disponibilidad inválido');
            }
        }

        if (array_key_exists('phone', $data) && !empty($data['phone'])) {
            $digits = preg_replace('/\D/', '', $data['phone']);
            if (strlen($digits) < 7 || strlen($digits) > 10) {
                throw new RuntimeException('El teléfono debe tener entre 7 y 10 dígitos');
            }
        }

        $this->driverRepo->update($id, $data);
        return $this->getById($id);
    }

    public function delete(string $id): void
    {
        $driver = $this->driverRepo->findById($id);
        if (!$driver) throw new RuntimeException('Conductor no encontrado');

        $activeTrips = $this->tripRepo->countActiveByDriverProfileId($id);
        if ($activeTrips > 0) {
            throw new RuntimeException('No se puede eliminar el conductor porque tiene ' . $activeTrips . ' viaje(s) activo(s)');
        }

        $this->driverRepo->delete($id);
    }

    private function format(array $driver): array
    {
        return [
            'id'                => $driver['id'],
            'code'              => $driver['code'],
            'name'              => $driver['name'],
            'licenseNumber'     => $driver['license_number'],
            'licenseType'       => $driver['license_type'],
            'licenseExpiration' => $driver['license_expiration_date'],
            'phone'             => $driver['phone'],
            'email'             => $driver['email'],
            'availability'      => $driver['availability'],
            'rating'            => (float) $driver['rating'],
            'completedTrips'    => (int) $driver['completed_trips'],
        ];
    }
}
