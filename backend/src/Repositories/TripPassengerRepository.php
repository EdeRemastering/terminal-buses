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

    public function findById(string $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT tp.*, p.name, p.email, p.phone, p.document_id
             FROM trip_passengers tp
             JOIN passengers p ON p.id = tp.passenger_id
             WHERE tp.id = :id'
        );
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
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
            'checked_in'    => ($data['checked_in'] ?? false) ? 'true' : 'false',
            'ticket_price'  => $data['ticket_price'],
        ]);
        return $stmt->fetchColumn();
    }

    public function delete(string $id): void
    {
        $stmt = $this->db->prepare('DELETE FROM trip_passengers WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    public function updateSeat(string $id, int $seatNumber): void
    {
        $stmt = $this->db->prepare('UPDATE trip_passengers SET seat_number = :seat_number WHERE id = :id');
        $stmt->execute(['id' => $id, 'seat_number' => $seatNumber]);
    }

    public function clearSeat(string $id): void
    {
        $stmt = $this->db->prepare('UPDATE trip_passengers SET seat_number = NULL WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    public function isSeatTaken(string $tripId, int $seatNumber): bool
    {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) FROM trip_passengers WHERE trip_id = :trip_id AND seat_number = :seat_number'
        );
        $stmt->execute(['trip_id' => $tripId, 'seat_number' => $seatNumber]);
        return (int) $stmt->fetchColumn() > 0;
    }

    public function findByPassengerId(string $passengerId): array
    {
        $stmt = $this->db->prepare(
            'SELECT tp.*, t.code as trip_code, t.departure_time, t.status as trip_status
             FROM trip_passengers tp
             JOIN trips t ON t.id = tp.trip_id
             WHERE tp.passenger_id = :passenger_id
             ORDER BY t.departure_time DESC'
        );
        $stmt->execute(['passenger_id' => $passengerId]);
        return $stmt->fetchAll();
    }

    public function existsByPassengerAndTrip(string $passengerId, string $tripId): bool
    {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) FROM trip_passengers WHERE trip_id = :trip_id AND passenger_id = :passenger_id'
        );
        $stmt->execute(['trip_id' => $tripId, 'passenger_id' => $passengerId]);
        return (int) $stmt->fetchColumn() > 0;
    }
}
