-- ============================================================
-- TransTerminal - Seed Data
-- Datos iniciales para desarrollo (Colombia)
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================

-- Admin: admin@terminal.com / admin123
INSERT INTO users (email, name, password_hash, phone, role)
VALUES (
  'admin@terminal.com',
  'Admin Terminal',
  '$2y$12$xE2wptJ53Cjpf2uc807tk./Rdne1F9a89Yu52miW7VW45ZAhN/Cv.',
  '+57 601 234 5678',
  'ADMIN'
);

-- Secretaria: secretaria@terminal.com / secretaria123
INSERT INTO users (email, name, password_hash, phone, role)
VALUES (
  'secretaria@terminal.com',
  'María Rodríguez',
  '$2y$12$./U/obYZ1SXAMEbgLro4zuRC59zEWvDn/Nz6FPW0C5kgAHP3rRGbm',
  '+57 601 987 6543',
  'SECRETARY'
);

-- Conductor 1: carlos@terminal.com / conductor123
INSERT INTO users (email, name, password_hash, phone, role)
VALUES (
  'carlos@terminal.com',
  'Carlos Martínez',
  '$2y$12$IVb58ItsOzsyGpcL9Fm1L.xTIZTOOX6e8Yn6HqxVQ3bHlEuNfhc7O',
  '+57 320 456 7890',
  'DRIVER'
);

-- Conductor 2: andrea@terminal.com / conductor123
INSERT INTO users (email, name, password_hash, phone, role)
VALUES (
  'andrea@terminal.com',
  'Andrea López',
  '$2y$12$IVb58ItsOzsyGpcL9Fm1L.xTIZTOOX6e8Yn6HqxVQ3bHlEuNfhc7O',
  '+57 310 654 3210',
  'DRIVER'
);

-- ============================================================
-- DRIVER PROFILES
-- ============================================================

INSERT INTO driver_profiles (user_id, code, license_number, license_type, license_expiration_date, availability, rating, completed_trips, notes)
SELECT
  u.id, 'DRV-001', 'LIC-1001', 'C2',
  '2027-06-15', 'AVAILABLE', 4.7, 128,
  'Conductor experto en rutas de larga distancia'
FROM users u WHERE u.email = 'carlos@terminal.com';

INSERT INTO driver_profiles (user_id, code, license_number, license_type, license_expiration_date, availability, rating, completed_trips, notes)
SELECT
  u.id, 'DRV-002', 'LIC-1002', 'C1',
  '2026-09-30', 'AVAILABLE', 4.5, 95,
  'Conductora con experiencia en rutas intermunicipales'
FROM users u WHERE u.email = 'andrea@terminal.com';

-- ============================================================
-- BUSES
-- ============================================================

INSERT INTO buses (code, plate, model, capacity, type, year, mileage, last_maintenance_date, status, notes)
VALUES (
  'BUS-001', 'ABC-123', 'Mercedes-Benz Eurobus', 45,
  'LUXURY', 2023, 58420.00,
  '2026-05-01', 'OPERATIONAL',
  'Bus de lujo con aire acondicionado y baño'
);

INSERT INTO buses (code, plate, model, capacity, type, year, mileage, last_maintenance_date, status, notes)
VALUES (
  'BUS-002', 'DEF-456', 'Volkswagen Constellation', 55,
  'EXPRESS', 2022, 97210.50,
  '2026-04-15', 'OPERATIONAL',
  'Bus exprés para rutas intermunicipales'
);

-- ============================================================
-- PASSENGERS
-- ============================================================

INSERT INTO passengers (code, name, email, phone, document_id, frequent_traveler_points, status, notes)
VALUES (
  'PAS-001', 'Pedro Ramírez', 'pedro@email.com', '+57 300 111 2233', 'CC-1012345678',
  1500, 'ACTIVE', 'Viajero frecuente ruta Bogotá-Medellín'
);

INSERT INTO passengers (code, name, email, phone, document_id, frequent_traveler_points, status, notes)
VALUES (
  'PAS-002', 'Luisa Fernanda Torres', 'luisa@email.com', '+57 315 222 3344', 'CC-1023456789',
  320, 'ACTIVE', NULL
);

-- ============================================================
-- ROUTES
-- ============================================================

