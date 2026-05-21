<?php

namespace App\Services;

use App\Repositories\DriverProfileRepository;
use App\Repositories\UserRepository;
use RuntimeException;

class DriverService
{
    public function __construct(
        private DriverProfileRepository $driverRepo = new DriverProfileRepository(),
        private UserRepository $userRepo = new UserRepository(),
    ) {}

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

        if ($this->userRepo->findByEmail($data['email'])) {
            throw new RuntimeException('El correo ya está en uso');
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

        $this->driverRepo->update($id, $data);
        return $this->getById($id);
    }

    public function delete(string $id): void
    {
        $driver = $this->driverRepo->findById($id);
        if (!$driver) throw new RuntimeException('Conductor no encontrado');

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
