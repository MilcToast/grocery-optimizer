# AGENTS.md

## Project overview
This repository contains a small TypeScript full-stack app for grocery-store recommendations. The backend exposes a recommendation API and the frontend is a React + Vite UI.

## Architecture
- Backend entrypoint: [backend/src/server.ts](backend/src/server.ts)
- Recommendation logic: [backend/src/services/recommendationService.ts](backend/src/services/recommendationService.ts)
- Database access: [backend/src/repositories](backend/src/repositories)
- Shared helpers: [backend/src/utils](backend/src/utils)
- Frontend app: [frontend/src](frontend/src)

## Working conventions
- Keep changes small, explicit, and TypeScript-first.
- Follow the existing layering: repositories for database access, services for business logic, and utils for helpers.
- Preserve the current API behavior unless the task explicitly requires a change.
- If you change the data model or seed data, update both [backend/schema.sql](backend/schema.sql) and [backend/seed.sql](backend/seed.sql).
- Prefer simple, readable code over introducing new abstractions.

## Common commands
- Backend:
  - `cd backend`
  - `npm install`
  - `npx tsx src/server.ts`
- Frontend:
  - `cd frontend`
  - `npm run dev`
  - `npm run build`
  - `npm run lint`

## Useful references
- Setup and API details: [README.md](README.md)
- Database connection: [backend/src/db.ts](backend/src/db.ts)
- Distance calculation helper: [backend/src/utils/distance.ts](backend/src/utils/distance.ts)
