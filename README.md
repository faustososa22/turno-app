# BarberShop — Appointment Booking App

A full-stack web application for managing barbershop appointments. Clients can book online via a traditional form or through an **AI-powered chatbot**. Barbers manage their schedule, and admins have full control over the business.

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
- Anthropic Claude API (AI chatbot with tool use)

**Infrastructure**
- Database: Supabase (PostgreSQL)
- Backend: Azure App Service
- Frontend: Vercel
- CI/CD: GitHub Actions (auto-deploy on push to main)

## Features

### Clients
- Register and log in
- Book appointments: choose barber, base service + optional add-ons, date and time slot
- **Book via AI chatbot** — a floating chat widget guides the user through the entire booking process in natural language, querying real data from the database
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

## AI Chatbot

The chatbot uses **Claude's tool use** (function calling) to interact with the live database. Claude decides when to call each tool based on the conversation:

| Tool | What it does |
|------|-------------|
| `get_barberos` | Fetches available barbers |
| `get_servicios` | Fetches services for a selected barber |
| `get_huecos` | Fetches available time slots for a date |
| `crear_turno` | Creates the appointment in the database |

The backend executes each tool call against the database and returns the result to Claude, which then responds naturally to the user. Rate limited to 15 requests per user per hour.

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
- Anthropic API key (for the chatbot)

### Backend
```bash
cd backend/TurnoApp
docker compose up -d        # start PostgreSQL
dotnet run                  # API runs at http://localhost:5021
```

Add your Anthropic API key to `appsettings.json`:
```json
"Anthropic": {
  "ApiKey": "your-key-here"
}
```

### Frontend
```bash
cd frontend
npm install
npm run dev                 # runs at http://localhost:5173
```

API docs available at `http://localhost:5021/scalar/v1` in development.
