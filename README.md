# BarberShop — Appointment Booking App

A full-stack web application for managing barbershop appointments. Clients book online, barbers manage their schedule, and admins have full control over the business.

**Live demo:** https://turno-app-navy.vercel.app/

## Tech Stack

**Frontend**
- React 19 + TypeScript + Vite
- React-Bootstrap (UI components)
- React Router (client-side routing)
- Axios (HTTP client)

**Backend**
- .NET 10 / ASP.NET Core Web API
- Entity Framework Core + PostgreSQL
- JWT authentication with role-based authorization
- BCrypt password hashing

**Infrastructure**
- Database: Supabase (PostgreSQL)
- Backend: Azure App Service
- Frontend: Vercel
- CI/CD: GitHub Actions (auto-deploy on push to main)

## Features

### Clients
- Register and log in
- Book appointments: choose barber, base service + optional add-ons, date and time slot
- View and cancel their upcoming appointments

### Barbers
- View their assigned appointments filtered by date
- Confirm and mark appointments as paid
- Cancel appointments

### Admin
- Full appointments dashboard with date filtering
- Manage barbers (create, edit, deactivate, assign services)
- Manage services (base services and add-ons)
- Manage barber schedules by day of week

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@barbershop.com | admin123 |
| Barber | carlos@barbershop.com | barbero123 |
| Client | juan@mail.com | cliente123 |

## Local Development

### Prerequisites
- Node.js 18+
- .NET 10 SDK
- Docker (for PostgreSQL)

### Backend
```bash
cd backend/TurnoApp
docker compose up -d        # start PostgreSQL
dotnet run                  # API runs at http://localhost:5021
```

### Frontend
```bash
cd frontend
npm install
npm run dev                 # runs at http://localhost:5173
```

API docs available at `http://localhost:5021/scalar/v1` in development.
