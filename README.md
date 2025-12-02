# MyCampusSwap (York University Marketplace)

Peer-to-peer campus marketplace for York University students to list, browse, and request items (textbooks, electronics, furniture, etc.). Built as a learning project following MVC, DAO, and clean separation of front-end and back-end.

## Monorepo Structure

```
mycampusswap/
	frontend/ (implicit root React app - current Vite setup)
	src/ (React source)
	backend/
		src/
			server.js        (entry point)
			app.js           (Express app wiring)
			routes/          (API route modules)
			config/db.js     (PostgreSQL pool + helpers)
```

## Tech Stack
- Front-end: React (Vite) + future additions (Router, state management)
- Back-end: Node.js + Express + PostgreSQL (DAO pattern)
- Auth: Email/password (York verification constraint planned)
- Deployment Targets: Vercel (frontend) + Railway/Render (backend + Postgres)

## Getting Started (Backend)

Create a `.env` in `backend/`:
```
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=youruser
DB_PASSWORD=yourpassword
DB_NAME=mycampusswap
DB_SSL=false
JWT_SECRET=replace_this_with_a_long_random_string
```

Install backend deps:
```
cd backend
npm install
npm run dev
```
Health check: visit `http://localhost:4000/api/health`

## Scripts
- Front-end dev: `npm run dev` (from root)
- Back-end dev: `cd backend && npm run dev`

## Architecture Notes
We will incrementally add layers:
1. Models & DAOs (data access encapsulation)
2. Services (business logic: listing approval, request flows)
3. Controllers (HTTP handling)
4. Routes (maps endpoints to controllers)

## Deployment Plan (High Level)
Frontend on Vercel (auto-build from GitHub). Backend + Postgres on Railway or Render with environment variables. CORS restricted to frontend domain.

## Next Steps
- Define database schema tables (users, listings, listing_images, requests, transactions, user_sessions, admin_actions)
- Implement migrations and seed data.

## Implemented So Far (Backend)
- Express server with `/api/health` endpoint.
- PostgreSQL connection via pool.
- Initial schema migration `001_initial.sql` (users, categories, listings, requests, transactions, reviews, admin log).
- User DAO (`userDao.js`): create & lookup.
- Auth service (`authService.js`): register + login with bcrypt + JWT.
- Auth routes (`/api/auth/register`, `/api/auth/login`).
- Auth middleware (`requireAuth`, `requireAdmin`).

## Usage Examples (HTTP)
Register:
POST `/api/auth/register`
Body: `{ "email": "student@yorku.ca", "displayName": "Alice", "password": "Secret123" }`

Login:
POST `/api/auth/login`
Body: `{ "email": "student@yorku.ca", "password": "Secret123" }`
Response includes `token` for Authorization header: `Bearer <token>`.

## Upcoming Work
- Listing DAO + service (create listing pending approval).
- Admin approval endpoint.
- Buy request workflow.
- Basic error handling & validation layer.

---
This README will evolve as features are implemented. Each change will be documented so the reasoning is clear for presentation.
