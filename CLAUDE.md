# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project: Simple TypeScript REST API (MVP)

## Overview
A minimal TypeScript REST API providing basic CRUD operations: Create (add), Read, Update, Delete.
Goal is a working MVP — keep it simple, avoid over-engineering.

## Tech Stack
- Language: TypeScript
- Runtime: Node.js
- Framework: Express
- Data storage: **MySQL** (running via existing Docker container)
- DB access: `mysql2` package (with connection pool)
- Package manager: npm

## Project Structure
```
src/
  index.ts         # App entry point, server setup
  db.ts            # MySQL connection pool setup
  routes.ts        # API route definitions
  controller.ts    # Request handlers (add/update/delete/get logic)
  types.ts         # Shared TypeScript types/interfaces
.env               # DB connection config (not committed)
```

## Database
- MySQL runs via `docker-compose.yml` in this repo (services: `mysql`, plus `adminer` and `phpmyadmin` for browsing the db)
- Start it with `docker compose up -d` before running the app
- Connection details go in `.env`, matching `docker-compose.yml`:
  ```
  DB_HOST=localhost
  DB_PORT=3307
  DB_USER=itemapi
  DB_PASSWORD=change-me
  DB_NAME=ItemApi
  ```
- Host ports are remapped (3307/8082/8083) because 3306/8080/8081 are already used by other containers on this machine
- Adminer: http://localhost:8082 · phpMyAdmin: http://localhost:8083
- Table schema (example — adjust as needed):
  ```sql
  CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
  ```

## API Endpoints (MVP scope)
- `POST   /items`         — Add a new item
- `GET    /items`         — List all items
- `GET    /items/:id`     — Get a single item by id
- `PUT    /items/:id`     — Update an existing item
- `DELETE /items/:id`     — Delete an item

## Conventions
- Use TypeScript strict mode (`strict: true` in tsconfig.json)
- Keep route handlers thin — logic lives in controller functions
- All DB queries use parameterized queries (never string-concatenate SQL — avoid injection)
- Return consistent JSON response shape:
  ```json
  { "success": true, "data": {} }
  { "success": false, "error": "message" }
  ```
- Use proper HTTP status codes (200, 201, 400, 404, 500)

## Commands
```bash
docker compose up -d   # start MySQL, Adminer, phpMyAdmin
npm install             # install dependencies
npm run dev              # run in dev mode (tsx watch)
npm run build             # compile TypeScript to dist/
npm start                # run compiled build
```

## Notes for Claude
- MySQL is defined in `docker-compose.yml` — start it with `docker compose up -d`, don't reintroduce in-memory storage.
- Keep this MVP simple — no auth, no ORM (use raw `mysql2` queries) unless asked.
- Prioritize a working, testable API over premature architecture.
- When adding a new feature, update this file's endpoint list or schema if it changes.