INSERT INTO routes (code, name, origin, destination, distance_km, duration_hours, base_price, status, notes)
VALUES (
  'RUT-001', 'Bogotá → Medellín', 'Bogotá', 'Medellín',
  415.00, 9.50, 120000.00, 'ACTIVE',
  'Ruta principal por la Autopista Norte'
);

INSERT INTO routes (code, name, origin, destination, distance_km, duration_hours, base_price, status, notes)
VALUES (
  'RUT-002', 'Cali → Pereira', 'Cali', 'Pereira',
  232.00, 5.50, 65000.00, 'ACTIVE',
  'Ruta por la vía al Cerrito y La Paila'
);

-- ============================================================
-- ROUTE STOPS
-- ============================================================

-- Paradas RUT-001: Bogotá → Medellín
INSERT INTO route_stops (route_id, city, stop_order, estimated_minutes_from_prev)
SELECT r.id, 'Bogotá', 0, NULL
FROM routes r WHERE r.code = 'RUT-001';

INSERT INTO route_stops (route_id, city, stop_order, estimated_minutes_from_prev)
SELECT r.id, 'La Dorada', 1, 210
FROM routes r WHERE r.code = 'RUT-001';

INSERT INTO route_stops (route_id, city, stop_order, estimated_minutes_from_prev)
SELECT r.id, 'Medellín', 2, 210
FROM routes r WHERE r.code = 'RUT-001';

-- Paradas RUT-002: Cali → Pereira
INSERT INTO route_stops (route_id, city, stop_order, estimated_minutes_from_prev)
SELECT r.id, 'Cali', 0, NULL
FROM routes r WHERE r.code = 'RUT-002';

INSERT INTO route_stops (route_id, city, stop_order, estimated_minutes_from_prev)
SELECT r.id, 'Armenia', 1, 210
FROM routes r WHERE r.code = 'RUT-002';

INSERT INTO route_stops (route_id, city, stop_order, estimated_minutes_from_prev)
SELECT r.id, 'Pereira', 2, 120
FROM routes r WHERE r.code = 'RUT-002';

-- ============================================================
-- TRIPS
-- ============================================================

INSERT INTO trips (code, route_id, bus_id, driver_profile_id, departure_time, arrival_time, price, status, notes)
SELECT
  'TRIP-001', r.id, b.id, dp.id,
  '2026-05-23 06:00:00-05', '2026-05-23 15:30:00-05',
  120000.00, 'PENDING',
  'Viaje programado saliendo de la Terminal Salitre'
FROM routes r, buses b, driver_profiles dp
WHERE r.code = 'RUT-001'
  AND b.code = 'BUS-001'
  AND dp.code = 'DRV-001';

INSERT INTO trips (code, route_id, bus_id, driver_profile_id, departure_time, arrival_time, price, status, notes)
SELECT
  'TRIP-002', r.id, b.id, dp.id,
  '2026-05-23 14:00:00-05', '2026-05-23 19:30:00-05',
  65000.00, 'PENDING',
  'Viaje programado saliendo de la Terminal de Cali'
FROM routes r, buses b, driver_profiles dp
WHERE r.code = 'RUT-002'
  AND b.code = 'BUS-002'
  AND dp.code = 'DRV-002';

-- ============================================================
-- TRIP PASSENGERS
-- ============================================================

INSERT INTO trip_passengers (trip_id, passenger_id, seat_number, checked_in, ticket_price)
SELECT
  t.id, p.id, 'B02', false, 120000.00
FROM trips t, passengers p
WHERE t.code = 'TRIP-001' AND p.code = 'PAS-001';

INSERT INTO trip_passengers (trip_id, passenger_id, seat_number, checked_in, ticket_price)
SELECT
  t.id, p.id, 'B03', false, 120000.00
FROM trips t, passengers p
WHERE t.code = 'TRIP-001' AND p.code = 'PAS-002';

-- ============================================================
-- TRIP HISTORY (manual, previo al trigger automático)
-- ============================================================

INSERT INTO trip_history (trip_id, previous_status, new_status, notes)
SELECT id, NULL, 'PENDING', 'Viaje creado desde seed'
FROM trips WHERE code = 'TRIP-001';

INSERT INTO trip_history (trip_id, previous_status, new_status, notes)
SELECT id, NULL, 'PENDING', 'Viaje creado desde seed'
FROM trips WHERE code = 'TRIP-002';
