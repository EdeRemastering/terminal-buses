<?php

namespace App\Services;

use App\Repositories\BusRepository;
use App\Repositories\DriverProfileRepository;
use App\Repositories\PassengerRepository;
use App\Repositories\TripRepository;

class DashboardService
{
    private BusRepository $busRepo;
    private TripRepository $tripRepo;
    private PassengerRepository $passengerRepo;
    private DriverProfileRepository $driverRepo;

    public function __construct()
    {
        $this->busRepo = new BusRepository();
        $this->tripRepo = new TripRepository();
        $this->passengerRepo = new PassengerRepository();
        $this->driverRepo = new DriverProfileRepository();
    }

    public function getStats(): array
    {
        $totalBuses = $this->busRepo->countOperational();
        $activeTrips = $this->tripRepo->countActive();
        $totalPassengers = $this->passengerRepo->countActive();
        $availableDrivers = $this->driverRepo->countAvailable();
        $tripsToday = $this->tripRepo->countTripsToday();
        $avgOccupancy = $this->tripRepo->getAvgOccupancy();
        $recentTrips = $this->tripRepo->findRecentTrips(5);

        return [
            'totalBuses'      => $totalBuses,
            'activeTrips'     => $activeTrips,
            'totalPassengers' => $totalPassengers,
            'availableDrivers' => $availableDrivers,
            'tripsToday'      => $tripsToday,
            'avgOccupancy'    => round($avgOccupancy * 100, 1),
            'recentTrips'     => $recentTrips,
        ];
    }
}
