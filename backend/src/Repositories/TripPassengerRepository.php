<?php

namespace App\Repositories;

use App\Database;
use PDO;

class TripPassengerRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByTripId(string $tripId): array
    {
        $stmt = $this->db->prepare(
            'SELECT tp.*, p.name, p.email, p.phone, p.document_id
             FROM trip_passengers tp
             JOIN passengers p ON p.id = tp.passenger_id
             WHERE tp.trip_id = :trip_id
             ORDER BY tp.seat_number ASC'
        );
        $stmt->execute(['trip_id' => $tripId]);
        return $stmt->fetchAll();
    }

    public function create(array $data): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO trip_passengers (trip_id, passenger_id, seat_number, checked_in, ticket_price)
             VALUES (:trip_id, :passenger_id, :seat_number, :checked_in, :ticket_price)
             RETURNING id'
        );
        $stmt->execute([
            'trip_id'       => $data['trip_id'],
            'passenger_id'  => $data['passenger_id'],
            'seat_number'   => $data['seat_number'] ?? null,
            'checked_in'    => $data['checked_in'] ?? false,
            'ticket_price'  => $data['ticket_price'],
        ]);
        return $stmt->fetchColumn();
    }

    public function delete(string $id): void
    {
        $stmt = $this->db->prepare('DELETE FROM trip_passengers WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }
}
