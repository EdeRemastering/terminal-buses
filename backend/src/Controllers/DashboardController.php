<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\DashboardService;

class DashboardController
{
    private DashboardService $dashboardService;

    public function __construct()
    {
        $this->dashboardService = new DashboardService();
    }

    public function stats(): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $stats = $this->dashboardService->getStats();
        Response::success($stats);
    }
}
