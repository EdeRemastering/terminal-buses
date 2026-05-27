import { type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/common/layouts/PublicLayout';
import { PrivateLayout } from '@/common/layouts/PrivateLayout';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage';
import { TripsPage } from '@/modules/trips/pages/TripsPage';
import { BusesPage } from '@/modules/buses/pages/BusesPage';
import { PassengersPage } from '@/modules/passengers/pages/PassengersPage';
import { DriversPage } from '@/modules/drivers/pages/DriversPage';
import { RoutesPage } from '@/modules/routes/pages/RoutesPage';
import { AuthGuard, PublicGuard, RoleGuard } from '@/common/utils/route-guards';
import type { Role } from '@/common/types';

const privateWithRoles = (element: ReactNode, allowedRoles: Role[]) => (
  <RoleGuard allowedRoles={allowedRoles}>{element}</RoleGuard>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: (
      <PublicGuard>
        <PublicLayout />
      </PublicGuard>
    ),
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: (
      <AuthGuard>
        <PrivateLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: 'dashboard',
        element: privateWithRoles(<DashboardPage />, ['ADMIN', 'SECRETARY', 'DRIVER']),
      },
      {
        path: 'trips',
        element: privateWithRoles(<TripsPage />, ['ADMIN', 'SECRETARY', 'DRIVER']),
      },
      {
        path: 'buses',
        element: privateWithRoles(<BusesPage />, ['ADMIN', 'SECRETARY', 'DRIVER']),
      },
      {
        path: 'routes',
        element: privateWithRoles(<RoutesPage />, ['ADMIN', 'SECRETARY', 'DRIVER']),
      },
      {
        path: 'passengers',
        element: privateWithRoles(<PassengersPage />, ['ADMIN', 'SECRETARY']),
      },
      {
        path: 'drivers',
        element: privateWithRoles(<DriversPage />, ['ADMIN', 'SECRETARY']),
      },
    ],
  },
  {
    path: 'unauthorized',
    element: <div className="p-8 text-center">No tienes permiso para acceder a esta sección.</div>,
  },
  {
    path: '*',
    element: <div className="p-8 text-center">404 - Página no encontrada</div>,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
