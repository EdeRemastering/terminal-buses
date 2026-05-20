-- ============================================================
-- TransTerminal - Esquema de Base de Datos PostgreSQL
-- Sistema de Gestión de Terminal de Autobuses
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'SECRETARY', 'DRIVER');

CREATE TYPE bus_status AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE');
CREATE TYPE bus_type AS ENUM ('LUXURY', 'EXPRESS', 'STANDARD');

CREATE TYPE driver_availability AS ENUM ('AVAILABLE', 'ON_TRIP', 'OFF_DUTY');

CREATE TYPE passenger_status AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE route_status AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE trip_status AS ENUM ('PENDING', 'BOARDING', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');

-- ============================================================
-- USERS (Auth + identity for every person in the system)
-- A DRIVER is a user. There is no separate `drivers` table.
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'SECRETARY',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- DRIVER PROFILES (Driver-specific data, 1:1 with users)
-- Separated from users because not every user is a driver.
-- ============================================================

CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL UNIQUE,                          -- e.g. DRV-001
    license_number VARCHAR(20) NOT NULL UNIQUE,
    license_type VARCHAR(50) NOT NULL,
    license_expiration_date DATE NOT NULL,
    availability driver_availability NOT NULL DEFAULT 'AVAILABLE',
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    completed_trips INTEGER NOT NULL DEFAULT 0 CHECK (completed_trips >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_driver_profiles_code ON driver_profiles(code);
CREATE INDEX idx_driver_profiles_availability ON driver_profiles(availability);

-- ============================================================
-- BUSES (Fleet Management)
-- ============================================================

CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,                          -- e.g. BUS-101
    plate VARCHAR(10) NOT NULL UNIQUE,
    model VARCHAR(80) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity >= 10 AND capacity <= 80),
    type bus_type NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 2018 AND year <= 2030),
    mileage NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (mileage >= 0),
    last_maintenance_date DATE,
    status bus_status NOT NULL DEFAULT 'OPERATIONAL',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_buses_code ON buses(code);
CREATE INDEX idx_buses_status ON buses(status);
CREATE INDEX idx_buses_type ON buses(type);

-- ============================================================
-- PASSENGERS (Customer Registry)
-- ============================================================

CREATE TABLE passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,                          -- e.g. PAS-001
    name VARCHAR(80) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    document_id VARCHAR(20) NOT NULL UNIQUE,
    frequent_traveler_points INTEGER NOT NULL DEFAULT 0 CHECK (frequent_traveler_points >= 0),
    status passenger_status NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_passengers_code ON passengers(code);
CREATE INDEX idx_passengers_email ON passengers(email);
CREATE INDEX idx_passengers_status ON passengers(status);

-- ============================================================
-- ROUTES (Route Planning & Tariffs)
-- ============================================================

CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,                          -- e.g. RUT-001
    name VARCHAR(100) NOT NULL,
    origin VARCHAR(80) NOT NULL,
    destination VARCHAR(80) NOT NULL,
    distance_km NUMERIC(8, 2) NOT NULL CHECK (distance_km > 0),
    duration_hours NUMERIC(5, 2) NOT NULL CHECK (duration_hours > 0),
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price > 0),
    status route_status NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routes_code ON routes(code);
CREATE INDEX idx_routes_status ON routes(status);

-- ============================================================
-- ROUTE STOPS (Intermediate Stops)
-- ============================================================

CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    city VARCHAR(80) NOT NULL,
    stop_order INTEGER NOT NULL CHECK (stop_order >= 0),
    estimated_minutes_from_prev INTEGER,                        -- NULL for first stop
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(route_id, city),
    UNIQUE(route_id, stop_order)
);

CREATE INDEX idx_route_stops_route ON route_stops(route_id);

-- ============================================================
-- TRIPS (Operational Trips)
-- available_seats is derived dynamically via view.
-- Driver assignment lives here, not on driver_profiles.
-- ============================================================

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,                          -- e.g. TRIP-001
    route_id UUID NOT NULL REFERENCES routes(id),
    bus_id UUID NOT NULL REFERENCES buses(id),
    driver_profile_id UUID REFERENCES driver_profiles(id) ON DELETE SET NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    status trip_status NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trips_code ON trips(code);
