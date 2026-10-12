# FitFinance

FitFinance brings personal health and fitness spending, activity, basic metrics, and goals into one private dashboard. It is a personal tracking tool, not a medical product.

## Features

- Email/password registration and login with BCrypt and signed JWT authentication.
- One-tap guest access to a shared demo account; guest activity is shared and should be treated as temporary demo data.
- User-scoped expense, workout, health metric, goal, and budget records.
- Dashboard summaries for current-month spending and activity, budget utilization, category totals, and active goal progress.
- Responsive React dashboard with record creation, editing, deletion, and search.

## Stack and architecture

React, TypeScript, Vite, Tailwind CSS, Axios, Recharts; Java 25, Spring Boot 3, Spring Data JPA, Spring Security, JWT, Bean Validation; MySQL; Docker Compose.

The browser calls a REST API. Controllers delegate record operations to services, which use Spring Data repositories to persist user-owned rows in MySQL. JWT subject values identify the authenticated user; protected record operations do not accept user IDs from the client.

## Structure

```text
backend/    Spring Boot REST API
frontend/   React and TypeScript application
docker-compose.yml
```

## Run locally

Requirements: Java 24, Maven 3.9+, Node 20+, npm, and Docker Desktop (for the MySQL container). The root `.env` file is loaded by Docker Compose and by Spring Boot when started from `backend/`.

Start MySQL from a VS Code terminal at the repository root:

```powershell
docker compose up -d mysql
```

Start the backend in another terminal:

```powershell
cd backend
mvn spring-boot:run
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend is at `http://localhost:5173`; the API is at `http://localhost:8080`.

## Docker Compose

Copy `.env.example` to `.env`, set private values, then run:

```powershell
docker compose up --build
```

Open the app at `http://localhost:4173`. The API is available on port `8080`. MySQL is internal to the Compose network and its data is stored in the `fitfinance-data` volume.

## Environment variables

Backend supports `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (minimum 32 bytes), `JWT_EXPIRATION_MS`, `CORS_ALLOWED_ORIGIN`, `PORT`, and `DDL_AUTO`. The Vite client supports `VITE_API_BASE_URL`, defaulting to `http://localhost:8080/api`. Never use the example credentials or fallback JWT key outside local development.

## API overview

All endpoints except registration, login, and guest access require `Authorization: Bearer <token>`. JSON date values use `YYYY-MM-DD`. Record endpoints return records with `id`, `kind`, `title`, `date`, and applicable domain fields. Errors have `timestamp`, `status`, and `message`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register `{name,email,password}` |
| POST | `/api/auth/login` | Login `{email,password}` |
| POST | `/api/auth/guest` | Create/reuse the shared demo account and return a JWT; no request body is required |
| GET | `/api/dashboard` | Current month aggregates |
| GET, POST | `/api/expenses` | List or create expenses |
| GET, PUT, DELETE | `/api/expenses/{id}` | Read, update, or delete an owned expense |
| GET | `/api/budget?month=10&year=2026` | Get the owner’s budget for that month/year |
| POST | `/api/budget` | Create a budget record |
| GET, PUT, DELETE | `/api/budget/{id}` | Read, update, or delete an owned budget |
| GET, POST | `/api/workouts` | List or create workouts |
| GET, PUT, DELETE | `/api/workouts/{id}` | Read, update, or delete an owned workout |
| GET, POST | `/api/health-metrics` | List or create metrics |
| GET, PUT, DELETE | `/api/health-metrics/{id}` | Read, update, or delete an owned metric |
| GET, POST | `/api/goals` | List or create goals |
| GET, PUT, DELETE | `/api/goals/{id}` | Read, update, or delete an owned goal |

Record create/update requests use `title`, `date`, `description`, and relevant typed fields: `amount`, `category`, `durationMinutes`, `caloriesBurned`, `weight`, `steps`, `calories`, `targetValue`, `currentValue`, `unit`, `deadline`, `status`. For example, an expense needs title, positive amount, category, and date. A workout needs title, category (workout type), date, and duration.

## Database

`users` stores unique normalized emails and BCrypt password hashes. `entries` stores the supported record types, each linked to one user by a non-null foreign key and indexed by owner, kind, and date. Application reads and writes constrain the owner and kind. Hibernate schema management defaults to `update`; use an external migration tool and a managed database for production deployments.

## Checks

```powershell
cd backend; mvn clean test; mvn clean package
cd frontend; npm install; npm run lint; npm run build
docker compose up --build
```

## AWS preparation

The containers accept environment-based database, JWT, CORS, and port configuration, so they can be deployed behind AWS container hosting with a managed MySQL-compatible database. No AWS service is needed for local development.

## Screenshots

Add application screenshots here when available.
