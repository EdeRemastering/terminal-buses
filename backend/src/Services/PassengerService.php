<?php

namespace App\Services;

use App\Repositories\PassengerRepository;
use RuntimeException;

class PassengerService
{
    public function __construct(
        private PassengerRepository $passengerRepo = new PassengerRepository(),
    ) {}

    public function getAll(int $page = 1, int $perPage = 100): array
    {
        if ($perPage > 1000) $perPage = 1000;
        $passengers = $this->passengerRepo->findAllPaginated($page, $perPage);
        return array_map(fn($p) => $this->format($p), $passengers);
    }

    public function getById(string $id): array
    {
        $passenger = $this->passengerRepo->findById($id);
        if (!$passenger) throw new RuntimeException('Pasajero no encontrado');
        return $this->format($passenger);
    }

    public function create(array $data): array
    {
        $required = ['name' => 'Nombre', 'email' => 'Correo', 'phone' => 'Teléfono', 'documentId' => 'Documento'];
        foreach ($required as $field => $label) {
            if (empty($data[$field])) {
                throw new RuntimeException("$label es requerido");
            }
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Formato de correo inválido');
        }

        if ($this->passengerRepo->findByEmail($data['email'])) {
            throw new RuntimeException('El correo ya está en uso');
        }

        $id = $this->passengerRepo->create([
            'code'        => $this->passengerRepo->nextCode(),
            'name'        => $data['name'],
            'email'       => $data['email'],
            'phone'       => $data['phone'],
            'document_id' => $data['documentId'],
            'status'      => 'ACTIVE',
        ]);

        return $this->getById($id);
    }

    public function update(string $id, array $data): array
    {
        $passenger = $this->passengerRepo->findById($id);
        if (!$passenger) throw new RuntimeException('Pasajero no encontrado');

        // Mapea camelCase del frontend a snake_case de la BD
        $mapped = $data;
        if (isset($mapped['frequentTravelerPoints'])) {
            $mapped['frequent_traveler_points'] = $mapped['frequentTravelerPoints'];
            unset($mapped['frequentTravelerPoints']);
        }

        $this->passengerRepo->update($id, $mapped);
        return $this->getById($id);
    }

    public function delete(string $id): void
    {
        $passenger = $this->passengerRepo->findById($id);
        if (!$passenger) throw new RuntimeException('Pasajero no encontrado');

        $this->passengerRepo->delete($id);
    }

    private function format(array $passenger): array
    {
        return [
            'id'                     => $passenger['id'],
            'code'                   => $passenger['code'],
            'name'                   => $passenger['name'],
            'email'                  => $passenger['email'],
            'phone'                  => $passenger['phone'],
            'documentId'             => $passenger['document_id'],
            'frequentTravelerPoints' => (int) $passenger['frequent_traveler_points'],
            'status'                 => $passenger['status'],
        ];
    }
}
