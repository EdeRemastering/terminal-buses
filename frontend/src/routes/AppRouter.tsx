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
import { AuthGuard, PublicGuard } from '@/common/utils/route-guards';

// Raiz redirige al dashboard, el login es la unica ruta publica
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
        element: <DashboardPage />,
      },
      {
        path: 'trips',
        element: <TripsPage />,
      },
      {
        path: 'buses',
        element: <BusesPage />,
      },
      {
        path: 'routes',
        element: <RoutesPage />,
      },
      {
        path: 'passengers',
        element: <PassengersPage />,
      },
      {
        path: 'drivers',
        element: <DriversPage />,
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
