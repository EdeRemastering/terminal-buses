<?php

namespace App\Repositories;

use App\Database;
use PDO;

class TripHistoryRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByTripId(string $tripId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM trip_history WHERE trip_id = :trip_id ORDER BY created_at ASC'
        );
        $stmt->execute(['trip_id' => $tripId]);
        return $stmt->fetchAll();
    }

    public function findAllRecent(int $limit = 20): array
    {
        $stmt = $this->db->prepare(
            'SELECT th.*, t.code AS trip_code
             FROM trip_history th
             JOIN trips t ON t.id = th.trip_id
             ORDER BY th.created_at DESC
             LIMIT :limit'
        );
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
