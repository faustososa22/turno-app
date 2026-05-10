# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A barbershop appointment booking app ("turno" = appointment). Full-stack: React/TypeScript frontend + .NET 10 Web API backend + PostgreSQL.

## Commands

### Frontend (`/frontend`)
```bash
npm run dev       # dev server at http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # eslint
```

### Backend (`/backend/TurnoApp`)
```bash
dotnet run        # API at http://localhost:5021
dotnet build
dotnet ef migrations add <NombreMigracion>   # new EF migration
dotnet ef database update                    # apply pending migrations
```

### Database
```bash
docker compose up -d   # start PostgreSQL at localhost:5432
```
Credentials from `docker-compose.yml`: user `turnoapp`, password `turnoapp123`, db `turnoappdb`.

The backend `appsettings.json` already matches these credentials.

### API Docs
Scalar UI available at `http://localhost:5021/scalar/v1` (dev only). Supports JWT auth via the Bearer scheme.

## Architecture

### Backend (.NET 10 / ASP.NET Core)

**Models → Controllers, no service layer.** Controllers query `AppDbContext` directly.

Key domain relationships:
- `Barbero` has a one-to-one link to `Usuario` via `UsuarioId` (cascade delete)
- `Turno` has a base `Servicio` (FK `ServicioId`) **plus** optional add-ons via the `TurnoServicio` join table
- `BarberoServicio` is a many-to-many join between barberos and the services they offer
- `HorarioDisponible` stores per-barbero working blocks by `DayOfWeek`

**Roles**: `admin`, `barbero`, `cliente`. Enforced with `[Authorize(Roles = "...")]`.

**Timezone handling**: All `DateTime` values are stored as UTC. The configured timezone (`Barberia:TimeZone` in `appsettings.json`, default `"Europe/Dublin"`) is used to convert between local display time and UTC on both reads and writes. Slot calculation in `HorariosController` uses 15-minute intervals.

**Soft deletes**:
- `HorarioDisponible.Activo = false` instead of hard delete
- `Turno.Estado = "cancelado"` instead of hard delete

**Global error handling**: `TurnoApp.Middleware.ErrorHandlingMiddleware` catches all unhandled exceptions.

**CORS**: `AllowFrontend` policy allows `http://localhost:5173` only.

### Frontend (React 19 / TypeScript / Vite)

**Auth flow**: JWT stored in `localStorage`. On mount, `AuthProvider` decodes the stored token via `jwt-decode` to rehydrate `user` state. The `apiClient` (Axios) attaches the token automatically via a request interceptor.

**Role-based routing**: `<ProtectedRoute allowedRoles={['admin']}>` wraps admin routes. Without `allowedRoles`, any authenticated user can access the route.

**Layer structure**:
- `src/api/client.ts` — Axios instance reading `VITE_API_URL` from `.env`
- `src/services/` — one file per domain (auth, barberos, horarios, servicios, turnos); call `apiClient` and return typed data
- `src/types/index.ts` — all shared TypeScript interfaces/types
- `src/auth/` — `AuthContext.tsx` (provider), `auth-context.ts` (context object), `useAuth.ts` (hook), `ProtectedRoute.tsx`
- `src/pages/` — route-level components; `src/pages/admin/` for admin-only pages
- `src/components/` — shared UI components (e.g. `Navbar`)

**UI**: Bootstrap 5 + React-Bootstrap (not shadcn/Tailwind, despite earlier setup commit).

### Creating a New Appointment (`NuevoTurno` flow)
1. User picks a barbero → fetch that barbero's services from `BarberoServicio`
2. User picks a base service + optional addons → duración total is summed
3. User picks a date → `GET /api/horarios/huecos?barberoId=&anio=&mes=&dia=&duracionMinutos=` returns 15-min slots
4. `POST /api/turnos` with `{ barberoId, servicioBaseId, addonIds[], fechaHora }` — backend converts local time to UTC