CREATE INDEX idx_trips_route ON trips(route_id);
CREATE INDEX idx_trips_bus ON trips(bus_id);
CREATE INDEX idx_trips_driver ON trips(driver_profile_id);
CREATE INDEX idx_trips_status_departure ON trips(status, departure_time);

-- ============================================================
-- TRIP PASSENGERS (Many-to-Many: Trip ↔ Passenger)
-- This is the source of truth for occupied seats.
-- ============================================================

CREATE TABLE trip_passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES passengers(id) ON DELETE CASCADE,
    seat_number VARCHAR(5),
    checked_in BOOLEAN NOT NULL DEFAULT false,
    ticket_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(trip_id, passenger_id),
    UNIQUE(trip_id, seat_number)
);

CREATE INDEX idx_trip_passengers_trip ON trip_passengers(trip_id);
CREATE INDEX idx_trip_passengers_passenger ON trip_passengers(passenger_id);

-- ============================================================
-- TRIP HISTORY LOG (Audit Trail)
-- ============================================================

CREATE TABLE trip_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    previous_status trip_status,
    new_status trip_status NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trip_history_trip ON trip_history(trip_id);

-- ============================================================
-- VIEW: trip_occupancy (derives available_seats dynamically)
-- ============================================================

CREATE VIEW trip_occupancy AS
SELECT
    t.id AS trip_id,
    t.code AS trip_code,
    b.capacity,
    COUNT(tp.id) AS occupied_seats,
    (b.capacity - COUNT(tp.id)) AS available_seats,
    CASE
        WHEN COUNT(tp.id) = 0 THEN 'EMPTY'
        WHEN COUNT(tp.id) < b.capacity THEN 'AVAILABLE'
        ELSE 'FULL'
    END AS occupancy_status
FROM trips t
JOIN buses b ON b.id = t.bus_id
LEFT JOIN trip_passengers tp ON tp.trip_id = t.id
GROUP BY t.id, t.code, b.capacity;

-- ============================================================
-- TRIGGER: materialize passenger history on trip FINISHED
-- ============================================================

CREATE TABLE trip_passenger_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES passengers(id) ON DELETE CASCADE,
    route_name VARCHAR(100) NOT NULL,
    departure_date DATE NOT NULL,
    ticket_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trip_passenger_snapshots_passenger ON trip_passenger_snapshots(passenger_id);
CREATE INDEX idx_trip_passenger_snapshots_trip ON trip_passenger_snapshots(trip_id);

CREATE OR REPLACE FUNCTION snapshot_finished_trip_passengers()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'FINISHED' AND OLD.status IS DISTINCT FROM 'FINISHED' THEN
        INSERT INTO trip_passenger_snapshots (trip_id, passenger_id, route_name, departure_date, ticket_price)
        SELECT
            tp.trip_id,
            tp.passenger_id,
            r.name,
            DATE(NEW.departure_time),
            tp.ticket_price
        FROM trip_passengers tp
        JOIN trips t ON t.id = tp.trip_id
        JOIN routes r ON r.id = t.route_id
        WHERE tp.trip_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trip_finished_snapshot
    AFTER UPDATE OF status ON trips FOR EACH ROW
    WHEN (NEW.status = 'FINISHED' AND OLD.status IS DISTINCT FROM 'FINISHED')
    EXECUTE FUNCTION snapshot_finished_trip_passengers();

-- ============================================================
-- FUNCTIONS & TRIGGERS (updated_at)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_driver_profiles_updated_at
    BEFORE UPDATE ON driver_profiles FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_buses_updated_at
    BEFORE UPDATE ON buses FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_passengers_updated_at
    BEFORE UPDATE ON passengers FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_routes_updated_at
    BEFORE UPDATE ON routes FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_trips_updated_at
    BEFORE UPDATE ON trips FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Log trip status changes automatically
CREATE OR REPLACE FUNCTION log_trip_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO trip_history (trip_id, previous_status, new_status, notes)
        VALUES (NEW.id, OLD.status, NEW.status, 'Status changed automatically');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trip_status_change
    AFTER UPDATE OF status ON trips FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION log_trip_status_change();
