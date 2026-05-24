# Arquitectura Frontend Modular

Este proyecto sigue una arquitectura basada en **Features/Módulos**, diseñada para ser escalable, mantenible y altamente organizada.

## Estructura de Carpetas

```
src/
├── assets/                # Recursos estáticos globales (imágenes, fuentes, iconos)
├── common/                # Recursos compartidos entre todos los módulos
│   ├── components/        # Componentes genéricos reutilizables (Button, Input, Modal, etc.)
│   ├── hooks/             # Hooks personalizados globales
│   ├── layouts/           # Layouts base de la aplicación (PublicLayout, PrivateLayout)
│   ├── providers/         # Proveedores globales de React (AppProviders)
│   ├── schemas/           # Esquemas de validación Zod compartidos
│   ├── types/             # Tipos TypeScript globales
│   └── utils/             # Funciones utilitarias generales (api-client, route-guards)
├── modules/               # Módulos por feature (organización principal)
│   ├── auth/              # Módulo de autenticación
│   ├── trips/             # Módulo de gestión de viajes
│   ├── buses/             # Módulo de gestión de autobuses
│   ├── routes/            # Módulo de gestión de rutas
│   └── passengers/        # Módulo de gestión de pasajeros
├── routes/                # Configuración central de rutas de React Router (AppRouter)
├── App.tsx                # Punto de entrada principal (Configuración de proveedores)
└── main.tsx               # Montaje de la aplicación en el DOM
```

## Estructura de un Módulo

Cada módulo dentro de `src/modules/` debe mantener la siguiente estructura interna:

- `api/`: Llamadas a la API REST usando Axios.
- `hooks/`: Hooks personalizados exclusivos del módulo (ej: `useTrips`).
- `components/`: Componentes específicos del módulo.
- `pages/`: Páginas completas asociadas a las rutas del módulo.
- `schemas/`: Esquemas de validación Zod específicos.
- `types/`: Definiciones de tipos TypeScript para el módulo (DTOs).
- `utils/`: Funciones utilitarias exclusivas.

## Flujo de Datos y Estado

1.  **Estado del Servidor**: Gestionado con **TanStack Query**. Cada módulo expone sus hooks en la carpeta `hooks/` que consumen las funciones de la carpeta `api/`.
2.  **Estado Global**: Se utiliza la **Context API** de React para estados transversales como la autenticación (`AuthProvider`).
3.  **Validación**: Se utiliza **Zod** para validar todos los datos que entran a la aplicación (formularios y respuestas de API).

## Reglas de Nomenclatura

- **Carpetas**: `kebab-case` (ej: `user-profile/`).
- **Componentes/Páginas/Providers/Tipos**: `PascalCase` (ej: `LoginPage.tsx`).
- **Hooks/APIs/Esquemas/Utils**: `camelCase` (ej: `useAuth.ts`, `authApi.ts`).
- **DTOs**: Sufijos `Request` y `Response` (ej: `LoginRequest`, `LoginResponse`).

## Seguridad y Rutas

- **AuthGuard**: Protege las rutas privadas verificando la sesión del usuario.
- **PublicGuard**: Evita que usuarios autenticados accedan a páginas públicas como el Login.
- **RoleGuard**: Restringe el acceso a módulos específicos según el rol del usuario (`admin`, `operator`, `user`).

## Inyección de Tokens

El cliente de API (`src/common/utils/api-client.ts`) inyecta automáticamente el token de acceso almacenado en `localStorage` en el encabezado `Authorization` de cada petición.
