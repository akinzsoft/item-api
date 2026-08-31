# Plan: Simple TypeScript REST API (MVP) — MySQL Storage

## Goal
Ship a working MVP REST API with add, get, update, and delete operations, backed by the existing MySQL Docker container.

## Phase 1 — Project Setup
- [ ] Initialize npm project (`npm init -y`)
- [ ] Install dependencies: `express`, `typescript`, `tsx`, `mysql2`, `dotenv`, `@types/node`, `@types/express`
- [ ] Create `tsconfig.json` (strict mode on)
- [ ] Set up folder structure: `src/index.ts`, `src/db.ts`, `src/routes.ts`, `src/controller.ts`, `src/types.ts`
- [ ] Create `.env` with DB connection details (host, port, user, password, database)
- [ ] Add `.env` to `.gitignore`
- [ ] Add npm scripts: `dev`, `build`, `start`

## Phase 2 — Database Connection
- [ ] Start MySQL via `docker compose up -d` and confirm it's reachable (`docker ps`)
- [ ] Create `items` table (see schema in CLAUDE.md) — run manually or via a simple init script
- [ ] Set up `mysql2` connection pool in `src/db.ts`
- [ ] Test connection on app startup (fail fast with clear error if DB unreachable)

## Phase 3 — Core API
- [ ] Define `Item` type in `types.ts`
- [ ] Set up Express app + JSON middleware in `index.ts`
- [ ] Build routes, each backed by real MySQL queries:
  - [ ] `POST /items` — insert new row
  - [ ] `GET /items` — select all rows
  - [ ] `GET /items/:id` — select one row by id
  - [ ] `PUT /items/:id` — update row by id
  - [ ] `DELETE /items/:id` — delete row by id
- [ ] Use parameterized queries throughout (no raw string concatenation)
- [ ] Standardize JSON response shape (success/error)
- [ ] Add basic input validation (required fields, id exists checks, 404 on missing rows)

## Phase 4 — Testing & Polish
- [ ] Manually test each endpoint against real DB (curl or Postman/Thunder Client)
- [ ] Add proper HTTP status codes (201 on create, 404 on not found, 500 on DB errors, etc.)
- [ ] Add basic error handling middleware (catch DB connection errors gracefully)
- [ ] Write a short README with setup steps, .env example, and example requests

## Phase 5 — Optional Next Steps (post-MVP)
- [ ] Add request validation library (e.g. zod)
- [ ] Add basic tests (Jest or Vitest) with a test DB/schema
- [ ] Add migrations tool (e.g. Knex or a simple SQL migration script) instead of manual table creation
- [ ] Add authentication if needed

## Notes
- MySQL is provisioned via `docker-compose.yml` in this repo — run `docker compose up -d` to start it.
- Keep each phase small and shippable — don't jump ahead to Phase 5 items before Phase 3/4 work.
- Reference `CLAUDE.md` for tech stack, conventions, schema, and endpoint contract.
- Update the checkboxes here as work progresses so project status stays visible.
